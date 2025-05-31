// app/about/page.jsx
"use client";

import Navbar from "../component/Navbar";
import Image from "next/image";
import { LuAudioLines } from "react-icons/lu";
import { FaCirclePlay } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { FaPauseCircle } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoIosMusicalNote } from "react-icons/io";

export default function About() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-start gap-12 px-6 py-10">
        {/* Left Section - Icons, visible only on large screens */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          <div className="bg-black border border-white w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <RxCross1 size={42} />
          </div>
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-2xl">
            <IoIosMusicalNote className="text-black" size={32} />
          </div>
          <div className="bg-yellow-400 w-16 h-32 rounded-full flex items-center justify-center">
            <FaPauseCircle className="text-black" size={42} />
          </div>
          <div className="bg-white w-16 h-32 rounded-full flex items-center justify-center">
            <LuAudioLines className="text-black rotate-90" size={50} />
          </div>
          <div className="bg-cyan-400 w-16 h-32 rounded-full flex-col flex items-center justify-center gap-1">
            <FaPauseCircle className="rotate-90" size={32} />
            <LuAudioLines className="rotate-90" size={42} />
          </div>
          <Image src="/avatar1.png" alt="User" width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
          <div className="bg-pink-500 w-16 h-32 rounded-full flex-col flex items-center justify-center gap-1">
            <FaCirclePlay className="rotate-90" size={32} />
            <LuAudioLines className="rotate-90" size={42} />
          </div>
          <div className="bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center border">
            <div className="bg-black w-4 h-4 rounded-full" />
          </div>
          <div className="bg-black border border-white w-16 h-32 rounded-full flex items-center justify-center">
            <HiOutlineDotsVertical size={64} />
          </div>
          <div className="bg-black w-16 h-24 rounded-full border flex items-center justify-center col-start-2">
            <FaCirclePlay size={32} />
          </div>
        </div>

        {/* Right Content - Always Visible */}
        <div className="flex-1 w-full">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-6">
            🎧 About Musify
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
            Welcome to Musify — your personalized gateway to the world of music and audio storytelling. Whether you&apos;re vibing to the latest chart-toppers, discovering underground talent, or diving into gripping podcasts, Musify is designed to ignite your mind and move your soul.
          </p>

          {/* Mission, Creators, Innovation */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            {[
              {
                title: "Our Mission",
                content:
                  "To connect people through sound. We believe music has the power to inspire, heal, and transform. That’s why we’re building a platform where creators can thrive and listeners can explore an endless world of sonic experiences.",
              },
              {
                title: "For Creators",
                content:
                  "Musify isn't just for listeners. We're a home for creators — musicians, DJs, storytellers, and podcasters. With powerful tools, real-time analytics, and a supportive community.",
              },
              {
                title: "Powered by Innovation",
                content:
                  "Musify blends cutting-edge technology with a love for music. From machine learning to audio fingerprinting, we're constantly innovating to bring you the smoothest, smartest, and most immersive music experience possible.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex-1 bg-[#111] border border-gray-700 rounded-xl p-6"
              >
                <h2 className="text-2xl font-semibold mb-3">{item.title}</h2>
                <p className="text-gray-300 text-base">{item.content}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold mb-3">
            🌍 Join the Movement
          </h2>
          <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
            We’re more than an app — we’re a movement. A global family of music lovers, dreamers, and storytellers. Stream. Share. Connect. Join Musify and be part of something bigger.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
            <button className="bg-white text-black font-semibold px-6 py-3 rounded-full flex items-center gap-3 hover:bg-yellow-100 transition">
              Join Us
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-lg">
                →
              </span>
            </button>
            <button className="text-gray-400 font-semibold px-6 py-3 rounded-full hover:text-white hover:bg-gray-700 transition">
              Contact Us
            </button>
          </div>

          <div className="h-0.5 bg-white rounded-bl-full w-full mb-6"></div>

          {/* What We Offer */}
          <div>
            <h3 className="font-semibold text-md mb-3">🎵 WHAT WE OFFER</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                "Millions of Tracks",
                "Curated Playlists",
                "Top Podcasts",
                "Personalized Recommendations",
                "Ad-Free Listening",
                "Offline Mode",
              ].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 border border-gray-500 text-gray-300 rounded-full hover:bg-gray-800 hover:text-white transition"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
