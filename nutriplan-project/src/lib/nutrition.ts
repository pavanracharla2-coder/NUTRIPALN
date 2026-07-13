// Calorie & macro estimation engine.
// Combines Mifflin-St Jeor BMR with activity multipliers and goal-based
// calorie adjustment, then derives macro split based on goal & conditions.
// This is the "ML pipeline" surface — the same interface can be backed by a
// regression model later without changing callers.

export type Sex = "male" | "female" | "other";
export type Activity = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain" | "recomp";

export interface ProfileInput {
  age: number;
  sex: Sex;
  height_cm: number;
  weight_kg: number;
  activity_level: Activity;
  goal: Goal;
  weekly_pace_kg?: number;
  medical_conditions?: string[];
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  calorie_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  rationale: string;
}

const ACTIVITY: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export function mifflinStJeor(p: ProfileInput): number {
  const s = p.sex === "female" ? -161 : 5;
  return Math.round(10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + s);
}

export function computeTargets(p: ProfileInput): NutritionTargets {
  const bmr = mifflinStJeor(p);
  const tdee = Math.round(bmr * ACTIVITY[p.activity_level]);

  const pace = Math.min(Math.max(p.weekly_pace_kg ?? 0.5, 0.25), 1);
  // 1 kg fat ≈ 7700 kcal — daily deficit/surplus
  const delta = Math.round((pace * 7700) / 7);

  let calorie_target = tdee;
  let goalNote = "maintenance calories";
  if (p.goal === "lose") { calorie_target = tdee - delta; goalNote = `${pace} kg/week deficit`; }
  if (p.goal === "gain") { calorie_target = tdee + delta; goalNote = `${pace} kg/week surplus`; }
  if (p.goal === "recomp") { calorie_target = tdee - 150; goalNote = "slight deficit for recomposition"; }

  // Safety floor
  const floor = p.sex === "female" ? 1200 : 1500;
  if (calorie_target < floor) calorie_target = floor;

  const conds = (p.medical_conditions ?? []).map((c) => c.toLowerCase());
  // Macro split — adjusted by goal and conditions
  let pPct = 0.3, cPct = 0.4, fPct = 0.3;
  if (p.goal === "lose" || p.goal === "recomp") { pPct = 0.35; cPct = 0.35; fPct = 0.3; }
  if (p.goal === "gain") { pPct = 0.25; cPct = 0.5; fPct = 0.25; }
  if (conds.includes("diabetes")) { cPct = 0.3; fPct = 0.35; pPct = 0.35; }
  if (conds.includes("heart") || conds.includes("hypertension")) { fPct = 0.25; cPct = 0.5; pPct = 0.25; }

  const protein_g = Math.round((calorie_target * pPct) / 4);
  const carbs_g = Math.round((calorie_target * cPct) / 4);
  const fat_g = Math.round((calorie_target * fPct) / 9);
  const fiber_g = Math.max(25, Math.round(calorie_target / 1000 * 14));

  const rationale =
    `Mifflin-St Jeor BMR ${bmr} kcal × ${ACTIVITY[p.activity_level]} activity = TDEE ${tdee}. ` +
    `Goal: ${goalNote}. Macros split ${Math.round(pPct*100)}P / ${Math.round(cPct*100)}C / ${Math.round(fPct*100)}F` +
    (conds.length ? ` (adjusted for ${conds.join(", ")})` : "") + ".";

  return { bmr, tdee, calorie_target, protein_g, carbs_g, fat_g, fiber_g, rationale };
}

export function bmi(weight_kg: number, height_cm: number): number {
  const m = height_cm / 100;
  return +(weight_kg / (m * m)).toFixed(1);
}

export function bmiCategory(b: number): string {
  if (b < 18.5) return "Underweight";
  if (b < 25) return "Healthy";
  if (b < 30) return "Overweight";
  return "Obese";
}
