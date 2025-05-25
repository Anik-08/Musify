"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { CircleUserRound, LogIn } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full px-6 py-4 bg-black flex items-center justify-between text-white font-medium z-50">
      {/* Logo */}
      <Link
        href="/"
        className="text-xl font-bold tracking-wide flex items-center gap-2"
      >
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black font-bold">
          M
        </div>
        Musify
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-sm">
        <Link href="/popular" className="hover:text-yellow-400 transition">
          Popular
        </Link>
        <Link href="/premium" className="hover:text-yellow-400 transition">
          Premium
        </Link>
        <Link href="/news" className="hover:text-yellow-400 transition">
          News
        </Link>
        <Link href="/about" className="hover:text-yellow-400 transition">
          About
        </Link>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <span className="px-4 py-1.5 cursor-pointer rounded-full border border-white hover:bg-white hover:text-black transition text-sm">
              Sign up
            </span>
          </SignUpButton>

          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <span className="px-4 py-1.5 cursor-pointer bg-white text-black rounded-full text-sm hover:bg-gray-100 flex items-center gap-1 transition">
              Sign in <LogIn size={16} />
            </span>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
