// Hybrid recommendation engine:
// 1. Hard rule-based filtering for safety (allergies, diet type, medical avoid_for).
// 2. Soft scoring (ranking) on remaining candidates by:
//    - macro fit to remaining day budget
//    - condition match bonus
//    - diversity penalty (avoid repeating a food in the same day)
// 3. Greedy fill across breakfast/lunch/dinner/snack to approximate the
//    daily calorie/macro target while keeping the plan balanced.
// Every recommendation includes a human-readable reason.

import type { NutritionTargets } from "./nutrition";

export interface Food {
  id: string;
  name: string;
  meal_types: string[];
  serving_label: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  diet_tags: string[];
  allergens: string[];
  good_for: string[];
  avoid_for: string[];
  cuisine: string | null;
}

export interface UserPrefs {
  diet_type: string;
  allergies: string[];
  dislikes: string[];
  medical_conditions: string[];
  cuisine_preferences: string[];
}

export interface PlanItem {
  food: Food;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  servings: number;
  score: number;
  reason: string;
}

const DIET_REQUIRED_TAG: Record<string, string | null> = {
  omnivore: null,
  vegetarian: "vegetarian",
  vegan: "vegan",
  pescatarian: null,
  keto: "keto",
  mediterranean: null,
  paleo: null,
};

export function safeCandidates(foods: Food[], prefs: UserPrefs): Food[] {
  const required = DIET_REQUIRED_TAG[prefs.diet_type] ?? null;
  const allergyLower = prefs.allergies.map((a) => a.toLowerCase());
  const condsLower = prefs.medical_conditions.map((c) => c.toLowerCase());
  const dislikesLower = prefs.dislikes.map((d) => d.toLowerCase());

  return foods.filter((f) => {
    if (required && !f.diet_tags.includes(required)) return false;
    if (prefs.diet_type === "pescatarian") {
      // Pescatarian: no meat (vegetarian OR contains fish/shellfish)
      const hasMeat = !f.diet_tags.includes("vegetarian") &&
        !f.allergens.includes("fish") && !f.allergens.includes("shellfish");
      if (hasMeat) return false;
    }
    if (f.allergens.some((a) => allergyLower.includes(a.toLowerCase()))) return false;
    if (f.avoid_for.some((c) => condsLower.includes(c.toLowerCase()))) return false;
    if (dislikesLower.some((d) => f.name.toLowerCase().includes(d))) return false;
    return true;
  });
}

interface Budget {
  cal: number; p: number; c: number; f: number;
}

function scoreFor(food: Food, mealBudget: Budget, prefs: UserPrefs, used: Set<string>): number {
  if (used.has(food.id)) return -Infinity;

  // Macro fit: closer to budget = higher
  const calFit = 1 - Math.min(1, Math.abs(food.calories - mealBudget.cal) / Math.max(mealBudget.cal, 1));
  const pFit = 1 - Math.min(1, Math.abs(food.protein_g - mealBudget.p) / Math.max(mealBudget.p, 1));
  let score = calFit * 0.55 + pFit * 0.25;

  // Condition match bonus
  const condsLower = prefs.medical_conditions.map((c) => c.toLowerCase());
  const condMatch = food.good_for.filter((g) => condsLower.includes(g.toLowerCase())).length;
  score += condMatch * 0.08;

  // Cuisine preference
  if (food.cuisine && prefs.cuisine_preferences.includes(food.cuisine)) score += 0.05;

  // High-protein nudge if goal-driven (protein target relatively high)
  if (food.diet_tags.includes("high_protein")) score += 0.04;
  if (food.diet_tags.includes("high_fiber")) score += 0.03;

  return score;
}

function reasonFor(food: Food, prefs: UserPrefs, mealBudget: Budget): string {
  const reasons: string[] = [];
  const condsLower = prefs.medical_conditions.map((c) => c.toLowerCase());
  const condMatch = food.good_for.filter((g) => condsLower.includes(g.toLowerCase()));
  if (condMatch.length) reasons.push(`supports ${condMatch.join(", ")}`);
  if (food.diet_tags.includes("high_protein")) reasons.push("high protein");
  if (food.diet_tags.includes("high_fiber")) reasons.push("high fiber");
  if (prefs.diet_type !== "omnivore" && food.diet_tags.includes(prefs.diet_type)) {
    reasons.push(`${prefs.diet_type}-friendly`);
  }
  const calDiff = Math.abs(food.calories - mealBudget.cal);
  if (calDiff < mealBudget.cal * 0.2) reasons.push(`fits your ~${mealBudget.cal} kcal slot`);
  if (food.cuisine && prefs.cuisine_preferences.includes(food.cuisine)) {
    reasons.push(`${food.cuisine} cuisine you enjoy`);
  }
  return reasons.length ? `Picked because it's ${reasons.join(", ")}.` : "Balanced choice for this meal.";
}

const MEAL_SPLIT: Array<[PlanItem["meal_type"], number]> = [
  ["breakfast", 0.25],
  ["lunch", 0.35],
  ["dinner", 0.3],
  ["snack", 0.1],
];

export function recommendDailyPlan(
  foods: Food[],
  prefs: UserPrefs,
  targets: NutritionTargets,
  seed = 0,
): PlanItem[] {
  const candidates = safeCandidates(foods, prefs);
  const used = new Set<string>();
  const plan: PlanItem[] = [];

  for (const [meal, pct] of MEAL_SPLIT) {
    const budget: Budget = {
      cal: targets.calorie_target * pct,
      p: targets.protein_g * pct,
      c: targets.carbs_g * pct,
      f: targets.fat_g * pct,
    };
    const pool = candidates.filter((f) => f.meal_types.includes(meal));
    if (pool.length === 0) continue;

    const ranked = pool
      .map((f) => ({ f, s: scoreFor(f, budget, prefs, used) + ((hash(f.id + seed) % 100) / 1000) }))
      .sort((a, b) => b.s - a.s);

    const pick = ranked[0];
    if (!pick) continue;
    used.add(pick.f.id);
    plan.push({
      food: pick.f,
      meal_type: meal,
      servings: 1,
      score: +pick.s.toFixed(3),
      reason: reasonFor(pick.f, prefs, budget),
    });
  }
  return plan;
}

export function planTotals(plan: PlanItem[]) {
  return plan.reduce(
    (acc, i) => ({
      calories: acc.calories + i.food.calories * i.servings,
      protein: acc.protein + i.food.protein_g * i.servings,
      carbs: acc.carbs + i.food.carbs_g * i.servings,
      fat: acc.fat + i.food.fat_g * i.servings,
      fiber: acc.fiber + i.food.fiber_g * i.servings,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
