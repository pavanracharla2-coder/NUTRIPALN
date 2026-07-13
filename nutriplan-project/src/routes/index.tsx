import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Salad, Shield, Sparkles, Activity, Apple, Leaf } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NutriPlan — Personalized Diet & Meal Plans Powered by ML" },
      { name: "description", content: "Get daily and weekly meal plans tailored to your body, goals, allergies and medical conditions. Backed by nutrition rules and machine learning." },
      { property: "og:title", content: "NutriPlan — Personalized Diet & Meal Plans" },
      { property: "og:description", content: "Daily plans tailored to your body, goals and health." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <span className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
            <Leaf className="size-5" />
          </span>
          NutriPlan
        </div>
        <Button asChild><Link to="/login">Get started</Link></Button>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-20"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="container mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              <Sparkles className="size-3.5" /> ML-powered nutrition
            </span>
            <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight">
              Eat smarter, every day.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-prose">
              NutriPlan blends machine learning with clinical nutrition rules to build
              personalized daily and weekly meal plans — safe for your allergies,
              aligned with your goals, and adapted to medical conditions like diabetes,
              hypertension, and heart health.
            </p>
            <div className="mt-8 flex gap-3">
              <Button asChild size="lg"><Link to="/login">Start free</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/login">Sign in</Link></Button>
            </div>
          </div>
          <div className="relative">
            <Card className="p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Today's plan</span>
                <span className="text-xs text-muted-foreground">2,100 kcal · 35P/35C/30F</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { m: "Breakfast", n: "Oatmeal with Banana & Almonds", k: 340, t: "high fiber · heart" },
                  { m: "Lunch", n: "Quinoa Bowl with Veggies", k: 480, t: "diabetes-friendly" },
                  { m: "Dinner", n: "Grilled Salmon with Asparagus", k: 460, t: "omega-3 · low-carb" },
                  { m: "Snack", n: "Apple with Peanut Butter", k: 260, t: "satisfying · fiber" },
                ].map((m) => (
                  <div key={m.m} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="size-9 rounded-md bg-secondary grid place-items-center text-secondary-foreground">
                      <Apple className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground">{m.m}</div>
                      <div className="text-sm font-medium">{m.n}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">{m.k} kcal</div>
                      <div className="text-[10px] text-muted-foreground">{m.t}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { i: Brain, t: "ML calorie & macro engine", d: "Mifflin–St Jeor BMR, activity multipliers, and goal-aware macro splits — adapted live as your body changes." },
          { i: Shield, t: "Medically aware", d: "Hard rules filter out allergens and condition-specific foods before ranking ever runs. Safe by design." },
          { i: Activity, t: "Explain every meal", d: "Each recommendation comes with a reason: why it fits your goals, conditions and preferences." },
        ].map((f) => (
          <Card key={f.t} className="p-6">
            <f.i className="size-6 text-primary" />
            <h3 className="mt-4 font-semibold">{f.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </Card>
        ))}
      </section>

      <section className="container mx-auto px-4 pb-20">
        <Card className="p-10 text-center bg-secondary/40">
          <Salad className="size-8 mx-auto text-primary" />
          <h2 className="mt-4 text-2xl font-semibold">Ready to plan your week?</h2>
          <p className="mt-2 text-muted-foreground">Onboard in 2 minutes — get a 7-day plan instantly.</p>
          <Button asChild size="lg" className="mt-6"><Link to="/login">Create your plan</Link></Button>
        </Card>
      </section>
    </div>
  );
}
