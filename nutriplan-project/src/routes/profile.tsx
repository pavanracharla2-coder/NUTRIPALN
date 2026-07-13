import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { bmi, bmiCategory } from "@/lib/nutrition";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — NutriPlan" }] }),
  component: () => <AuthGate><AppShell><Profile /></AppShell></AuthGate>,
});

function Profile() {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey: ["profile", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });
  const prefs = useQuery({
    queryKey: ["prefs", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("dietary_preferences").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const targets = useQuery({
    queryKey: ["targets", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("nutrition_targets").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });

  const p = profile.data;
  const b = p?.height_cm && p?.weight_kg ? bmi(+p.weight_kg, +p.height_cm) : null;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button asChild variant="outline"><Link to="/onboarding">Edit</Link></Button>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">{p?.full_name || "—"}</h2>
        <div className="text-sm text-muted-foreground">{user?.email}</div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Info label="Age" value={p?.age ?? "—"}/>
          <Info label="Sex" value={p?.sex ?? "—"}/>
          <Info label="Height" value={p?.height_cm ? `${p.height_cm} cm` : "—"}/>
          <Info label="Weight" value={p?.weight_kg ? `${p.weight_kg} kg` : "—"}/>
          <Info label="Goal" value={p?.goal ?? "—"}/>
          <Info label="Activity" value={p?.activity_level ?? "—"}/>
          <Info label="BMI" value={b ? `${b} (${bmiCategory(b)})` : "—"}/>
          <Info label="Target" value={p?.target_weight_kg ? `${p.target_weight_kg} kg` : "—"}/>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Diet & restrictions</h2>
        <div className="mt-3 text-sm space-y-2">
          <div><span className="text-muted-foreground">Diet:</span> {prefs.data?.diet_type ?? "—"}</div>
          <div><span className="text-muted-foreground">Allergies:</span> {prefs.data?.allergies?.join(", ") || "none"}</div>
          <div><span className="text-muted-foreground">Conditions:</span> {prefs.data?.medical_conditions?.join(", ") || "none"}</div>
        </div>
      </Card>

      {targets.data && (
        <Card className="p-5">
          <h2 className="font-semibold">Daily targets</h2>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <Info label="Calories" value={`${targets.data.calorie_target} kcal`}/>
            <Info label="Protein" value={`${targets.data.protein_g} g`}/>
            <Info label="Carbs" value={`${targets.data.carbs_g} g`}/>
            <Info label="Fat" value={`${targets.data.fat_g} g`}/>
            <Info label="BMR" value={`${targets.data.bmr} kcal`}/>
            <Info label="TDEE" value={`${targets.data.tdee} kcal`}/>
            <Info label="Fiber" value={`${targets.data.fiber_g} g`}/>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{targets.data.rationale}</p>
        </Card>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-medium">{value}</div></div>;
}
