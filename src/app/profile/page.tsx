"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyProfile, getMyPosts, updateProfile, updatePassword, deletePost } from "@/lib/api";
import { getAuthToken } from "@/lib/auth";
import type { Post, User } from "@/types/blog";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { PostCard } from "@/components/post-card";
import { Alert, AlertDescription } from "@/ui/alert";
import { AlertCircle, Trash2, BarChart3, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Skeleton } from "@/ui/skeleton";

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    headline: "",
    avatarFile: null as File | null,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    Promise.all([getMyProfile(token), getMyPosts(token, currentPage, limit)])
      .then(([userData, postsData]) => {
        setUser(userData);
        setPosts(postsData.data);
        setTotal(postsData.total);
        setTotalPages(postsData.lastPage);
        setEditForm({
          name: userData.name,
          headline: userData.headline || "",
          avatarFile: null,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, router, currentPage]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setEditing(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      if (editForm.name) formData.append("name", editForm.name);
      if (editForm.headline) formData.append("headline", editForm.headline);
      if (editForm.avatarFile) formData.append("avatar", editForm.avatarFile);

      const updated = await updateProfile(formData, token);
      setUser(updated);
      setSuccess("Profile updated successfully");
      setEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setEditing(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setEditing(true);
    setSuccess("");
    try {
      await updatePassword(passwordForm, token);
      setSuccess("Password changed successfully");
      // setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setEditing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!token || !confirm("Are you sure you want to delete this post?")) return;

    try {
      await deletePost(postId, token);
      setPosts(posts.filter(p => p.id !== postId));
      setTotal(total - 1);
      setSuccess("Post deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="text-2xl">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.headline || "No headline"}</p>
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="posts">Your Post</TabsTrigger>
              <TabsTrigger value="password">Change Password</TabsTrigger>
            </TabsList>

            {activeTab === "posts" && (
              <Button asChild>
                <Link href="/posts/write">Write Post</Link>
              </Button>
            )}
          </div>

          <TabsContent value="posts" className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{total} Post</h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Skeleton className="h-32 w-48 shrink-0" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You haven&apos;t written any posts yet.
                  </p>
                  <Button asChild>
                    <Link href="/posts/write">Write your first post</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="space-y-6">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <PostCard post={post} compact={false} />
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/posts/${post.id}`}>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Statistic
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/posts/${post.id}/edit`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      required
                      disabled={editing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      required
                      disabled={editing}
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      required
                      disabled={editing}
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" disabled={editing}>
                    {editing ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  disabled={editing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={editForm.headline}
                  onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                  disabled={editing}
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar Image (JPEG/PNG, max 5MB)</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) =>
                    setEditForm({ ...editForm, avatarFile: e.target.files?.[0] || null })
                  }
                  disabled={editing}
                />
              </div>

              <Button type="submit" className="w-full" disabled={editing}>
                {editing ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
