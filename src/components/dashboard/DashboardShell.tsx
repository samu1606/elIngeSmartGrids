"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail: string;
  userName: string;
  userRole: string;
  userPlan: string;
}

export default function DashboardShell({
  children,
  userEmail,
  userName,
  userRole,
  userPlan,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-35 bg-slate-900/60 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Collapsible/Responsive Sidebar */}
      <Sidebar 
        userEmail={userEmail}
        userName={userName}
        userRole={userRole}
        userPlan={userPlan}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main dashboard content layout */}
      <div className="flex flex-col md:pl-64 min-h-screen">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          userPlan={userPlan}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
