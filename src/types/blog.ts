/**
 * Blog Types

























































































































































































- **API:** REST API with JWT authentication- **Date Formatting:** date-fns- **UI Components:** shadcn/ui- **Styling:** Tailwind CSS with OKLCH colors- **Language:** TypeScript- **Framework:** Next.js 15 (App Router)## 🛠️ Tech Stack- ✅ Modern UI with shadcn/ui- ✅ Type-safe with TypeScript- ✅ Error handling and loading states- ✅ Responsive design- ✅ Search functionality- ✅ User profiles with post listings- ✅ Social features (likes, comments)- ✅ User authentication and authorization- ✅ Full CRUD operations for posts## 🎯 Key Features| `/search` | Search | No | Search posts || `/profile/[username]` | User Profile | No | Public user profile || `/profile` | My Profile | Yes | Current user profile || `/posts/[id]/edit` | Edit Post | Yes | Edit existing post || `/posts/write` | Create Post | Yes | Write new post || `/posts/[id]` | Post Detail | No | View single post || `/register` | Register | No | User registration || `/login` | Login | No | User login || `/` | Home | No | Landing page with post feeds ||-------|------|---------------|-------------|| Route | Page | Auth Required | Description |## 📄 Pages Overview5. User can logout to remove token4. Protected pages check for token and redirect to login if missing3. Token is included in API requests via Authorization header2. JWT token is stored in localStorage1. User registers or logs in## 🔑 Authentication FlowCan be overridden with `NEXT_PUBLIC_API_URL` environment variable.Default API endpoint: `https://be-blg-production.up.railway.app`## 📋 API Base URL   Navigate to `http://localhost:3000`4. **Open browser:**   ```   pnpm dev   ```bash3. **Run development server:**   ```   NEXT_PUBLIC_API_URL=https://be-blg-production.up.railway.app   ```   Create a `.env.local` file with:2. **Set up environment variables:**   ```   pnpm install   ```bash1. **Install dependencies:**## 🚀 Running the App- `DELETE /comments/{commentId}` - Delete comment- `POST /comments/{postId}` - Create comment- `GET /posts/{postId}/comments` - Get post comments### Comments- `GET /posts/{id}/likes` - Get post likes- `POST /posts/{id}/like` - Like/unlike post- `DELETE /posts/{id}` - Delete post- `PATCH /posts/{id}` - Update post- `POST /posts` - Create new post- `GET /posts/by-user/{userId}` - Get posts by user ID- `GET /posts/by-username/{username}` - Get posts by username- `GET /posts/{id}` - Get post by ID- `GET /posts/search` - Search posts- `GET /posts/my-posts` - Get current user's posts- `GET /posts/most-liked` - Get most liked posts- `GET /posts/recommended` - Get recommended posts### Posts- `PATCH /users/password` - Change password- `PATCH /users/profile` - Update profile- `GET /users/{id}` - Get user by ID- `GET /users/by-username/{username}` - Get user by username- `GET /users/me` - Get current user profile### Users- `POST /auth/login` - User login- `POST /auth/register` - User registration### AuthenticationAll API calls are implemented in `src/lib/api.ts`:## 🔌 API Integration- ✅ Smooth animations and transitions- ✅ Form validation- ✅ Loading states and error handling- ✅ Responsive design (mobile, tablet, desktop)- ✅ Dark mode support- ✅ OKLCH color system for better color management- ✅ Modern UI with shadcn/ui components## 🎨 Design Features- All shadcn/ui components (Button, Input, Card, etc.)- `LoadingSpinner` - Loading indicator- `PostCard` - Reusable post preview card- `Navbar` - Global navigation bar### Reusable Components## 📱 Components  - Login/Sign up buttons (unauthenticated users)  - User menu with avatar (authenticated users)  - Write button (authenticated users)  - Search bar  - Logo/home link- **Navbar** - Persistent navigation with:### 🧭 Navigation- **View Like Count** - See number of likes on posts- **Like/Unlike Post** - Toggle like on posts (login required)### ❤️ Likes- **View Comments** - See all comments on a post- **Delete Comment** - Remove comments (post owner only)- **Add Comment** - Post comments on posts (login required)### 💬 Comments  - Public page (no login required)  - View user's posts  - View user information- **User Profile** (`/profile/[username]`) - Public user profile:  - Protected route  - View own posts  - Edit profile (username, bio, avatar)  - View profile information- **My Profile** (`/profile`) - Current user's profile:### 👤 User Profiles- **Search Posts** (`/search`) - Search functionality with query parameter  - Protected route (only post owner)  - Delete post with confirmation dialog  - Update all post fields- **Edit Post** (`/posts/[id]/edit`) - Edit existing post:  - Protected route (login required)  - Tags (comma-separated)  - Cover image URL  - Title, content, excerpt- **Create Post** (`/posts/write`) - Create new post with:  - Edit button (for post owner)  - Comments section  - Like/unlike functionality  - Author information  - Post content with cover image- **Post Detail Page** (`/posts/[id]`) - Full post view with:### 📝 Posts- Loading states and error handling- Responsive grid layout for post cards  - Most Liked Posts - `/posts/most-liked` API endpoint  - Recommended Posts - `/posts/recommended` API endpoint- **Landing Page** (`/`) - Shows two tabs:### 🏠 Home Page- Protected routes that redirect to login- JWT token management with localStorage- **Register Page** (`/register`) - Create new account with name, username (optional), email, and password- **Login Page** (`/login`) - Login with email and password### 🔐 Authentication## ✅ Implemented FeaturesThis document describes the implemented features of the Blog App following the Swagger API documentation. * 
 * Type definitions based on API endpoints
 */

// User Types
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  headline?: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
}

// Auth Types
export interface RegisterData {
  name: string;
  username?: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Post Types
export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  imageUrl?: string;
  imagePublicId?: string;
  authorId: string;
  author: User;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
}

// Like Types
export interface Like {
  id: string;
  postId: string;
  userId: string;
  user: User;
  createdAt: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}

