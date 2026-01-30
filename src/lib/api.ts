/**
 * API Utility
 * 
 * Helper functions untuk fetch data dari backend API
 */

import type {
  Post,
  User,
  Comment,
  Like,
  AuthResponse,
  RegisterData,
  LoginData,
  CreatePostData,
  UpdatePostData,
  CreateCommentData,
} from "@/types/blog";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://be-blg-production.up.railway.app";

interface FetchOptions extends RequestInit {
  token?: string;
}

/**
 * Generic fetch function dengan error handling
 */
async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

// ==================== Auth API ====================

export async function register(data: RegisterData): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginData): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==================== Users API ====================

export async function getMyProfile(token: string): Promise<User> {
  return fetchAPI<User>("/users/me", { token });
}

export async function getUserByUsername(username: string): Promise<User> {
  return fetchAPI<User>(`/users/by-username/${username}`);
}

export async function getUserById(id: string): Promise<User> {
  return fetchAPI<User>(`/users/${id}`);
}

export async function updateProfile(
  data: Partial<User>,
  token: string
): Promise<User> {
  return fetchAPI<User>("/users/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function updatePassword(
  data: { oldPassword: string; newPassword: string },
  token: string
): Promise<void> {
  return fetchAPI<void>("/users/password", {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

// ==================== Posts API ====================

export async function getRecommendedPosts(): Promise<Post[]> {
  return fetchAPI<Post[]>("/posts/recommended");
}

export async function getMostLikedPosts(): Promise<Post[]> {
  return fetchAPI<Post[]>("/posts/most-liked");
}

export async function getMyPosts(token: string): Promise<Post[]> {
  return fetchAPI<Post[]>("/posts/my-posts", { token });
}

export async function searchPosts(query: string): Promise<Post[]> {
  return fetchAPI<Post[]>(`/posts/search?q=${encodeURIComponent(query)}`);
}

export async function getPostById(id: string): Promise<Post> {
  return fetchAPI<Post>(`/posts/${id}`);
}

export async function getPostsByUsername(username: string): Promise<Post[]> {
  return fetchAPI<Post[]>(`/posts/by-username/${username}`);
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  return fetchAPI<Post[]>(`/posts/by-user/${userId}`);
}

export async function createPost(
  data: CreatePostData,
  token: string
): Promise<Post> {
  return fetchAPI<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updatePost(
  id: string,
  data: UpdatePostData,
  token: string
): Promise<Post> {
  return fetchAPI<Post>(`/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

export async function deletePost(id: string, token: string): Promise<void> {
  return fetchAPI<void>(`/posts/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function likePost(id: string, token: string): Promise<void> {
  return fetchAPI<void>(`/posts/${id}/like`, {
    method: "POST",
    token,
  });
}

export async function getPostLikes(id: string): Promise<Like[]> {
  return fetchAPI<Like[]>(`/posts/${id}/likes`);
}

// ==================== Comments API ====================

export async function getPostComments(postId: string): Promise<Comment[]> {
  return fetchAPI<Comment[]>(`/posts/${postId}/comments`);
}

export async function createComment(
  postId: string,
  data: CreateCommentData,
  token: string
): Promise<Comment> {
  return fetchAPI<Comment>(`/comments/${postId}`, {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteComment(
  commentId: string,
  token: string
): Promise<void> {
  return fetchAPI<void>(`/comments/${commentId}`, {
    method: "DELETE",
    token,
  });
}

// ==================== App API ====================

export async function getHealth(): Promise<{ status: string }> {
  return fetchAPI<{ status: string }>("/health");
}

export { fetchAPI, API_BASE_URL };

