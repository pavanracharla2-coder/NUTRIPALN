import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { recommendDailyPlan, type Food } from "@/lib/recommend";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Weekly plan — NutriPlan" }] }),
  component: () => <AuthGate><AppShell><Planner /></AppShell></AuthGate>,
});

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function Planner() {
  const { user } = useAuth();
  const prefs = useQuery({
    queryKey: ["prefs", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("dietary_preferences").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const targets = useQuery({
    queryKey: ["targets", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("nutrition_targets").select("*").eq("user_id", user!.id).maybeSingle()).data,
  });
  const foods = useQuery({
    queryKey: ["foods-all"],
    queryFn: async () => (await supabase.from("foods").select("*")).data as unknown as Food[],
  });

  const week = useMemo(() => {
    if (!foods.data || !prefs.data || !targets.data) return null;
    return DAYS.map((_, i) => recommendDailyPlan(foods.data!, prefs.data as never, targets.data as never, i + 1));
  }, [foods.data, prefs.data, targets.data]);

  if (!week) return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="size-6 animate-spin text-muted-foreground"/></div>;

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-6xl space-y-4">
      <h1 className="text-2xl font-bold">Your 7-day plan</h1>
      <div className="grid md:grid-cols-7 gap-3">
        {week.map((day, i) => (
          <Card key={i} className="p-3">
            <div className="font-semibold text-sm mb-2">{DAYS[i]}</div>
            <div className="space-y-2">
              {day.map((p) => (
                <div key={p.meal_type + p.food.id} className="text-xs border rounded p-2">
                  <div className="uppercase text-[10px] text-muted-foreground">{p.meal_type}</div>
                  <div className="font-medium">{p.food.name}</div>
                  <div className="text-muted-foreground">{Math.round(p.food.calories)} kcal</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
