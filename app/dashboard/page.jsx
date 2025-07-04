'use client';
import { useEffect, useState, useRef } from 'react';
import { useClerk, SignOutButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Sidebar from '../component/Sidebar';

const DashboardPage = () => {
  const [localSongs, setLocalSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const { signOut } = useClerk();
  const audioRef = useRef(null);
  const playPromiseRef = useRef(null);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const registerUser = async () => {
      if (isLoaded && user) {
        try {
          console.log('Registering user with Clerk ID:', user.id, 'Email:', user.primaryEmailAddress.emailAddress);
          const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerkUserId: user.id,
              email: user.primaryEmailAddress.emailAddress,
              profileImageUrl: user.profileImageUrl,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to register user: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          console.log('User registration response:', data);
        } catch (error) {
          console.error('Error during user registration:', error.message);
          // Optionally, you can set a state to display this error to the user
          // e.g., setError(error.message);
        }
      }
    };

    registerUser();
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchLocalSongs = async () => {
      try {
        const res = await fetch('/api/songs');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocalSongs(data);
          setFilteredSongs(data);
        } else {
          console.error('Expected an array, got:', data);
          setLocalSongs([]);
          setFilteredSongs([]);
        }
      } catch (error) {
        console.error('Error fetching local songs:', error);
        setLocalSongs([]);
        setFilteredSongs([]);
      }
    };

    fetchLocalSongs();
  }, []);

  useEffect(() => {
    const filtered = localSongs.filter(
      (song) =>
        (song.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (song.artist?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (song.genre?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
  }, [searchQuery, localSongs]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const playSong = async (song) => {
    if (!song || !song.audioUrl) {
      console.warn('No valid song or audio URL');
      return;
    }

    if (audioRef.current) {
      if (playPromiseRef.current) {
        try {
          await playPromiseRef.current;
        } catch (err) {
          console.error('Pending play promise error:', err);
        }
      }
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    setIsLoading(true);
    setCurrentSong(song);
    setIsPlaying(false);
    setCurrentTime(0);
    setProgress(0);

    const audio = new Audio(song.audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      console.log('Metadata loaded, duration:', audio.duration);
      setDuration(audio.duration || 0);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));

    audio.addEventListener('ended', () => {
      console.log('Song ended, currentSong:', song.title);
      skipForward();
    });

    try {
      playPromiseRef.current = audio.play();
      await playPromiseRef.current;
      setIsPlaying(true);
      setIsLoading(false);
      playPromiseRef.current = null;
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsLoading(false);
      setIsPlaying(false);
      playPromiseRef.current = null;
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current || !currentSong) {
      console.warn('Cannot toggle playback: No audio or song selected');
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        playPromiseRef.current = audioRef.current.play();
        await playPromiseRef.current;
        setIsPlaying(true);
        playPromiseRef.current = null;
      } catch (err) {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
        playPromiseRef.current = null;
      }
    }
  };

  const skipForward = () => {
    if (!currentSong) return;
    let songs = filteredSongs;
    if (!songs.length) {
      console.log('No songs available to skip to');
      return;
    }

    if (songs.length === 1) {
      console.log('Only one song, replaying:', songs[0].title);
      playSong(songs[0]);
      return;
    }

    let availableIndices = [...Array(songs.length).keys()];
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1) {
      availableIndices = availableIndices.filter((i) => i !== currentIndex);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    console.log('Skip forward, currentIndex:', currentIndex, 'randomIndex:', randomIndex, 'song:', songs[randomIndex].title);
    playSong(songs[randomIndex]);
  };

  const skipBackward = () => {
    if (!currentSong) return;
    let songs = filteredSongs;
    if (!songs.length) return;

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    console.log('Skip backward, currentIndex:', currentIndex, 'songs:', songs.map((s) => s.title));
    if (currentIndex === -1) {
      playSong(songs[songs.length - 1]);
      return;
    }
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex]);
  };

  const handleSongClick = (song) => {
    if (currentSong && currentSong.id === song.id) {
      togglePlayPause();
      setIsModalOpen(true);
    } else {
      playSong(song);
      setIsModalOpen(true);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const seekPosition = e.nativeEvent.offsetX / e.target.clientWidth;
    const seekTime = duration * seekPosition;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(seekPosition * 100);
  };

  const renderCircularProgress = () => {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference * (1 - progress / 100);

    return (
      <svg width="300" height="300" viewBox="0 0 300 300" className="transform -rotate-90">
        <circle cx="150" cy="150" r={radius} stroke="#444" strokeWidth="8" fill="transparent" />
        <circle
          cx="150"
          cy="150"
          r={radius}
          stroke="#ec4899"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Left Sidebar - Fixed */}
      <div className="fixed top-0 left-0 h-full w-20 bg-gray-800 z-20">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="ml-20 flex-1 flex flex-col mr-2">
        {/* Top Navigation - Fixed */}
        <div className="fixed top-0 left-20 right-0 bg-gray-800 py-4 px-8 flex items-center justify-between z-10">
          <div className="flex space-x-8 items-center">
            <button
              onClick={() => setActiveTab('music')}
              className={`font-medium ${activeTab === 'music' ? 'text-white' : 'text-gray-400'}`}
            >
              Music
            </button>
            <button
              onClick={() => setActiveTab('podcast')}
              className={`font-medium ${activeTab === 'podcast' ? 'text-white' : 'text-gray-400'}`}
            >
              Podcast
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`font-medium ${activeTab === 'live' ? 'text-white' : 'text-gray-400'}`}
            >
              Live
            </button>
            {/* Temporary button to navigate to admin page for testing */}
            {user?.email === 'aniktiwary1234@gmail.com' && (
              <button
                onClick={() => router.push('/admin')}
                className={`font-medium ${activeTab === 'admin' ? 'text-white' : 'text-gray-400'}`}
              >
                Admin (Temp)
              </button>
            )}

          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
            <button className="text-gray-400 hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="h-8 w-8 rounded-full bg-gray-600 overflow-hidden">
              {isMounted ? (
                isLoaded && user && user.imageUrl ? (
                  <Image
                    src={user.imageUrl}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src="https://via.placeholder.com/32"
                    alt="Profile"
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                )
              ) : null}
            </div>
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 flex mt-16 mb-24">
          {/* Main Song Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 lg:pr-64">
            {/* Search Bar */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Search Music</h2>
              <input
                type="text"
                placeholder="Search by song, artist, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-full text-white bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <h2 className="text-2xl font-semibold mt-4 mb-4">🎵 Your Music</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-md cursor-pointer relative ${
                      currentSong && currentSong.id === song.id ? 'ring-2 ring-pink-500' : ''
                    }`}
                    onClick={() => handleSongClick(song)}
                  >
                    <div className="relative">
                      <Image
                        src={song.coverUrl || '/api/placeholder/200/200'}
                        alt={song.title}
                        width={150}
                        height={150}
                        className="rounded mb-3 w-full h-48 object-cover"
                      />
                      {currentSong && currentSong.id === song.id && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                          <button
                            className="h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlayPause();
                            }}
                          >
                            {isPlaying ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold">{song.title || 'Unknown Title'}</h2>
                    <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
                    <p className="text-sm text-gray-500">{song.genre || 'Unknown Genre'}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No songs match your search.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar - Fixed on Large Screens */}
          <div className="hidden lg:block fixed top-16 right-0 w-64 h-[calc(100vh-8rem)] bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto z-10">
            <h3 className="text-lg font-semibold mb-4">Next Up</h3>

            {filteredSongs.slice(0, 5).map((song) => (
              <div
                key={song.id}
                className={`flex items-center p-2 rounded-lg mb-2 cursor-pointer ${
                  currentSong && currentSong.id === song.id ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
                onClick={() => handleSongClick(song)}
              >
                <img
                  src={song.coverUrl || '/api/placeholder/48/48'}
                  alt={song.title}
                  className="h-12 w-12 object-cover rounded mr-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title || 'Unknown Title'}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist || 'Unknown Artist'}</p>
                  <p className="text-xs text-pink-400">{formatTime(song.duration || 180)}</p>
                </div>
              </div>
            ))}

            <h3 className="text-lg font-semibold mt-6 mb-4">Related to</h3>

            {filteredSongs.slice(-4).reverse().map((song) => (
              <div
                key={`related-${song.id}`}
                className="flex items-center p-2 rounded-lg mb-2 cursor-pointer hover:bg-gray-700"
                onClick={() => handleSongClick(song)}
              >
                <img
                  src={song.coverUrl || '/api/placeholder/48/48'}
                  alt={song.title}
                  className="h-12 w-12 object-cover rounded mr-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{song.title || 'Unknown Title'}</p>
                  <p className="text-xs text-gray-400 truncate">{song.artist || 'Unknown Artist'}</p>
                  <p className="text-xs text-pink-400">{formatTime(song.duration || 180)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Player - Fixed */}
        <div className="fixed bottom-0 left-20 right-0 h-24 bg-gray-800 border-t border-gray-700 px-6 flex items-center z-10">
          {currentSong ? (
            <>
              <div className="flex items-center w-64">
                <img
                  src={currentSong.coverUrl || '/api/placeholder/48/48'}
                  alt={currentSong.title}
                  className="h-16 w-16 object-cover rounded mr-4"
                />
                <div>
                  <h3 className="font-medium">{currentSong.title || 'Unknown Title'}</h3>
                  <p className="text-sm text-gray-400">{currentSong.artist || 'Unknown Artist'}</p>
                </div>
                <button className="ml-4 text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={skipBackward}
                    className={`text-gray-300 hover:text-white ${
                      !currentSong || isLoading || !filteredSongs.length
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!currentSong || isLoading || !filteredSongs.length}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className={`h-10 w-10 rounded-full bg-white text-black flex items-center justify-center ${
                      !currentSong || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={!currentSong || isLoading}
                  >
                    {isPlaying ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={skipForward}
                    className={`text-gray-300 hover:text-white ${
                      !currentSong || isLoading || !filteredSongs.length
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!currentSong || isLoading || !filteredSongs.length}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                      />
                    </svg>
                  </button>
                </div>

                <div className="w-full flex items-center mt-2 space-x-2">
                  <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                  <div
                    className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer relative"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-pink-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                    <div
                      className="absolute h-3 w-3 bg-pink-500 rounded-full top-1/2 transform -translate-y-1/2"
                      style={{ left: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="w-64 flex items-center justify-end space-x-4">
                <button className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
                <div className="flex items-center space-x-1">
                  <button className="text-gray-400 hover:text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 010-7.072m12.728 3.536a3 3 0 00-4.243-4.243m-9.9 2.828a9 9 0 010-12.728"
                      />
                    </svg>
                  </button>
                  <div className="w-20 h-1 bg-gray-600 rounded-full">
                    <div className="h-full bg-gray-300 rounded-full w-3/4"></div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-gray-400">
              <p>Select a song to play</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Screen Player Modal */}
      {currentSong && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center ${
            isModalOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="max-w-lg w-full px-8 py-12 flex flex-col items-center">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative">
              <div className="relative">
                {renderCircularProgress()}
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src={currentSong.coverUrl || '/api/placeholder/200/200'}
                    alt={currentSong.title}
                    className="h-36 w-36 object-cover rounded-full"
                  />
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-xl font-bold text-white">{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <h2 className="text-2xl font-semibold text-white">{currentSong.title || 'Unknown Title'}</h2>
              <p className="text-lg text-gray-400">{currentSong.artist || 'Unknown Artist'}</p>
            </div>

            <div className="flex items-center space-x-12 mt-8">
              <button
                onClick={skipBackward}
                className={`text-gray-300 hover:text-white ${
                  !currentSong || isLoading || !filteredSongs.length ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!currentSong || isLoading || !filteredSongs.length}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z"
                  />
                </svg>
              </button>

              <button
                onClick={togglePlayPause}
                className={`h-16 w-16 rounded-full bg-white text-black flex items-center justify-center ${
                  !currentSong || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!currentSong || isLoading}
              >
                {isPlaying ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={skipForward}
                className={`text-gray-300 hover:text-white ${
                  !currentSong || isLoading || !filteredSongs.length ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!currentSong || isLoading || !filteredSongs.length}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z"
                  />
                </svg>
              </button>
            </div>

            <div className="w-full flex items-center mt-8 space-x-3">
              <span className="text-sm text-gray-400">{formatTime(currentTime)}</span>
              <div
                className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer relative"
                onClick={handleSeek}
              >
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${progress}%` }}></div>
                <div
                  className="absolute h-3 w-3 bg-pink-500 rounded-full top-1/2 transform -translate-y-1/2"
                  style={{ left: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;