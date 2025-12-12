"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGameStore } from "@/lib/store";
import { useState } from "react";
import { Check, Send } from "lucide-react";

interface ChallengeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    xpReward: number;
    linkedAreaId: string;
}

export function ChallengeModal({ open, onOpenChange, title, xpReward, linkedAreaId }: ChallengeModalProps) {
    const { friends, sendChallenge } = useGameStore();
    const [sending, setSending] = useState<string | null>(null); // friendId being sent to

    const handleSend = async (friendId: string) => {
        setSending(friendId);
        const success = await sendChallenge(friendId, 'habit_challenge', title, { xpReward, linkedAreaId });
        setSending(null);
        if (success) {
            // maybe show a toast or just changing button state
            alert(`Challenge sent to friend!`); // Simple feedback for now
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Challenge a Friend</DialogTitle>
                    <DialogDescription>
                        Send "{title}" to your allies. If they accept, they gain this habit.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
                    {friends.length === 0 ? (
                        <div className="text-center text-muted-foreground py-4">
                            You have no confirmed friends yet.
                        </div>
                    ) : (
                        friends.map(friend => (
                            <div key={friend.id} className="flex items-center justify-between p-2 rounded-md border bg-secondary/10">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={friend.avatar_url || undefined} />
                                        <AvatarFallback>{friend.username?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{friend.username}</div>
                                </div>
                                <Button
                                    size="sm"
                                    disabled={!!sending}
                                    onClick={() => handleSend(friend.id)}
                                >
                                    {sending === friend.id ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Send
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
