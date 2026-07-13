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
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/progress")({
  head: () => ({ meta: [{ title: "Progress — NutriPlan" }] }),
  component: () => <AuthGate><AppShell><ProgressPage /></AppShell></AuthGate>,
});

function ProgressPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [w, setW] = useState("");

  const weights = useQuery({
    queryKey: ["weights", user?.id], enabled: !!user,
    queryFn: async () => (await supabase.from("weight_logs").select("*").eq("user_id", user!.id).order("logged_on")).data ?? [],
  });
  const logs7 = useQuery({
    queryKey: ["logs7", user?.id], enabled: !!user,
    queryFn: async () => {
      const since = new Date(Date.now() - 7*86400000).toISOString();
      const { data } = await supabase.from("food_logs").select("logged_at, servings, foods(calories)").eq("user_id", user!.id).gte("logged_at", since);
      return data ?? [];
    },
  });

  const addWeight = async () => {
    if (!user || !w) return;
    const { error } = await supabase.from("weight_logs").upsert({ user_id: user.id, weight_kg: +w, logged_on: new Date().toISOString().slice(0,10) });
    if (error) toast.error(error.message); else { toast.success("Logged"); setW(""); qc.invalidateQueries({ queryKey: ["weights"] }); }
  };

  const calByDay: Record<string, number> = {};
  for (const l of (logs7.data ?? []) as Array<{ logged_at: string; servings: number; foods: { calories: number } | null }>) {
    const d = l.logged_at.slice(0,10);
    calByDay[d] = (calByDay[d] ?? 0) + (l.foods?.calories ?? 0) * l.servings;
  }
  const calData = Object.entries(calByDay).map(([date, kcal]) => ({ date: date.slice(5), kcal: Math.round(kcal) }));
  const wData = (weights.data ?? []).map((w: { logged_on: string; weight_kg: number }) => ({ date: w.logged_on.slice(5), kg: +w.weight_kg }));

  return (
    <div className="container mx-auto px-4 py-8 pb-24 max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <Card className="p-4">
        <h2 className="font-semibold">Log today's weight</h2>
        <div className="flex gap-2 mt-3">
          <Input type="number" step="0.1" placeholder="kg" value={w} onChange={(e)=>setW(e.target.value)} />
          <Button onClick={addWeight}>Save</Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Weight trend</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={wData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)"/>
              <YAxis stroke="var(--color-muted-foreground)" domain={["auto","auto"]}/>
              <Tooltip />
              <Line type="monotone" dataKey="kg" stroke="var(--color-primary)" strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Calories — last 7 days</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={calData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>
              <XAxis dataKey="date" stroke="var(--color-muted-foreground)"/>
              <YAxis stroke="var(--color-muted-foreground)"/>
              <Tooltip />
              <Bar dataKey="kcal" fill="var(--color-primary)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
