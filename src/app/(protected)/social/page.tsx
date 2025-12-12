"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, UserPlus, Trophy, Users, Check, X, Shield, Crown, Flame, Sword } from "lucide-react";
import * as api from "@/lib/api";

export default function SocialPage() {
    const {
        profile,
        friends,
        pendingRequests,
        leaderboard,
        notifications,
        fetchSocials,
        fetchNotifications,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        acceptChallenge,
        dismissNotification
    } = useGameStore();

    const [activeTab, setActiveTab] = useState("leaderboard");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        // Refresh socials on mount to get latest data
        fetchSocials();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.length < 2) return;

        setSearching(true);
        const results = await api.searchUsers(searchQuery);
        // Filter out self and existing friends
        const filtered = results.filter(u =>
            u.id !== profile?.id &&
            !friends.some(f => f.id === u.id) &&
            !pendingRequests.some(r => r.id === u.id)
        );
        setSearchResults(filtered);
        setSearching(false);
    };

    const handleSendRequest = async (userId: string) => {
        const success = await sendFriendRequest(userId);
        if (success) {
            setSearchResults(prev => prev.filter(p => p.id !== userId));
            alert("Friend request sent!");
        } else {
            alert("Failed to send request. Maybe already sent?");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Social Hub</h1>
                <p className="text-muted-foreground">Connect with other players and compete for glory.</p>
            </div>

            <Tabs defaultValue="leaderboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="leaderboard">
                        <Trophy className="w-4 h-4 mr-2" />
                        Leaderboard
                    </TabsTrigger>
                    <TabsTrigger value="friends">
                        <Users className="w-4 h-4 mr-2" />
                        Friends
                    </TabsTrigger>
                    <TabsTrigger value="inbox">
                        <div className="relative flex items-center">
                            Inbox
                            {notifications.length > 0 && <span className="ml-2 flex h-2 w-2 rounded-full bg-red-600"></span>}
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="leaderboard" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Friend Rankings</CardTitle>
                            <CardDescription>Compare your progress with your allies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {leaderboard.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">Loading specific data...</div>
                                ) : (
                                    leaderboard.map((user, index) => {
                                        const isMe = user.id === profile?.id;
                                        const rank = index + 1;
                                        return (
                                            <div
                                                key={user.id}
                                                className={`flex items-center justify-between p-4 rounded-lg border ${isMe ? 'bg-primary/5 border-primary' : 'bg-card'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="w-8 font-bold text-center text-muted-foreground">
                                                        {rank === 1 ? <Crown className="w-6 h-6 text-yellow-500 mx-auto" /> :
                                                            rank === 2 ? <span className="text-slate-400 text-xl">#2</span> :
                                                                rank === 3 ? <span className="text-amber-700 text-xl">#3</span> :
                                                                    `#${rank}`}
                                                    </div>
                                                    <Avatar className="h-10 w-10 border-2 border-border">
                                                        <AvatarImage src={user.avatar_url || undefined} />
                                                        <AvatarFallback>{user.username?.substring(0, 2).toUpperCase() || 'P'}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-semibold flex items-center gap-2">
                                                            {user.username || 'Anonymous Player'}
                                                            {isMe && <Badge variant="secondary" className="text-[10px]">YOU</Badge>}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">Lvl {user.level} • {user.current_xp} XP</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-primary">{user.current_xp.toLocaleString()} XP</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="friends" className="space-y-6">
                    {/* Friend Requests */}
                    {pendingRequests.length > 0 && (
                        <Card className="border-blue-500/20 bg-blue-500/5">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UserPlus className="w-5 h-5 text-blue-500" />
                                    Pending Requests
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {pendingRequests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between bg-background/50 p-3 rounded-md border">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{req.username?.substring(0, 2) || '?'}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{req.username}</div>
                                                <div className="text-xs text-muted-foreground">Lvl {req.level}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => acceptFriendRequest(req.friendship_id)} className="gap-1">
                                                <Check className="w-4 h-4" /> Accept
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={() => declineFriendRequest(req.friendship_id)} className="gap-1 text-destructive hover:text-destructive">
                                                <X className="w-4 h-4" /> Decline
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Add Friend Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Find Allies</CardTitle>
                            <CardDescription>Search for players by username.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Search username..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                                <Button type="submit" disabled={searching}>
                                    {searching ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                                </Button>
                            </form>

                            <div className="grid gap-2">
                                {searchResults.map(user => (
                                    <div key={user.id} className="flex items-center justify-between p-3 rounded-md border bg-slate-50/5">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user.username?.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{user.username}</span>
                                                <span className="text-xs text-muted-foreground">Lvl {user.level}</span>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => handleSendRequest(user.id)} className="h-8 text-xs">
                                            Add Friend
                                        </Button>
                                    </div>
                                ))}
                                {searchResults.length === 0 && searchQuery.length > 2 && !searching && (
                                    <div className="text-center text-sm text-muted-foreground py-2">No adventurers found.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Friends Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {friends.map(friend => (
                            <Card key={friend.id} className="overflow-hidden">
                                <div className="h-16 bg-gradient-to-r from-blue-600/20 to-indigo-600/20" />
                                <CardContent className="pt-0 relative">
                                    <Avatar className="h-16 w-16 border-4 border-background absolute -top-8 left-4">
                                        <AvatarImage src={friend.avatar_url || undefined} />
                                        <AvatarFallback className="text-lg bg-primary/10">{friend.username?.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="mt-10">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg">{friend.username}</h3>
                                                <p className="text-sm text-muted-foreground">Title: Novice Explorer</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold font-mono">Lvl {friend.level}</div>
                                                <div className="text-xs text-muted-foreground">{friend.current_xp} XP</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-4 text-center">
                                            <div className="bg-secondary/30 p-2 rounded-md">
                                                <div className="text-xs text-muted-foreground">Recruited</div>
                                                <div className="font-medium text-sm">{new Date(friend.created_at).getFullYear()}</div>
                                            </div>
                                            <div className="bg-secondary/30 p-2 rounded-md">
                                                <div className="text-xs text-muted-foreground">Roles</div>
                                                <div className="font-medium text-sm flex justify-center gap-1">
                                                    <Shield className="w-3 h-3" /> Support
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {friends.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>You have no allies yet.</p>
                                <p className="text-sm">Search for users to form a party.</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="inbox" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications & Challenges</CardTitle>
                            <CardDescription>Requests and challenges from your friends.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {notifications.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No new notifications.
                                </div>
                            )}
                            {notifications.map(n => (
                                <div key={n.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            {n.type === 'habit_challenge' ? <Flame className="w-5 h-5 text-orange-500" /> : <Sword className="w-5 h-5 text-blue-500" />}
                                        </div>
                                        <div>
                                            <div className="font-medium">{n.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                                From <span className="font-semibold text-foreground">{n.sender?.username || 'Unknown'}</span>
                                                {n.type === 'habit_challenge' && ' • Habit Challenge'}
                                            </div>
                                            {n.type === 'habit_challenge' && n.data?.xpReward && (
                                                <Badge variant="outline" className="mt-1 text-[10px] border-orange-500/30 text-orange-500">
                                                    +{n.data.xpReward} XP Reward
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => acceptChallenge(n)}>Accept</Button>
                                        <Button size="sm" variant="ghost" onClick={() => dismissNotification(n.id)}>Dismiss</Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
