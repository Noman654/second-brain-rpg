import { Sidebar } from "@/components/Sidebar";
import { StatsBar } from "@/components/StatsBar";
import { GameDataProvider } from "@/components/GameDataProvider";

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <StatsBar />
                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <GameDataProvider>
                        {children}
                    </GameDataProvider>
                </div>
            </main>
        </>
    );
}
