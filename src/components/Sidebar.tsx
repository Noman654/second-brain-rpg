"use client";

import Link from "next/link";
import { LayoutDashboard, Target, Archive, BookOpen, Sword, Flame, LogOut, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
    { label: "Quests", icon: Sword, href: "/", description: "Active Projects" },
    { label: "Daily Habits", icon: Flame, href: "/habits", description: "Recurring Tasks" },
    { label: "Realms", icon: Target, href: "/areas", description: "Areas of Responsibility" },
    { label: "Social Hub", icon: Users, href: "/social", description: "Friends & Leaderboard" },
    { label: "Library", icon: BookOpen, href: "/resources", description: "Resources & Notes" },
    { label: "Graveyard", icon: Archive, href: "/archives", description: "Completed Achievements" },
];


export function Sidebar() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    return (
        <div className="w-64 border-r bg-muted/10 hidden md:flex flex-col h-full">
            <div className="p-6 flex items-center gap-2 border-b">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                <h1 className="font-bold text-lg tracking-tight">Second Brain RPG</h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-secondary group",
                            pathname === item.href ? "bg-secondary font-medium shadow-sm ring-1 ring-border" : "text-muted-foreground"
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                        <div>
                            <div className={cn("text-sm", pathname === item.href ? "text-foreground" : "")}>{item.label}</div>
                        </div>
                    </Link>
                ))}
            </nav>

            {/* User Menu */}
            <div className="p-4 border-t space-y-3">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {user?.email?.split('@')[0] || 'Adventurer'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>

            <div className="p-4 border-t text-xs text-muted-foreground text-center">
                v0.2.0 • Beta
            </div>
        </div>
    );
}
