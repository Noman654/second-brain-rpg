'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import {
    Library,
    Plus,
    Tag,
    Trash2,
    BookOpen,
    Search,
    FileText,
    ExternalLink,
    MapPin
} from 'lucide-react';

export default function ResourcesPage() {
    const { resources, areas, createResource, deleteResource } = useGameStore();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [link, setLink] = useState('');
    const [linkedAreaId, setLinkedAreaId] = useState<string>('none');
    const [tagsString, setTagsString] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;

        setIsSubmitting(true);
        try {
            const tags = tagsString
                .split(',')
                .map((t) => t.trim())
                .filter((t) => t.length > 0);

            await createResource(
                title,
                content,
                tags,
                link.trim() || undefined,
                linkedAreaId === 'none' ? undefined : linkedAreaId
            );

            // Reset and close
            setTitle('');
            setContent('');
            setLink('');
            setLinkedAreaId('none');
            setTagsString('');
            setIsCreateOpen(false);
        } catch (error) {
            console.error('Failed to create resource:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        console.log('Attempting to delete resource:', id);
        if (confirm('Are you sure you want to delete this resource?')) {
            await deleteResource(id);
            console.log('Delete command sent');
        }
    };

    const getAreaTitle = (areaId: string | null) => {
        if (!areaId) return null;
        return areas.find(a => a.id === areaId)?.title;
    };

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Library className="w-6 h-6 text-primary" />
                        Library
                    </h2>
                    <p className="text-muted-foreground">
                        Repository of knowledge, notes, and references.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-64 h-9"
                        />
                    </div>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Resource
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>Add New Resource</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. React Patterns"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Link (Optional)</label>
                                        <Input
                                            value={link}
                                            onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Realm (Optional)</label>
                                        <Select value={linkedAreaId} onValueChange={setLinkedAreaId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Realm" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None (Independent)</SelectItem>
                                                {areas.map((area) => (
                                                    <SelectItem key={area.id} value={area.id}>
                                                        {area.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Content / Notes</label>
                                    <Textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Write your notes here..."
                                        className="min-h-[150px]"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tags (comma separated)</label>
                                    <Input
                                        value={tagsString}
                                        onChange={(e) => setTagsString(e.target.value)}
                                        placeholder="frontend, react, notes"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Resource'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Content */}
            {resources.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Your Library is Empty</h3>
                    <p className="text-muted-foreground mb-4 max-w-md">
                        Start building your personal knowledge base by adding notes, references, and resources.
                    </p>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Resource
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map((resource) => (
                        <Card key={resource.id} className={cn(
                            "flex flex-col h-full transition-all hover:shadow-md border-l-4 border-l-primary/50 group"
                        )}>
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <CardTitle className="text-lg font-bold leading-tight flex-1">
                                        {resource.link ? (
                                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2 inline-block">
                                                {resource.title}
                                                <ExternalLink className="w-3 h-3 opacity-50 inline" />
                                            </a>
                                        ) : (
                                            resource.title
                                        )}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(resource.id);
                                        }}
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors shrink-0 relative z-20"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {resource.linked_area_id && (
                                        <Badge variant="outline" className="text-[10px] h-5 bg-secondary/50 font-medium border-primary/20 text-primary">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {getAreaTitle(resource.linked_area_id)}
                                        </Badge>
                                    )}
                                    {resource.tags?.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] h-5">
                                            <Tag className="w-3 h-3 mr-1 opacity-50" />
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 py-2">
                                <div className="text-sm text-muted-foreground line-clamp-4 leading-relaxed whitespace-pre-wrap font-mono bg-muted/30 p-3 rounded-md border border-border/50">
                                    {resource.content}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 pb-3 text-xs text-muted-foreground flex justify-between items-center border-t bg-muted/10 mt-auto">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-3 h-3" />
                                    {new Date(resource.created_at).toLocaleDateString()}
                                </span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
