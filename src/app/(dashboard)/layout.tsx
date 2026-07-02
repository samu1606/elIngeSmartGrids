import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection fallback (middleware is main guard)
  if (!user) {
    redirect("/login");
  }

  // Fetch public profile from Supabase
  let userName = user.user_metadata?.full_name || "Ingeniero Eléctrico";
  let userPlan = "basic";
  let userRole = "Ingeniero Eléctrico";

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, plan, role")
      .eq("id", user.id)
      .single();

    if (profile && !error) {
      if (profile.full_name) userName = profile.full_name;
      if (profile.plan) userPlan = profile.plan;
      if (profile.role) userRole = profile.role;
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }

  return (
    <DashboardShell
      userEmail={user.email || ""}
      userName={userName}
      userRole={userRole}
      userPlan={userPlan}
    >
      {children}
    </DashboardShell>
  );
}
