import Navbar from "./component/Navbar";
import Image from "next/image";
import { LuAudioLines } from "react-icons/lu";
import { FaCirclePlay } from "react-icons/fa6";
import { RxCross1 } from "react-icons/rx";
import { FaPauseCircle } from "react-icons/fa";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { IoIosMusicalNote } from "react-icons/io";
import { SignInButton } from "@clerk/nextjs";

export default function Home() {
  // Function to handle sign-in

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-7xl">
        {/* Left Side - Icons in 2-column grid */}
        <div className="grid grid-cols-3 gap-6 wrap-anywhere">
          <div className="bg-black border border-white w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <RxCross1 className="text-white" size={42}/>
          </div>
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center text-2xl">
            <IoIosMusicalNote className="text-black " size={32}/>
          </div>
          <div className="bg-yellow-400 w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <FaPauseCircle className="text-black" size={42}/>
          </div>
          <div className="bg-white w-16 h-32 rounded-full flex items-center justify-center text-2xl">
            <LuAudioLines className="text-black rotate-90 " size={50}/>
          </div>
          <div className="bg-cyan-400 w-16 h-32 rounded-full flex-col flex items-center justify-center text-2xl">
            <FaPauseCircle className="rotate-90 mb-2" size={32}/>
            <LuAudioLines className="rotate-90" size={42}/>
          </div>
          <Image src="/avatar1.png" alt="User" width={64} height={64} className="w-16 h-16 rounded-full object-cover" />
          <div className="bg-pink-500 w-16 h-32 rounded-full flex-col flex items-center justify-center text-2xl">
            <FaCirclePlay className="rotate-90 mb-2" size={32}/>
            <LuAudioLines className="rotate-90" size={42}/>
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

        {/* Center Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Unleash Your Ears,<br />
            <span className="relative">
              Ignite Your Mind!
              
            </span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl">
            Introducing Musify, the revolutionary podcast app that redefines the way you experience audio storytelling.
          </p>

         <div className="flex flex-col lg:flex-row items-center gap-4 mb-8 justify-center lg:justify-start">
          {/* Get it Button */}
          <SignInButton>
            <button className="bg-white text-black text-xl font-semibold px-6 py-3 rounded-full flex items-center gap-3 shadow hover:bg-yellow-100 transition duration-200">
            Get it
            <span className="bg-yellow-400 text-black w-6 h-6 rounded-full flex items-center justify-center text-lg">
              →
            </span>
            </button>
          </SignInButton>

          {/* More Button */}
          <button className="text-gray-400 text-xl font-semibold px-6 py-3 rounded-full flex items-center gap-2 hover:text-white hover:bg-gray-700 transition duration-200">
            More
          </button>
        </div>


          <div className="h-0.5 bg-white rounded-bl-full w-full my-4"></div>

          <div className="grid grid-cols-3 justify-between">
            <h3 className="md:col-span-2 col-span-1 font-semibold text-left text-md mb-2">POPULAR PODCAST TOPICS</h3>
            <div className="flex flex-wrap gap-3  col-span-2 md:col-span-1 text-sm justify-end items-end">
              {["Music", "Sport", "Education", "News", "History", "Comedy"].map((tag) => (
                <button
                  key={tag}
                  className="px-4 py-2 border border-gray-500 text-gray-300 rounded-full hover:bg-gray-800 hover:text-white transition"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Card */}
        <div className="bg-[#111] rounded-xl p-6 border border-gray-700 w-64">
          <h4 className="text-md text-white mb-4 font-semibold">Top 10 of the week</h4>
          <div className="flex gap-2 mb-4">
            <Image src="/avatar2.png" width={40} height={40} className="w-10 h-10 rounded-full" alt="avatar-2"/>
            <Image src="/avatar3.png" width={40} height={40} className="w-10 h-10 rounded-full" alt="avatar-3"/>
            <Image src="/avatar4.png" width={40} height={40} className="w-10 h-10 rounded-full" alt="avatar-4"/>
          </div>
          <div className="bg-gray-800 h-20 w-full rounded-md mb-4 flex items-center justify-center">
            <svg className="w-full h-8 text-gray-500" viewBox="0 0 100 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M0 10 Q 25 0, 50 10 T 100 10" />
            </svg>
          </div>
          <span className="text-sm font-normal text-gray-400">Music creators</span>
          <p className="text-white text-xl font-bold">
            170+ 
          </p>
        </div>
      </div>
    </main>
  );
}