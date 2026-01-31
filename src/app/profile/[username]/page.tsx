"use client";

import { use, useEffect, useState } from "react";
import { getUserByUsername, getPostsByUsername } from "@/lib/api";
import type { Post, User } from "@/types/blog";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { PostCard } from "@/components/post-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertDescription } from "@/ui/alert";
import { AlertCircle, Mail } from "lucide-react";

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      getUserByUsername(username),
      getPostsByUsername(username),
    ])
      .then(([userData, postsData]) => {
        setUser(userData);
        setPosts(postsData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "User not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-2">@{user.username}</p>
                
                {user.email && (
                  <p className="text-muted-foreground flex items-center gap-2 mb-4">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                )}

                {user.headline && (
                  <p className="text-muted-foreground mb-4">{user.headline}</p>
                )}

                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-semibold">{posts.length}</span>{" "}
                    <span className="text-muted-foreground">posts</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Section */}
        <Card>
          <CardHeader>
            <CardTitle>Posts by @{user.username}</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  This user hasn&apos;t written any posts yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
