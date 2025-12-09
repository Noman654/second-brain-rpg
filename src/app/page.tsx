"use client";

import { useGameStore } from "@/lib/store";
import { QuestCard } from "@/components/QuestCard";
import { CreateQuestModal } from "@/components/CreateQuestModal";
import { useEffect, useState } from "react";
import { Sword } from "lucide-react";

export default function Dashboard() {
  // Use client-side only rendering to avoid hydration mismatch with persist middleware
  const [mounted, setMounted] = useState(false);
  const { projects } = useGameStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-8">Loading Quests...</div>;
  }

  const activeProjects = projects.filter(p => !p.isCompleted);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sword className="w-6 h-6 text-primary" />
            Active Quests
          </h2>
          <p className="text-muted-foreground">
            Complete projects to gain XP and level up your attributes.
          </p>
        </div>
        <CreateQuestModal />
      </div>

      {activeProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
          <Sword className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium">No Active Quests</h3>
          <p className="text-muted-foreground mb-4 max-w-md">The quest board is empty. Create a new project to start your adventure.</p>
          <CreateQuestModal />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.map((project) => (
            <QuestCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
