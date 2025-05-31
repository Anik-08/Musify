// app/premium/page.jsx
import Navbar from "../component/Navbar";
import Image from "next/image";
import { LuAudioLines } from "react-icons/lu";
import { FaCirclePlay } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { FaPauseCircle } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoIosMusicalNote } from "react-icons/io";

export default function Premium() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-start gap-12 px-6 py-10">
        {/* Left Section - Icons, visible only on large screens */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          <div className="bg-black border border-white w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <RxCross1 className="text-white" size={42} />
          </div>
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-2xl">
            <IoIosMusicalNote className="text-black" size={32} />
          </div>
          <div className="bg-yellow-400 w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <FaPauseCircle className="text-black" size={42} />
          </div>
          <div className="bg-white w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <LuAudioLines className="text-black rotate-90" size={50} />
          </div>
          <div className="bg-cyan-400 w-16 h-32 rounded-full flex-col flex items-center justify-center text-2xl">
            <FaPauseCircle className="rotate-90 mb-2" size={32} />
            <LuAudioLines className="rotate-90" size={42} />
          </div>
          <Image src="/avatar1.png" alt="User" width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
          <div className="bg-pink-500 w-16 h-32 rounded-full flex-col flex items-center justify-center text-2xl">
            <FaCirclePlay className="rotate-90 mb-2" size={32} />
            <LuAudioLines className="rotate-90" size={42} />
          </div>
          <div className="bg-yellow-400 w-16 h-16 rounded-full border flex items-center justify-center text-2xl">
            <div className="bg-black w-4 h-4 rounded-2xl"></div>
          </div>
          <div className="bg-black border border-white w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <HiOutlineDotsVertical className="" size={64} />
          </div>
          <div className="bg-black w-16 h-24 rounded-full border flex items-center justify-center text-2xl col-start-2">
            <FaCirclePlay className="" size={32} />
          </div>
        </div>

        {/* Center Content - Full Width */}
        <div className="flex-1 w-full">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight mb-6">
            🎧 Unlock the Full Musify Experience
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
            Elevate your music and podcast experience with Musify Premium. Choose a plan that suits you and enjoy ad-free listening, offline access, and more exclusive features tailored for true audio enthusiasts.
          </p>

          {/* Inline Boxes for Free, Premium, and Pro Plans */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            {/* Free Plan Box */}
            <div className="flex-1 bg-[#111] border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">🎶 Free Plan</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-4 leading-relaxed">
                Get started with Musify at no cost. Enjoy access to millions of tracks and podcasts with basic features.
              </p>
              <ul className="text-gray-300 list-disc list-inside text-sm sm:text-base">
                <li>Access to all tracks and podcasts</li>
                <li>Basic playlists</li>
                <li>Standard audio quality</li>
              </ul>
              <button className="mt-4 bg-gray-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-gray-600 transition duration-200">
                Get Started
              </button>
            </div>

            {/* Premium Plan Box */}
            <div className="flex-1 bg-[#111] border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">💎 Premium Plan</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-4 leading-relaxed">
                Upgrade to Premium for an ad-free experience, offline listening, and enhanced audio quality.
              </p>
              <ul className="text-gray-300 list-disc list-inside text-sm sm:text-base">
                <li>Ad-free listening</li>
                <li>Offline mode</li>
                <li>High-quality audio</li>
                <li>Exclusive playlists</li>
              </ul>
              <button className="mt-4 bg-yellow-400 text-black font-semibold px-6 py-2 rounded-full hover:bg-yellow-500 transition duration-200">
                Upgrade Now
              </button>
            </div>

            {/* Pro Plan Box */}
            <div className="flex-1 bg-[#111] border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl sm:text-2xl font-semibold mb-3">🚀 Pro Plan</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-4 leading-relaxed">
                Go all-in with the Pro plan. Get all Premium features plus creator tools and priority support.
              </p>
              <ul className="text-gray-300 list-disc list-inside text-sm sm:text-base">
                <li>All Premium features</li>
                <li>Creator analytics tools</li>
                <li>Priority support</li>
                <li>Early access to new features</li>
              </ul>
              <button className="mt-4 bg-pink-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-pink-600 transition duration-200">
                Go Pro
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold mb-3">🌍 Join the Premium Community</h2>
          <p className="text-base sm:text-lg text-gray-300 mb-8 leading-relaxed">
            Join thousands of music lovers who’ve upgraded their experience with Musify Premium. Unlock a world of uninterrupted sound and exclusive content today.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
            {/* Join Us Button */}
            <button className="bg-white text-black font-semibold px-6 py-3 rounded-full flex items-center gap-3 hover:bg-yellow-100 transition duration-200">
              Join Us
              <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-lg">
                →
              </span>
            </button>

            {/* Contact Us Button */}
            <button className="text-gray-400 font-semibold px-6 py-3 rounded-full hover:text-white hover:bg-gray-700 transition duration-200">
              Contact Us
            </button>
          </div>

          <div className="h-0.5 bg-white rounded-bl-full w-full mb-6"></div>

          <div>
            <h3 className="font-semibold text-md mb-3">🎵 PREMIUM FEATURES</h3>
            <div className="flex flex-wrap gap-3 text-sm">
              {[
                "Ad-Free Listening",
                "Offline Mode",
                "High-Quality Audio",
                "Exclusive Playlists",
                "Creator Tools",
                "Priority Support",
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