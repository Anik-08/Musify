'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Music, Pause, Play, SkipBack, SkipForward, Plus, Trash2, Heart } from 'lucide-react';
import Sidebar from '../component/Sidebar';

const PlaylistManager = ({ onPlaylistSelect }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistName, setSelectedPlaylistName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('library');
  const [favPlaylistId, setFavPlaylistId] = useState(null);
  const [favSongs, setFavSongs] = useState([]);
  const audioRef = useRef(null);
  const playPromiseRef = useRef(null);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const fetchPlaylists = async () => {
        try {
          const res = await fetch(`/api/playlists?userId=${user.id}`);
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setPlaylists(data);
            const favPlaylist = data.find((p) => p.name === 'Fav songs');
            if (!favPlaylist) {
              try {
                const createRes = await fetch('/api/playlists/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id, name: 'Fav songs' }),
                });
                if (createRes.ok) {
                  const newPlaylist = await createRes.json();
                  setFavPlaylistId(newPlaylist.id);
                  try {
                    const favRes = await fetch(`/api/playlists/${newPlaylist.id}`);
                    if (!favRes.ok) throw new Error(`HTTP error! Status: ${favRes.status}`);
                    const favData = await favRes.json();
                    if (Array.isArray(favData)) {
                      const songs = favData.map((item) => item.song.id);
                      setFavSongs(songs);
                    } else {
                      console.error('Expected an array, got:', favData);
                      setFavSongs([]);
                    }
                  } catch (error) {
                    console.error('Error fetching Fav songs:', error);
                    setFavSongs([]);
                  }
                  try {
                    const res = await fetch(`/api/playlists?userId=${user.id}`);
                    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
                    const updatedData = await res.json();
                    if (Array.isArray(updatedData)) {
                      setPlaylists(updatedData);
                    } else {
                      console.error('Expected an array, got:', updatedData);
                      setPlaylists([]);
                    }
                  } catch (error) {
                    console.error('Error fetching playlists:', error);
                    setPlaylists([]);
                  }
                }
              } catch (error) {
                console.error('Error creating Fav songs playlist:', error);
              }
            } else {
              setFavPlaylistId(favPlaylist.id);
              try {
                const favRes = await fetch(`/api/playlists/${favPlaylist.id}`);
                if (!favRes.ok) throw new Error(`HTTP error! Status: ${favRes.status}`);
                const favData = await favRes.json();
                if (Array.isArray(favData)) {
                  const songs = favData.map((item) => item.song.id);
                  setFavSongs(songs);
                } else {
                  console.error('Expected an array, got:', favData);
                  setFavSongs([]);
                }
              } catch (error) {
                console.error('Error fetching Fav songs:', error);
                setFavSongs([]);
              }
            }
          } else {
            console.error('Expected an array, got:', data);
            setPlaylists([]);
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
          setPlaylists([]);
        }
      };

      const fetchAllSongs = async () => {
        try {
          const res = await fetch('/api/songs');
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setAllSongs(data);
          } else {
            console.error('Expected an array, got:', data);
            setAllSongs([]);
          }
        } catch (error) {
          console.error('Error fetching songs:', error);
          setAllSongs([]);
        }
      };

      fetchPlaylists();
      fetchAllSongs();
    }
  }, [isLoaded, user]);

  const playSong = useCallback(async (song) => {
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
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }

    setIsLoading(true);
    setCurrentSong(song);
    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      playPromiseRef.current = audioRef.current.play();
      playPromiseRef.current.then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        playPromiseRef.current = null;
      }).catch((err) => {
        console.error('Error playing audio:', err);
        setIsLoading(false);
        setIsPlaying(false);
        playPromiseRef.current = null;
      });
    }
  }, [audioRef, playPromiseRef, setCurrentSong, setIsPlaying, setIsLoading]);

  const playNextSong = useCallback(() => {
    if (!currentSong || !playlistSongs.length) return;
    const currentIndex = playlistSongs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % playlistSongs.length;
    playSong(playlistSongs[nextIndex]);
  }, [currentSong, playlistSongs, playSong]);

  const playPrevSong = useCallback(() => {
    if (!currentSong || !playlistSongs.length) return;
    const currentIndex = playlistSongs.findIndex((song) => song.id === currentSong.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + playlistSongs.length) % playlistSongs.length;
    playSong(playlistSongs[prevIndex]);
  }, [currentSong, playlistSongs, playSong]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      const audio = audioRef.current;

      const handleLoadedMetadata = () => {
        console.log('Metadata loaded, duration:', audio.duration);
        setDuration(audio.duration || 0);
      };

      const handleTimeUpdate = () => {
        if (!audio.duration || isNaN(audio.duration)) {
          console.warn('Invalid duration:', audio.duration);
          setCurrentTime(0);
          setProgress(0);
          return;
        }
        console.log('Time update:', audio.currentTime, audio.duration);
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100);
      };

      const handleEnded = () => {
        console.log('Song ended');
        setIsPlaying(false);
        if (currentSong && playlistSongs.length) {
          const currentIndex = playlistSongs.findIndex((song) => song.id === currentSong.id);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % playlistSongs.length;
            playSong(playlistSongs[nextIndex]);
          }
        }
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);

      if (audio.readyState >= 2) {
        setDuration(audio.duration || 0);
      } else {
        audio.load();
      }

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentSong, playlistSongs, playSong]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const fetchFavSongs = async (playlistId) => {
    try {
      const res = await fetch(`/api/playlists/${String(playlistId)}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const songs = data.map((song) => song.id);
        setFavSongs(songs);
      } else {
        console.error('Expected an array, got:', data);
        setFavSongs([]);
      }
    } catch (error) {
      console.error('Error fetching Fav songs:', error);
      setFavSongs([]);
    }
  };

  const createPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName || !user) return;
    try {
      const res = await fetch('/api/playlists/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, name: newPlaylistName }),
      });
      if (res.ok) {
        setNewPlaylistName('');
        const updatedRes = await fetch(`/api/playlists?userId=${user.id}`);
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          if (Array.isArray(updatedData)) {
            setPlaylists(updatedData);
          }
        }
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const fetchPlaylistSongs = async (playlistId) => {
    console.log('Fetching songs for playlist:', playlistId);
    try {
      const res = await fetch(`/api/playlists/${String(playlistId)}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`HTTP error! Status: ${res.status}, Message: ${errorData.error || 'Unknown error'}`);
      }
      const data = await res.json();
      console.log('Playlist songs response:', data);
      if (Array.isArray(data)) {
        const songsList = data;
        console.log('Processed songs list:', songsList);
        setPlaylistSongs(songsList);
        setSelectedPlaylist(playlistId);
        setSelectedPlaylistName(playlists.find((p) => p.id === playlistId)?.name || '');
        onPlaylistSelect(songsList, playlistId);
      } else {
        console.error('Expected an array of song objects, got:', data);
        setPlaylistSongs([]);
      }
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      setPlaylistSongs([]);
    }
  };

  const deletePlaylist = async (playlistId) => {
    if (!user || !confirm('Are you sure you want to delete this playlist?')) return;
    if (playlistId === favPlaylistId) {
      alert('Cannot delete the "Fav songs" playlist.');
      return;
    }
    try {
      const res = await fetch('/api/playlists/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, playlistId }),
      });
      if (res.ok) {
        const updatedRes = await fetch(`/api/playlists?userId=${user.id}`);
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          if (Array.isArray(updatedData)) {
            setPlaylists(updatedData);
          }
        }
        if (selectedPlaylist === playlistId) {
          setSelectedPlaylist(null);
          setSelectedPlaylistName('');
          setPlaylistSongs([]);
        }
      }
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const addSongToPlaylist = async (playlistId, songId) => {
    try {
      const res = await fetch('/api/playlists/add-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songId }),
      });
      if (res.ok) {
        if (selectedPlaylist === playlistId) {
          fetchPlaylistSongs(playlistId);
        }
        if (playlistId === favPlaylistId) {
          fetchFavSongs(playlistId);
        }
      }
      setShowAddToPlaylist(null);
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
      const res = await fetch('/api/playlists/remove-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songId }),
      });
      if (res.ok) {
        if (selectedPlaylist === playlistId) {
          fetchPlaylistSongs(playlistId);
        }
        if (playlistId === favPlaylistId) {
          fetchFavSongs(playlistId);
        }
      }
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  const handleAddToFavSongs = (songId) => {
    if (favSongs.includes(songId)) {
      alert('This song is already in your Fav songs playlist.');
      return;
    }
    if (favPlaylistId) {
      addSongToPlaylist(favPlaylistId, songId);
    }
  };

  const togglePlayback = async () => {
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

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const seekPosition = e.nativeEvent.offsetX / e.target.clientWidth;
    const seekTime = duration * seekPosition;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setProgress(seekPosition * 100);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Plus className="h-6 w-6 mr-2 text-pink-500" />
              Create Playlist
            </h2>
            <form onSubmit={createPlaylist} className="flex space-x-4">
              <input
                type="text"
                placeholder="Playlist Name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full px-4 py-2 rounded-full bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button type="submit" className="px-4 py-2 bg-pink-500 text-white rounded-full">
                Create
              </button>
            </form>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Music className="h-6 w-6 mr-2 text-pink-500" />
              Your Playlists
            </h2>
            <div className="flex space-x-4 overflow-x-auto">
              {Array.isArray(playlists) && playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div key={playlist.id} className="flex items-center">
                    <button
                      onClick={() => fetchPlaylistSongs(playlist.id)}
                      className={`px-4 py-2 rounded-full ${
                        selectedPlaylist === playlist.id ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {playlist.name}
                    </button>
                    {playlist.name !== 'Fav songs' && (
                      <button
                        onClick={() => deletePlaylist(playlist.id)}
                        className="ml-2 p-2 text-red-500 hover:text-red-600 transition"
                        title="Delete Playlist"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No playlists available</p>
              )}
            </div>
          </div>
          {selectedPlaylist && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mt-4 mb-4">Songs in {selectedPlaylistName}</h3>
              {playlistSongs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlistSongs.map((song) => (
                    <div
                      key={song.id}
                      className={`bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-md relative ${
                        currentSong && currentSong.id === song.id
                          ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500'
                          : ''
                      }`}
                    >
                      <div className="relative">
                        <Image
                          src={song.coverUrl || '/api/placeholder/200/200'}
                          alt={song.title}
                          width={200}
                          height={200}
                          className="rounded mb-3 w-full h-48 object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/songs/${song.id}`}
                            className="text-white font-semibold hover:text-pink-400 transition"
                          >
                            {song.title || 'Unknown Title'}
                          </Link>
                          <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleAddToFavSongs(song.id)}
                            className="text-gray-400 hover:text-pink-500 transition"
                            title="Add to Fav songs"
                          >
                            <Heart size={20} fill={favSongs.includes(song.id) ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => removeSongFromPlaylist(selectedPlaylist, song.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Remove from Playlist"
                          >
                            <Trash2 size={20} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowAddToPlaylist(showAddToPlaylist === song.id ? null : song.id)}
                              className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition"
                            >
                              <Plus size={16} />
                            </button>
                            {showAddToPlaylist === song.id && (
                              <div className="absolute right-0 top-10 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
                                <div className="p-2">
                                  <p className="text-sm text-gray-400 mb-2">Add to Playlist</p>
                                  {playlists.map((playlist) => (
                                    <button
                                      key={playlist.id}
                                      onClick={() => addSongToPlaylist(playlist.id, song.id)}
                                      className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded transition"
                                    >
                                      {playlist.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => playSong(song)}
                            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition"
                          >
                            <Play size={16} fill="white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                  No songs in this playlist yet.
                </p>
              )}
            </div>
          )}
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mt-4 mb-4">All Songs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSongs.length > 0 ? (
                allSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-md relative ${
                      currentSong && currentSong.id === song.id
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500'
                        : ''
                    }`}
                  >
                    <div className="relative">
                      <Image
                        src={song.coverUrl || '/api/placeholder/200/200'}
                        alt={song.title}
                        width={200}
                        height={200}
                        className="rounded mb-3 w-full h-48 object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/songs/${song.id}`}
                          className="text-white font-semibold hover:text-pink-400 transition"
                        >
                          {song.title || 'Unknown Title'}
                        </Link>
                        <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAddToFavSongs(song.id)}
                          className="text-gray-400 hover:text-pink-500 transition"
                          title="Add to Fav songs"
                        >
                          <Heart size={20} fill={favSongs.includes(song.id) ? 'currentColor' : 'none'} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowAddToPlaylist(showAddToPlaylist === song.id ? null : song.id)}
                            className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition"
                          >
                            <Plus size={16} />
                          </button>
                          {showAddToPlaylist === song.id && (
                            <div className="absolute right-0 top-10 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
                              <div className="p-2">
                                <p className="text-sm text-gray-400 mb-2">Add to Playlist</p>
                                {playlists.map((playlist) => (
                                  <button
                                    key={playlist.id}
                                    onClick={() => addSongToPlaylist(playlist.id, song.id)}
                                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600 rounded transition"
                                  >
                                    {playlist.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => playSong(song)}
                          className="p-2 bg-pink-500 rounded-full hover:bg-pink-600 transition"
                        >
                          <Play size={16} fill="white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                  No songs available.
                </p>
              )}
            </div>
          </div>
        </div>
        {currentSong && (
          <>
            <audio
              ref={audioRef}
              src={currentSong.audioUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <div className="h-24 bg-gray-800 border-t border-gray-700 px-6 flex items-center">
              <div className="flex items-center w-64">
                <Image
                  src={currentSong.coverUrl || '/api/placeholder/48/48'}
                  alt={currentSong.title}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover rounded mr-4"
                />
                <div>
                  <Link
                    href={`/songs/${currentSong.id}`}
                    className="font-medium text-white hover:text-pink-400 transition"
                  >
                    {currentSong.title || 'Unknown Title'}
                  </Link>
                  <p className="text-sm text-gray-400">{currentSong.artist || 'Unknown Artist'}</p>
                </div>
                <button
                  onClick={() => handleAddToFavSongs(currentSong.id)}
                  className="ml-4 text-gray-400 hover:text-pink-500 transition"
                  title="Add to Fav songs"
                >
                  <Heart size={20} fill={favSongs.includes(currentSong.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex-1 flex flex-col items-center">
                {isLoading ? (
                  <p className="text-gray-300 text-sm">Loading...</p>
                ) : (
                  <>
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={playPrevSong}
                        className={`text-gray-300 hover:text-white ${
                          !currentSong || isLoading || !playlistSongs.length ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!currentSong || isLoading || !playlistSongs.length}
                      >
                        <SkipBack size={24} />
                      </button>
                      <button
                        onClick={togglePlayback}
                        className={`h-10 w-10 rounded-full bg-white text-black flex items-center justify-center ${
                          !currentSong || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!currentSong || isLoading}
                      >
                        {isPlaying ? (
                          <Pause size={20} fill="black" />
                        ) : (
                          <Play size={20} fill="black" />
                        )}
                      </button>
                      <button
                        onClick={playNextSong}
                        className={`text-gray-300 hover:text-white ${
                          !currentSong || isLoading || !playlistSongs.length ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={!currentSong || isLoading || !playlistSongs.length}
                      >
                        <SkipForward size={24} />
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
                  </>
                )}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;