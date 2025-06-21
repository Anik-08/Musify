'use client';
import { useRouter } from 'next/navigation';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import { IoGlobeOutline } from "react-icons/io5";

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  const router = useRouter();

  const navigateTo = (path, tab) => {
    setActiveTab(tab);
    router.push(path);
  };

  return (
    <div className="w-20 bg-gray-800 flex flex-col items-center h-full py-8 border-r border-gray-700">
      <div className="mb-8">
        <div className="h-10 w-10 bg-pink-500 flex items-center justify-center rounded">
          <Image src="/Musify_logo.jpg" alt="Logo" width={40} height={40} />
        </div>
      </div>

      <button
        onClick={() => navigateTo('/dashboard', 'home')}
        className={`flex flex-col items-center justify-center mb-8 w-full py-2 ${activeTab === 'home' ? 'text-white' : 'text-gray-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1">Home</span>
      </button>

      <button
        onClick={() => navigateTo('/community', 'community')}
        className={`flex flex-col items-center justify-center mb-8 w-full py-2 ${activeTab === 'explore' ? 'text-white' : 'text-gray-400'}`}
      >
        <IoGlobeOutline className="h-6 w-6" />
        <span className="text-xs mt-1">Community</span>
      </button>

      <button
        onClick={() => navigateTo('/playlist', 'library')}
        className={`flex flex-col items-center justify-center mb-8 w-full py-2 ${activeTab === 'library' ? 'text-white' : 'text-gray-400'}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
        <span className="text-xs mt-1">Library</span>
      </button>

      <div className="mt-auto">
        <button
          onClick={() => navigateTo('/settings', 'settings')}
          className={`flex flex-col items-center justify-center mb-8 w-full py-2 ${activeTab === 'settings' ? 'text-white' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs mt-1">Settings</span>
        </button>

        <SignOutButton>
          <button
            className="flex flex-col items-center justify-center w-full py-2 text-gray-400 hover:text-red-500"
            onClick={handleLogout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-xs mt-1">Logout</span>
          </button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default Sidebar;