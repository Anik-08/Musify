"use client";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { CircleUserRound, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-black text-white font-medium z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
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

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 text-sm">
          <Link href="/" className="hover:text-yellow-400 transition">Home</Link>
          <Link href="/popular" className="hover:text-yellow-400 transition">Popular</Link>
          <Link href="/premium" className="hover:text-yellow-400 transition">Premium</Link>
          <Link href="/news" className="hover:text-yellow-400 transition">News</Link>
          <Link href="/about" className="hover:text-yellow-400 transition">About</Link>
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-6 pb-4">
          <div className="flex flex-col gap-4 text-sm">
            <Link href="/popular" className="hover:text-yellow-400 transition">Popular</Link>
            <Link href="/premium" className="hover:text-yellow-400 transition">Premium</Link>
            <Link href="/news" className="hover:text-yellow-400 transition">News</Link>
            <Link href="/about" className="hover:text-yellow-400 transition">About</Link>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <span className="w-full text-center px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition text-sm">
                  Sign up
                </span>
              </SignUpButton>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <span className="w-full text-center px-4 py-2 bg-white text-black rounded-full hover:bg-gray-100 transition text-sm">
                  Sign in
                </span>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <div className="flex justify-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
