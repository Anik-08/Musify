import Navbar from "./component/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 py-10">
      <Navbar />
      <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-7xl">
        {/* Left Side - Icons */}
        <div className="flex flex-col gap-4">
          <div className="bg-white text-black w-14 h-28 rounded-full flex items-center justify-center">O</div>
          <div className="bg-yellow-400 w-14 h-28 rounded-full flex items-center justify-center">~</div>
          <div className="bg-pink-500 w-14 h-28 rounded-full flex items-center justify-center">≈</div>
          <div className="bg-gray-900 w-14 h-28 rounded-full flex items-center justify-center">↑</div>
          <Image src="/avatar1.png" alt="User" className="w-14 h-14 rounded-full object-cover" />
          <div className="bg-pink-600 w-14 h-28 rounded-full flex items-center justify-center">≋</div>
        </div>

        {/* Center Content */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Unleash Your Ears,<br />
            <span className="text-white">Ignite Your Mind!</span>
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-xl">
            Introducing Musify, the revolutionary podcast app that redefines the way you experience audio storytelling.
          </p>

          <div className="flex items-center gap-4 mb-8 justify-center lg:justify-start">
            <button className="bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-gray-200">
              Get it
            </button>
            <button className="border border-white px-6 py-3 rounded-full hover:bg-white hover:text-black transition">
              Learn More
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-2">POPULAR PODCAST TOPICS</h3>
            <div className="flex flex-wrap gap-2 text-sm">
              {["Music", "Sport", "Education", "News", "History", "Comedy"].map((tag) => (
                <span key={tag} className="px-4 py-1 border border-white rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Chart */}
        <div className="bg-[#111] rounded-xl p-6 border border-gray-700 w-64">
          <h4 className="text-sm text-white mb-4">Top of the week</h4>
          <div className="flex gap-2 mb-4">
            <Image src="/avatar2.png" className="w-10 h-10 rounded-full" alt="avatar-2"/>
            <Image src="/avatar3.png" className="w-10 h-10 rounded-full" alt="avatar-3"/>
            <Image src="/avatar4.png" className="w-10 h-10 rounded-full" alt="avatae-4"/>
          </div>
          <div className="bg-gray-800 h-20 w-full rounded-md mb-4"></div>
          <p className="text-white text-xl font-bold">1700+ <span className="text-sm font-normal text-gray-400">Podcast creators</span></p>
        </div>
      </div>
    </main>
  );
}
