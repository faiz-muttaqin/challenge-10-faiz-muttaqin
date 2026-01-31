"use client";

import { useEffect, useState } from "react";
import { getRecommendedPosts, getMostLikedPosts } from "@/lib/api";
import type { Post } from "@/types/blog";
import { PostCard } from "@/components/post-card";
import { Skeleton } from "@/ui/skeleton";
import { Alert, AlertDescription } from "@/ui/alert";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/ui/button";

function PostCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden p-4">
      <div className="flex gap-4">
        {/* Image skeleton on the left */}
        <Skeleton className="w-48 h-32 rounded-lg flex-shrink-0" />
        
        {/* Content skeleton on the right */}
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactPostCardSkeleton() {
  return (
    <div className="space-y-3 pb-4 border-b last:border-0">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3 w-8" />
        <Skeleton className="h-3 w-8" />
      </div>
    </div>
  );
}

export default function Home() {
  const [recommendedPosts, setRecommendedPosts] = useState<Post[]>([]);
  const [mostLikedPosts, setMostLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const [recommended, liked] = await Promise.all([
          getRecommendedPosts(currentPage, limit),
          getMostLikedPosts().catch(() => []),
        ]);
        
        setRecommendedPosts(recommended.data);
        setTotalPages(recommended.lastPage);
        setTotal(recommended.total);
        setMostLikedPosts(liked.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Recommended Posts */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">Recommend For You</h2>
            
            {loading ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            ) : recommendedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts available yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendedPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {renderPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className="min-w-[2.5rem]"
                      >
                        {page}
                      </Button>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar - Most Liked Posts */}
          <aside className="lg:w-80">
            <h2 className="text-2xl font-bold mb-6">Most Liked</h2>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <CompactPostCardSkeleton key={i} />
                ))}
              </div>
            ) : mostLikedPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">No posts available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mostLikedPosts.map((post) => (
                  <div key={post.id} className="border-b pb-4 last:border-0">
                    <PostCard key={post.id} post={post} compact />
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
