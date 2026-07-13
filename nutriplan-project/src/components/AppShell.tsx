import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Salad, LayoutDashboard, ListChecks, CalendarDays, TrendingUp, User, LogOut, Leaf } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/dashboard", label: "Today", icon: LayoutDashboard },
  { to: "/log", label: "Log", icon: ListChecks },
  { to: "/planner", label: "Weekly", icon: CalendarDays },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/60 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <span className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center">
              <Leaf className="size-5" />
            </span>
            NutriPlan
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  activeProps={{ className: "px-3 py-2 rounded-md text-sm text-foreground bg-secondary font-medium" }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          )}
          <div className="flex items-center gap-2">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  router.navigate({ to: "/login" });
                }}
              >
                <LogOut className="size-4 mr-1" /> Sign out
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      {user && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-card border-t flex justify-around py-2">
          {NAV.map((n) => {
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className="flex flex-col items-center gap-0.5 text-[10px] text-muted-foreground px-2 py-1"
                activeProps={{ className: "flex flex-col items-center gap-0.5 text-[10px] text-primary px-2 py-1" }}
              >
                <Icon className="size-5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      )}
      <footer className="hidden md:block py-6 text-center text-xs text-muted-foreground">
        <Salad className="inline size-3 mr-1" /> NutriPlan — recommendations are guidance, not medical advice.
      </footer>
    </div>
  );
}
