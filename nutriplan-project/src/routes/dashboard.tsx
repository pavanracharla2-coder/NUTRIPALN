import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { recommendDailyPlan, planTotals, type Food } from "@/lib/recommend";
import { Apple, Flame, Beef, Wheat, Droplet, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Today — NutriPlan" }] }),
  component: () => <AuthGate><AppShell><Dashboard /></AppShell></AuthGate>,
});

function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const prefs = useQuery({
    queryKey: ["prefs", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("dietary_preferences").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const targets = useQuery({
    queryKey: ["targets", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("nutrition_targets").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
  });
  const foods = useQuery({
    queryKey: ["foods"],
    queryFn: async () => {
      const { data, error } = await supabase.from("foods").select("*");
      if (error) throw error;
      return data as unknown as Food[];
    },
  });

  useEffect(() => {
    if (profile.data && !profile.data.onboarded) nav({ to: "/onboarding" });
  }, [profile.data, nav]);

  const plan = useMemo(() => {
    if (!foods.data || !prefs.data || !targets.data) return null;
    const seed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return recommendDailyPlan(
      foods.data, prefs.data as never,
      targets.data as never, seed,
    );
  }, [foods.data, prefs.data, targets.data]);

  const totals = plan ? planTotals(plan) : null;

  if (profile.isLoading || prefs.isLoading || targets.isLoading || foods.isLoading) {
    return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground"/></div>;
  }

  if (!targets.data) {
    return <div className="container mx-auto max-w-xl p-8 text-center">
      <p>Let's set up your profile first.</p>
      <Button asChild className="mt-4"><Link to="/onboarding">Start onboarding</Link></Button>
    </div>;
  }

  const t = targets.data;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Hello{profile.data?.full_name ? `, ${profile.data.full_name}` : ""} 👋</h1>
        <p className="text-muted-foreground">Here's your personalized plan for today.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Flame} label="Calories" value={Math.round(totals?.calories ?? 0)} target={t.calorie_target} unit="kcal" />
        <Stat icon={Beef} label="Protein" value={Math.round(totals?.protein ?? 0)} target={t.protein_g} unit="g" />
        <Stat icon={Wheat} label="Carbs" value={Math.round(totals?.carbs ?? 0)} target={t.carbs_g} unit="g" />
        <Stat icon={Droplet} label="Fat" value={Math.round(totals?.fat ?? 0)} target={t.fat_g} unit="g" />
      </div>

      <Card className="p-4 bg-secondary/40">
        <div className="flex items-start gap-3">
          <Sparkles className="size-5 text-primary mt-0.5"/>
          <div className="text-sm">
            <div className="font-medium">Why these numbers</div>
            <div className="text-muted-foreground mt-1">{t.rationale}</div>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {plan?.map((p) => (
          <Card key={p.meal_type + p.food.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div className="size-12 rounded-lg bg-secondary grid place-items-center text-secondary-foreground">
              <Apple className="size-6"/>
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">{p.meal_type}</div>
              <div className="font-semibold">{p.food.name}</div>
              <div className="text-sm text-muted-foreground mt-1">{p.reason}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{Math.round(p.food.calories)} kcal</div>
              <div className="text-xs text-muted-foreground">
                P {Math.round(p.food.protein_g)} · C {Math.round(p.food.carbs_g)} · F {Math.round(p.food.fat_g)}
              </div>
              <Button size="sm" variant="outline" className="mt-2" asChild>
                <Link to="/log">Log this</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, target, unit }: { icon: React.ElementType; label: string; value: number; target: number; unit: string }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-4"/>{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}<span className="text-sm text-muted-foreground"> / {target} {unit}</span></div>
      <Progress value={pct} className="mt-2"/>
    </Card>
  );
}
