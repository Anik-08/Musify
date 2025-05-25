'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Pause, Play, SkipBack, SkipForward, Volume2, Heart, Share2, Plus } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

const SongDetailPage = () => {
  const [song, setSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const audioRef = useRef(null);
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Fetch song details
  useEffect(() => {
    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        setSong(data);
      } catch (error) {
        console.error('Error fetching song:', error);
      }
    };

    if (id) {
      fetchSong();
    }
  }, [id]);
useEffect(() => {
  if (isLoaded && user) {
    const fetchPlaylists = async () => {
      try {
        const res = await fetch(`/api/playlists?userId=${user.id}`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlaylists(data);
        } else {
          console.error('Expected an array, got:', data);
          setPlaylists([]);
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setPlaylists([]);
      }
    };
    fetchPlaylists();
  }
}, [isLoaded, user]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
    // You would add API call here to save the like status
  };

  const addToPlaylist = async (playlistId) => {
    if (!song) return;
    try {
      const res = await fetch('/api/playlists/add-song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, songId: song.id }),
      });
      if (res.ok) {
        setShowPlaylists(false);
        // Show success notification
      }
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20 pb-32">
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src={song.audioUrl} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white transition flex items-center"
        >
          ← Back
        </button>

        {/* Song Header */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start mb-12">
          {/* Song Cover Image */}
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-lg shadow-2xl overflow-hidden mb-6 lg:mb-0 lg:mr-8">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ 
                backgroundImage: song.coverUrl ? `url(${song.coverUrl})` : 'linear-gradient(to right, #f46b45, #eea849)' 
              }}
            ></div>
          </div>

          {/* Song Info */}
          <div className="text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{song.title}</h1>
            <h2 className="text-xl md:text-2xl text-gray-300 mb-4">{song.artist}</h2>
            
            {song.album && (
              <p className="text-gray-400 mb-2">Album: {song.album}</p>
            )}
            
            {song.releaseDate && (
              <p className="text-gray-400 mb-6">Released: {new Date(song.releaseDate).toLocaleDateString()}</p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {/* Play Button */}
              <button 
                onClick={togglePlayback}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:opacity-90 transition shadow-lg"
              >
                {isPlaying ? (
                  <>
                    <Pause size={20} className="mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={20} className="mr-2" />
                    Play
                  </>
                )}
              </button>

              {/* Like Button */}
              <button 
                onClick={toggleLike}
                className={`flex items-center px-4 py-3 rounded-full transition ${
                  liked 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart size={20} className={liked ? 'fill-white' : ''} />
              </button>

              {/* Add to Playlist Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowPlaylists(!showPlaylists)}
                  className="flex items-center px-4 py-3 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition"
                >
                  <Plus size={20} />
                </button>

                {/* Playlist Dropdown */}
                {showPlaylists && (
                  <div className="absolute z-50 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1">
                    <h3 className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">Add to playlist:</h3>
                    {playlists.length > 0 ? (
                      playlists.map(playlist => (
                        <button
                          key={playlist.id}
                          onClick={() => addToPlaylist(playlist.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition"
                        >
                          {playlist.name}
                        </button>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-sm text-gray-400">No playlists available</p>
                    )}
                  </div>
                )}
              </div>

              {/* Share Button */}
              <button 
                className="flex items-center px-4 py-3 bg-gray-800 text-gray-300 rounded-full hover:bg-gray-700 transition"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Song Description / Lyrics */}
        {song.description && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">About</h3>
            <p className="text-gray-300">{song.description}</p>
          </div>
        )}

        {song.lyrics && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">Lyrics</h3>
            <div className="bg-gray-800 bg-opacity-50 p-6 rounded-lg">
              <pre className="text-gray-300 whitespace-pre-wrap font-sans">
                {song.lyrics}
              </pre>
            </div>
          </div>
        )}

        {/* Related Tracks */}
        {song.relatedTracks && song.relatedTracks.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">You Might Also Like</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {song.relatedTracks.map(track => (
                <div 
                  key={track.id} 
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer"
                  onClick={() => router.push(`/songs/${track.id}`)}
                >
                  <div 
                    className="w-full aspect-square rounded bg-gray-700 mb-3 bg-cover bg-center"
                    style={{ backgroundImage: track.coverUrl ? `url(${track.coverUrl})` : 'none' }}
                  ></div>
                  <p className="text-white font-medium truncate">{track.title}</p>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SongDetailPage;