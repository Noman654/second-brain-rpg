"use client";

import { useGameStore } from "@/lib/store";
import { Progress } from "@/components/ui/progress";
import { Swords, Brain, Users, Coins, Trophy } from "lucide-react";

export function StatsBar() {
    const { userStats } = useGameStore();

    const xpPercentage = Math.min(
        100,
        (userStats.currentXP / userStats.xpToNextLevel) * 100
    );

    return (
        <div className="border-b bg-background p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-full font-bold text-xl ring-2 ring-primary/20">
                    {userStats.level}
                </div>
                <div className="flex flex-col gap-1 min-w-[200px]">
                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>XP Progress</span>
                        <span>
                            {userStats.currentXP} / {userStats.xpToNextLevel}
                        </span>
                    </div>
                    <Progress value={xpPercentage} className="h-2.5" />
                </div>
            </div>

            <div className="flex items-center gap-6 overflow-x-auto pb-2 md:pb-0">
                <AttributeDisplay
                    icon={<Swords className="w-4 h-4 text-red-500" />}
                    label="STR"
                    value={userStats.attributes.strength}
                />
                <AttributeDisplay
                    icon={<Brain className="w-4 h-4 text-blue-500" />}
                    label="INT"
                    value={userStats.attributes.intellect}
                />
                <AttributeDisplay
                    icon={<Users className="w-4 h-4 text-purple-500" />}
                    label="CHA"
                    value={userStats.attributes.charisma}
                />
                <AttributeDisplay
                    icon={<Coins className="w-4 h-4 text-yellow-500" />}
                    label="WLTH"
                    value={userStats.attributes.wealth}
                />
            </div>
        </div>
    );
}

function AttributeDisplay({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
    return (
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md border">
            {icon}
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">{label}</span>
                <span className="font-bold leading-none">{value}</span>
            </div>
        </div>
    )
}
