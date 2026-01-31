"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { getPostById, getPostComments, createComment, deleteComment, likePost } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import type { Post, Comment } from "@/types/blog";
import { Button } from "@/ui/button";
import { Textarea } from "@/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertDescription } from "@/ui/alert";
import { Heart, MessageCircle, Trash2, Edit, AlertCircle } from "lucide-react";

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const token = getAuthToken();

  useEffect(() => {
    const loadPost = async () => {
      try {
        const [postData, commentsData] = await Promise.all([
          getPostById(id),
          getPostComments(id),
        ]);
        setPost(postData);
        setComments(commentsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleLike = async () => {
    if (!token || !post) return;

    try {
      await likePost(post.id, token);
      setPost({
        ...post,
        likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
        isLiked: !post.isLiked,
      });
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await createComment(id, { content: newComment }, token);
      setComments([...comments, comment]);
      setNewComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!token) return;

    try {
      await deleteComment(commentId, token);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  // Format content to add line breaks before bullet points
  const formatContent = (content: string) => {
    return content
      .replace(/•/g, '<br>•')
      .replace(/^<br>/, ''); // Remove leading <br> if content starts with bullet
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Post not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <article className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/profile/${post.author.username}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar} alt={post.author.username} />
                <AvatarFallback>
                  {post.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{post.author.username}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </Link>

            {token && (
              <div className="flex items-center gap-2">
                <Button
                  variant={post.isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-2 ${post.isLiked ? "fill-current" : ""}`} />
                  {post.likesCount}
                </Button>
                {post.author.id === post.authorId && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/posts/${post.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {post.imageUrl && (
          <div className="relative aspect-21/9 w-full overflow-hidden rounded-lg mb-8">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: formatContent(post.content) }} />
        </div>

        <Separator className="my-8" />

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Comments ({comments.length})
          </h2>

          {token ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-4"
                rows={3}
              />
              <Button type="submit" disabled={submitting || !newComment.trim()}>
                {submitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          ) : (
            <Card className="mb-8">
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Please login to comment
                </p>
                <Button asChild>
                  <Link href="/login">Login</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={comment.author.avatar}
                            alt={comment.author.username}
                          />
                          <AvatarFallback>
                            {comment.author.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/profile/${comment.author.username}`}
                              className="font-semibold hover:underline"
                            >
                              {comment.author.username}
                            </Link>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      </div>
                      {token && comment.author.id === comment.authorId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
