"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const { data, error } = await supabase.from("categories").select("*");
            if (!error && data) {
                setCategories(data);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <span className="text-sm text-zinc-500 font-medium">Monthly Spending</span>
                    <div className="mt-2 text-3xl font-bold tracking-tight">$0,00</div>
                    <div className="mt-2 text-xs text-emerald-500 font-medium uppercase tracking-wider">Start adding subscriptions</div>
                </div>
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <span className="text-sm text-zinc-500 font-medium">Annual Projection</span>
                    <div className="mt-2 text-3xl font-bold tracking-tight">$0,00</div>
                    <div className="mt-2 text-xs text-zinc-400 font-medium uppercase tracking-wider">Based on active subscriptions</div>
                </div>
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <span className="text-sm text-zinc-500 font-medium">Active Subscriptions</span>
                    <div className="mt-2 text-3xl font-bold tracking-tight">0</div>
                    <div className="mt-2 text-xs text-blue-500 font-medium uppercase tracking-wider">Configure your first wallet</div>
                </div>
            </div>

            {/* Charts / Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 h-[400px] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Spending History</h3>
                        <select className="bg-transparent text-sm font-medium border-none outline-none">
                            <option>Last 6 months</option>
                            <option>Last year</option>
                        </select>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2 mt-8">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400">Loading charts...</div>
                        ) : (
                            [20, 30, 25, 40, 35, 50].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                    <div
                                        className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-t-lg transition-all hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                                        style={{ height: `${val}%` }}
                                    />
                                    <span className="text-xs text-zinc-400 font-medium">Month {i + 1}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col">
                    <h3 className="text-lg font-semibold mb-6">By Category</h3>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-48 h-48 rounded-full border-[16px] border-zinc-100 dark:border-zinc-900 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-2xl font-bold tracking-widest text-zinc-300">LIVE</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        {loading ? (
                            <div className="text-sm text-zinc-400">Fetching categories...</div>
                        ) : (
                            categories.map((cat) => (
                                <div key={cat.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                        <span>{cat.name}</span>
                                    </div>
                                    <span className="font-semibold text-zinc-400">0%</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
