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
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      }
      
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
  data: FormData,
  token: string
): Promise<User> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PATCH",
      headers,
      body: data,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
}

export async function updatePassword(
  data: { currentPassword: string; newPassword: string; confirmPassword: string },
  token: string
): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>("/users/password", {
    method: "PATCH",
    body: JSON.stringify(data),
    token,
  });
}

// ==================== Posts API ====================

export async function getRecommendedPosts(page: number = 1, limit: number = 10): Promise<{ data: Post[]; total: number; page: number; lastPage: number }> {
  const response = await fetchAPI<{ data: Post[]; total: number; page: number; lastPage: number }>(`/posts/recommended?page=${page}&limit=${limit}`);
  return response;
}

export async function getMostLikedPosts(): Promise<Post[]> {
  const response = await fetchAPI<{ data: Post[] } | Post[]>("/posts/most-liked");
  return Array.isArray(response) ? response : response.data;
}

export async function getMyPosts(token: string, page: number = 1, limit: number = 10): Promise<{ data: Post[]; total: number; page: number; lastPage: number }> {
  return fetchAPI<{ data: Post[]; total: number; page: number; lastPage: number }>(`/posts/my-posts?page=${page}&limit=${limit}`, { token });
}

export async function searchPosts(query: string): Promise<Post[]> {
  const response = await fetchAPI<{ data: Post[] } | Post[]>(`/posts/search?q=${encodeURIComponent(query)}`);
  return Array.isArray(response) ? response : response.data;
}

export async function getPostById(id: string): Promise<Post> {
  return fetchAPI<Post>(`/posts/${id}`);
}

export async function getPostsByUsername(username: string): Promise<Post[]> {
  const response = await fetchAPI<{ data: Post[] } | Post[]>(`/posts/by-username/${username}`);
  return Array.isArray(response) ? response : response.data;
}

export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const response = await fetchAPI<{ data: Post[] } | Post[]>(`/posts/by-user/${userId}`);
  return Array.isArray(response) ? response : response.data;
}

export async function createPost(
  data: FormData,
  token: string
): Promise<Post> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers,
      body: data,
    });

    if (!response.ok) {
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      }
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
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
  const response = await fetchAPI<{ data: Like[] } | Like[]>(`/posts/${id}/likes`);
  return Array.isArray(response) ? response : response.data;
}

// ==================== Comments API ====================

export async function getPostComments(postId: string): Promise<Comment[]> {
  const response = await fetchAPI<{ data: Comment[] } | Comment[]>(`/posts/${postId}/comments`);
  return Array.isArray(response) ? response : response.data;
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

