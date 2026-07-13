import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { computeTargets } from "@/lib/nutrition";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — NutriPlan" }] }),
  component: () => <AuthGate><AppShell><Onboarding /></AppShell></AuthGate>,
});

const ALLERGENS = ["nuts", "dairy", "gluten", "soy", "eggs", "fish", "shellfish"];
const CONDITIONS = ["diabetes", "hypertension", "heart", "pcos"];

function Onboarding() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    full_name: "", age: 30, sex: "male" as "male"|"female"|"other",
    height_cm: 175, weight_kg: 75, target_weight_kg: 72,
    activity_level: "moderate" as const, goal: "maintain" as "lose"|"maintain"|"gain"|"recomp",
    weekly_pace_kg: 0.5,
    diet_type: "omnivore" as const,
    allergies: [] as string[], medical_conditions: [] as string[],
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggle = (k: "allergies"|"medical_conditions", v: string) =>
    setF((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x=>x!==v) : [...p[k], v] }));

  const submit = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const targets = computeTargets({
        age: f.age, sex: f.sex, height_cm: f.height_cm, weight_kg: f.weight_kg,
        activity_level: f.activity_level, goal: f.goal, weekly_pace_kg: f.weekly_pace_kg,
        medical_conditions: f.medical_conditions,
      });
      const { error: e1 } = await supabase.from("profiles").update({
        full_name: f.full_name, age: f.age, sex: f.sex,
        height_cm: f.height_cm, weight_kg: f.weight_kg, target_weight_kg: f.target_weight_kg,
        activity_level: f.activity_level, goal: f.goal, weekly_pace_kg: f.weekly_pace_kg,
        onboarded: true,
      }).eq("id", user.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("dietary_preferences").upsert({
        user_id: user.id, diet_type: f.diet_type,
        allergies: f.allergies, medical_conditions: f.medical_conditions,
      });
      if (e2) throw e2;
      const { error: e3 } = await supabase.from("nutrition_targets").upsert({ user_id: user.id, ...targets });
      if (e3) throw e3;
      await supabase.from("weight_logs").upsert({ user_id: user.id, weight_kg: f.weight_kg });
      toast.success("All set! Generating your plan…");
      nav({ to: "/dashboard" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) set("full_name", data.full_name);
    });
  }, [user]);

  const steps = [
    {
      title: "About you",
      content: (
        <div className="space-y-4">
          <div><Label>Name</Label><Input value={f.full_name} onChange={e=>set("full_name", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Age</Label><Input type="number" value={f.age} onChange={e=>set("age", +e.target.value)} /></div>
            <div><Label>Sex</Label>
              <Select value={f.sex} onValueChange={(v) => set("sex", v as typeof f.sex)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Height (cm)</Label><Input type="number" value={f.height_cm} onChange={e=>set("height_cm", +e.target.value)} /></div>
            <div><Label>Weight (kg)</Label><Input type="number" value={f.weight_kg} onChange={e=>set("weight_kg", +e.target.value)} /></div>
          </div>
        </div>
      ),
    },
    {
      title: "Goal & activity",
      content: (
        <div className="space-y-4">
          <div><Label>Goal</Label>
            <Select value={f.goal} onValueChange={(v) => set("goal", v as typeof f.goal)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="lose">Lose weight</SelectItem>
                <SelectItem value="maintain">Maintain</SelectItem>
                <SelectItem value="gain">Gain weight</SelectItem>
                <SelectItem value="recomp">Body recomposition</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Target weight (kg)</Label><Input type="number" value={f.target_weight_kg} onChange={e=>set("target_weight_kg", +e.target.value)} /></div>
          <div><Label>Weekly pace (kg)</Label><Input type="number" step="0.25" value={f.weekly_pace_kg} onChange={e=>set("weekly_pace_kg", +e.target.value)} /></div>
          <div><Label>Activity level</Label>
            <Select value={f.activity_level} onValueChange={(v) => set("activity_level", v as typeof f.activity_level)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (desk, little exercise)</SelectItem>
                <SelectItem value="light">Light (1–3 days/wk)</SelectItem>
                <SelectItem value="moderate">Moderate (3–5 days/wk)</SelectItem>
                <SelectItem value="active">Active (6–7 days/wk)</SelectItem>
                <SelectItem value="very_active">Very active (athlete)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "Diet, allergies & conditions",
      content: (
        <div className="space-y-4">
          <div><Label>Diet type</Label>
            <Select value={f.diet_type} onValueChange={(v) => set("diet_type", v as typeof f.diet_type)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                {["omnivore","vegetarian","vegan","pescatarian","keto","mediterranean","paleo"].map(d=>(
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Allergies</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {ALLERGENS.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={f.allergies.includes(a)} onCheckedChange={()=>toggle("allergies", a)} />
                  {a}
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label>Medical conditions</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {CONDITIONS.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={f.medical_conditions.includes(c)} onCheckedChange={()=>toggle("medical_conditions", c)} />
                  {c}
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <Progress value={((step+1)/steps.length)*100} className="mb-6" />
      <Card className="p-6">
        <h2 className="text-xl font-semibold">{steps[step].title}</h2>
        <div className="mt-5">{steps[step].content}</div>
        <div className="mt-6 flex justify-between">
          <Button variant="ghost" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Back</Button>
          {step < steps.length-1 ? (
            <Button onClick={()=>setStep(s=>s+1)}>Continue</Button>
          ) : (
            <Button onClick={submit} disabled={busy}>{busy ? <Loader2 className="size-4 animate-spin"/> : "Generate my plan"}</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
