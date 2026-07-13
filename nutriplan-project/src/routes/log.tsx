import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/AuthGate";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/log")({
  head: () => ({ meta: [{ title: "Food log — NutriPlan" }] }),
  component: () => <AuthGate><AppShell><Log /></AppShell></AuthGate>,
});

type MealType = "breakfast"|"lunch"|"dinner"|"snack";

function Log() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [meal, setMeal] = useState<MealType>("breakfast");

  const foods = useQuery({
    queryKey: ["foods", q],
    queryFn: async () => {
      let qb = supabase.from("foods").select("*").limit(20);
      if (q) qb = qb.ilike("name", `%${q}%`);
      const { data } = await qb;
      return data ?? [];
    },
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const logs = useQuery({
    queryKey: ["logs", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("food_logs")
        .select("*, foods(*)")
        .eq("user_id", user!.id)
        .gte("logged_at", today.toISOString())
        .order("logged_at", { ascending: false });
      return data ?? [];
    },
  });

  const add = async (food_id: string) => {
    if (!user) return;
    const { error } = await supabase.from("food_logs").insert({ user_id: user.id, food_id, meal_type: meal, servings: 1 });
    if (error) toast.error(error.message); else { toast.success("Logged"); qc.invalidateQueries({ queryKey: ["logs"] }); }
  };
  const remove = async (id: string) => {
    await supabase.from("food_logs").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["logs"] });
  };

  const dayTotals = (logs.data ?? []).reduce((a: { c:number;p:number;cc:number;f:number }, l: { servings: number; foods: { calories: number; protein_g: number; carbs_g: number; fat_g: number } | null }) => ({
    c: a.c + (l.foods?.calories ?? 0) * l.servings,
    p: a.p + (l.foods?.protein_g ?? 0) * l.servings,
    cc: a.cc + (l.foods?.carbs_g ?? 0) * l.servings,
    f: a.f + (l.foods?.fat_g ?? 0) * l.servings,
  }), { c: 0, p: 0, cc: 0, f: 0 });

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Food log</h1>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <Input placeholder="Search foods…" value={q} onChange={(e)=>setQ(e.target.value)} className="flex-1"/>
          <Select value={meal} onValueChange={(v)=>setMeal(v as MealType)}>
            <SelectTrigger className="w-40"><SelectValue/></SelectTrigger>
            <SelectContent>
              {(["breakfast","lunch","dinner","snack"] as const).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 grid md:grid-cols-2 gap-2">
          {foods.data?.map((f) => (
            <div key={f.id} className="flex items-center justify-between border rounded-md p-2">
              <div>
                <div className="text-sm font-medium">{f.name}</div>
                <div className="text-xs text-muted-foreground">{f.calories} kcal · P{f.protein_g} C{f.carbs_g} F{f.fat_g}</div>
              </div>
              <Button size="sm" onClick={()=>add(f.id)}>Add</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Today</h2>
          <div className="text-sm text-muted-foreground">{Math.round(dayTotals.c)} kcal · P{Math.round(dayTotals.p)} C{Math.round(dayTotals.cc)} F{Math.round(dayTotals.f)}</div>
        </div>
        <div className="mt-3 space-y-2">
          {logs.data?.length === 0 && <div className="text-sm text-muted-foreground">No entries yet today.</div>}
          {logs.data?.map((l) => (
            <div key={l.id} className="flex items-center justify-between border rounded-md p-2">
              <div>
                <div className="text-sm font-medium">{l.foods?.name}</div>
                <div className="text-xs text-muted-foreground">{l.meal_type} · {l.servings} serving</div>
              </div>
              <Button size="icon" variant="ghost" onClick={()=>remove(l.id)}><Trash2 className="size-4"/></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
