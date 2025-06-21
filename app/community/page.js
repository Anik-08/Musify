'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../component/Sidebar'; // Adjust path as needed
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';

const CommunityPage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [newComment, setNewCommentInput] = useState({});
  const [selectedSong, setSelectedSong] = useState(null);
  const [activeTab, setActiveTab] = useState('community');
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const songsRes = await fetch('/api/playlists/song-routes');
        if (!songsRes.ok) throw new Error(`HTTP error! Status: ${songsRes.status}`);
        const songsData = await songsRes.json();
        if (Array.isArray(songsData)) {
          setSongs(songsData);
        } else {
          console.error('Expected an array for songs, got:', songsData);
          setSongs([]);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Fetch comments for all songs
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch('/api/comments');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`HTTP error! Status: ${res.status}, Details: ${JSON.stringify(errorData)}`);
        }
        const data = await res.json();
        if (typeof data === 'object') {
          setComments(data);
        } else {
          console.error('Expected an object for comments, got:', data);
          setComments({});
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments({});
      }
    };

    fetchComments();
  }, []);

  // Handle comment submission
  const handleCommentSubmit = async (songId) => {
    if (!isSignedIn) {
      alert('Please sign in to leave a comment.');
      return;
    }

    if (!newComment[songId]?.trim()) {
      alert('Comment cannot be empty.');
      return;
    }

    try {
      console.log('POST payload:', {
        songId,
        userId: user.id,
        username: user.username || user.firstName || 'Anonymous',
        comment: newComment[songId],
      });
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          userId: user.id,
          username: user.username || user.firstName || 'Anonymous',
          comment: newComment[songId],
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`HTTP error! Status: ${res.status}, Details: ${JSON.stringify(errorData)}`);
      }
      const newCommentData = await res.json();
      setComments((prev) => ({
        ...prev,
        [songId]: [...(prev[songId] || []), newCommentData].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 10),
      }));
      setNewCommentInput((prev) => ({ ...prev, [songId]: '' }));
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert(`Failed to submit comment: ${error.message}`);
    }
  };

  // Handle song selection
  const handleSongClick = (song) => {
    setSelectedSong(song);
  };

  // Close dialog
  const closeDialog = () => {
    setSelectedSong(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-full w-20 bg-gray-800 z-20">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />
      </div>

      {/* Main Content */}
      <div className="ml-20 flex-1 p-8 overflow-auto">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <>
            {/* Songs Grid */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Community Songs</h2>
              {songs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => handleSongClick(song)}
                      className="bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-md cursor-pointer"
                    >
                      <div className="relative">
                        <Image
                          src={song.coverUrl || '/api/placeholder/200/200'}
                          alt={song.title}
                          width={150}
                          height={150}
                          className="rounded mb-3 w-full h-48 object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/songs/${song.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-white font-semibold hover:text-pink-400 transition"
                        >
                          {song.title || 'Unknown Title'}
                        </Link>
                        <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
                        <p className="text-sm text-gray-400">{song.album || 'Unknown Album'}</p>
                        <p className="text-sm text-gray-400">{song.genre || 'Unknown Genre'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                  No songs available.
                </p>
              )}
            </section>
          </>
        )}
      </div>

      {/* Comment Dialog */}
      {selectedSong && (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-gray-800 shadow-lg p-6 overflow-y-auto transition-transform duration-300 transform translate-x-0 z-50">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Comments for {selectedSong.title}</h2>
            <button
              onClick={closeDialog}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>
          </div>
          <div className="mb-4">
            <Image
              src={selectedSong.coverUrl || '/api/placeholder/200/200'}
              alt={selectedSong.title}
              width={200}
              height={200}
              className="rounded w-full h-48 object-cover"
            />
            <p className="text-sm text-gray-400 mt-2">{selectedSong.artist || 'Unknown Artist'}</p>
            <p className="text-sm text-gray-400">{selectedSong.album || 'Unknown Album'}</p>
            <p className="text-sm text-gray-400">{selectedSong.genre || 'Unknown Genre'}</p>
          </div>
          <div className="max-h-96 overflow-y-auto mb-4">
            {(comments[selectedSong.id] || []).length > 0 ? (
              [...(comments[selectedSong.id] || [])]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map((comment, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg mb-2">
                    <p className="text-sm font-semibold text-pink-400">{comment.username}</p>
                    <p className="text-sm text-gray-300">{comment.comment}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-gray-400 text-sm">No comments yet.</p>
            )}
          </div>
          <div className="flex flex-col">
            <textarea
              value={newComment[selectedSong.id] || ''}
              onChange={(e) =>
                setNewCommentInput((prev) => ({
                  ...prev,
                  [selectedSong.id]: e.target.value,
                }))
              }
              placeholder="Leave a comment..."
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-pink-500 resize-none"
              rows={3}
            />
            <button
              onClick={() => handleCommentSubmit(selectedSong.id)}
              className="mt-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
            >
              Post Comment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityPage;