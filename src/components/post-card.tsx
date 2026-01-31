"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import type { Post } from "@/types/blog";
import { Card, CardContent, CardFooter, CardHeader } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Heart, MessageCircle } from "lucide-react";

interface PostCardProps {
    post: Post;
    compact?: boolean;
}

export function PostCard({ post, compact = false }: PostCardProps) {
    if (compact) {
        return (
            <div className="space-y-3">
                <Link href={`/posts/${post.id}`} className="group">
                    <h3 className="line-clamp-2 font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </Link>
                
                {post.excerpt && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                        {post.excerpt}
                    </p>
                )}

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Link
                        href={`/profile/${post.author.username}`}
                        className="flex items-center gap-2 hover:opacity-80"
                    >
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.avatar} alt={post.author.username} />
                            <AvatarFallback className="text-xs">
                                {post.author.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{post.author.username}</span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                        · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-muted-foreground text-xs">
                    <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.commentsCount}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden transition-shadow hover:shadow-lg">
            <div className="flex gap-4 p-4">
                {/* Image on the left */}
                {post.imageUrl && (
                    <Link href={`/posts/${post.id}`} className="flex-shrink-0">
                        <div className="relative w-48 h-32 overflow-hidden rounded-lg">
                            <Image
                                src={post.imageUrl}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform hover:scale-105"
                            />
                        </div>
                    </Link>
                )}

                {/* Content on the right */}
                <div className="flex-1 min-w-0 flex flex-col">
                    {/* Title */}
                    <Link
                        href={`/posts/${post.id}`}
                        className="group mb-2"
                    >
                        <h3 className="line-clamp-2 text-xl font-bold group-hover:text-primary">
                            {post.title}
                        </h3>
                    </Link>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {post.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className="line-clamp-2 text-sm text-muted-foreground mb-3">
                            {post.excerpt}
                        </p>
                    )}

                    {/* Footer - Author and Stats */}
                    <div className="flex items-center justify-between mt-auto">
                        <Link
                            href={`/profile/${post.author.username}`}
                            className="flex items-center gap-2 hover:opacity-80"
                        >
                            <Avatar className="h-6 w-6">
                                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                                <AvatarFallback className="text-xs">
                                    {post.author.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </span>
                        </Link>

                        <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                <span>{post.likesCount}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{post.commentsCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
