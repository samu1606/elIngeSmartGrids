import Link from "next/link";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
                <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <h2 className="text-xl font-bold tracking-tight">elInge SmartGrids</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="block px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 font-medium">
                        Dashboard
                    </Link>
                    <Link href="/dashboard/subscriptions" className="block px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                        Subscriptions
                    </Link>
                    <Link href="/dashboard/settings" className="block px-4 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                        Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">User Profile</span>
                            <span className="text-xs text-zinc-500">Premium Plan</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-white dark:bg-black">
                <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8">
                    <h1 className="text-lg font-semibold">Overview</h1>
                    <div className="flex items-center gap-4">
                        <button className="h-9 px-4 rounded-full bg-black dark:bg-zinc-50 text-white dark:text-black text-sm font-medium">
                            Add Item
                        </button>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
