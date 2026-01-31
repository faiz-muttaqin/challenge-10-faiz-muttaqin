"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAuthToken, removeAuthToken } from "@/lib/auth";
import { getMyProfile } from "@/lib/api";
import type { User } from "@/types/blog";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { Input } from "@/ui/input";
import { Search, PenSquare, LogOut, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    useEffect(() => {
        const loadUser = () => {
            const token = getAuthToken();
            if (token) {
                getMyProfile(token)
                    .then(setUser)
                    .catch(() => {
                        setUser(null);
                        removeAuthToken();
                    });
            } else {
                setUser(null);
            }
        };

        loadUser();

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'authToken') {
                loadUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        removeAuthToken();
        setUser(null);
        setShowLogoutDialog(false);
        router.push("/");
        router.refresh();
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-2xl font-bold">
                            Blog<span className="text-primary">.</span>
                        </Link>

                        <form onSubmit={handleSearch} className="hidden md:block">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-64 pl-10"
                                />
                            </div>
                        </form>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        
                        {user ? (
                            <>
                                <Button asChild variant="ghost" size="sm" className="text-primary">
                                    <Link href="/posts/write">
                                        <PenSquare className="mr-2 h-4 w-4" />
                                        Write Post
                                    </Link>
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={user.avatar} alt={user.username} />
                                                <AvatarFallback>
                                                    {user.username.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm font-medium hidden md:inline">
                                                {user.username}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile">
                                                <UserIcon className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild size="sm">
                                    <Link href="/register">Register</Link>
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You will be signed out of your account and redirected to the home page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
