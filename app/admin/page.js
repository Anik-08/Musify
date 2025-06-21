'use client';
import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const AdminPage = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [songs, setSongs] = useState([]);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [isSongsLoading, setIsSongsLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [deleteCommentStatus, setDeleteCommentStatus] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      const adminEmail = 'aniktiwary1234@gmail.com';
      const isAdmin = user.primaryEmailAddress?.emailAddress === adminEmail;
      console.log('Admin check - Email:', user.primaryEmailAddress?.emailAddress, 'Is Admin:', isAdmin);
      if (!isAdmin) {
        console.log('User is not an admin, redirecting to dashboard');
        router.push('/dashboard');
      }
    }
  }, [isLoaded, user, router]);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsSongsLoading(true);
      try {
        const res = await fetch('/api/songs');
        if (!res.ok) throw new Error(`Failed to fetch songs: ${res.status}`);
        const data = await res.json();
        console.log('Fetched songs:', data);
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setSongs([]);
      } finally {
        setIsSongsLoading(false);
      }
    };

    const fetchComments = async () => {
      setIsCommentsLoading(true);
      try {
        const res = await fetch('/api/comments');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(`Failed to fetch comments: ${res.status}, ${JSON.stringify(errorData)}`);
        }
        const data = await res.json();
        console.log('Fetched comments:', data);
        const flatComments = Object.values(data).flat();
        setComments(flatComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      } finally {
        setIsCommentsLoading(false);
      }
    };

    fetchSongs();
    fetchComments();
  }, []);

  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!title || !artist || !genre || !audioFile || !coverFile) {
      setUploadStatus('Please fill in all fields and select both an audio file and a cover image.');
      return;
    }

    setUploadStatus('Uploading...');
    try {
      const audioFormData = new FormData();
      audioFormData.append('file', audioFile);
      audioFormData.append('upload_preset', 'unsigned_audio');
      audioFormData.append('resource_type', 'video');
      audioFormData.append('folder', 'audio');

      const audioResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: audioFormData,
        }
      );
      const audioData = await audioResponse.json();
      if (!audioResponse.ok) throw new Error('Failed to upload audio file: ' + audioData.error?.message);

      const coverFormData = new FormData();
      coverFormData.append('file', coverFile);
      coverFormData.append('upload_preset', 'unsigned_image');
      coverFormData.append('folder', 'covers');

      const coverResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: coverFormData,
        }
      );
      const coverData = await coverResponse.json();
      if (!coverResponse.ok) throw new Error('Failed to upload cover image: ' + coverData.error?.message);

      const songData = {
        title,
        artist,
        genre,
        audioUrl: audioData.secure_url,
        audioPublicId: audioData.public_id,
        coverUrl: coverData.secure_url,
        coverPublicId: coverData.public_id,
        duration: audioData.duration || 180,
      };
      console.log('Saving song data:', songData);

      const saveResponse = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error('Failed to save song to database: ' + errorData.error);
      }

      const newSong = await saveResponse.json();
      setSongs((prev) => [...prev, newSong]);

      setTitle('');
      setArtist('');
      setGenre('');
      setAudioFile(null);
      setCoverFile(null);
      document.getElementById('audioFileInput').value = '';
      document.getElementById('coverFileInput').value = '';
      setUploadStatus('Song added successfully!');
    } catch (error) {
      console.error('Error adding song:', error);
      setUploadStatus('Failed to add song: ' + error.message);
    }
  };

  const handleDeleteSong = async (songId, audioPublicId, coverPublicId) => {
    setDeleteStatus('Deleting...');
    console.log('Deleting song with ID:', songId, 'Audio public_id:', audioPublicId, 'Cover public_id:', coverPublicId);

    if (!audioPublicId || !coverPublicId) {
      setDeleteStatus('Failed to delete song: Missing audioPublicId or coverPublicId');
      return;
    }

    try {
      const deleteSongResponse = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      const deleteSongData = await deleteSongResponse.json();
      if (!deleteSongResponse.ok) {
        throw new Error(`Failed to delete song: ${deleteSongData.error || 'Unknown error'}`);
      }

      const res = await fetch('/api/songs');
      if (!res.ok) throw new Error('Failed to fetch songs');
      const data = await res.json();
      setSongs(data);

      setDeleteStatus('Song deleted successfully!');
    } catch (error) {
      console.error('Error deleting song:', error);
      setDeleteStatus(`Failed to delete song: ${error.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeleteCommentStatus('Deleting...');
    console.log('Deleting comment with ID:', commentId);

    try {
      const deleteCommentResponse = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      const deleteCommentData = await deleteCommentResponse.json();
      if (!deleteCommentResponse.ok) {
        throw new Error(`Failed to delete comment: ${deleteCommentData.error || 'Unknown error'}`);
      }

      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      setDeleteCommentStatus('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      setDeleteCommentStatus(`Failed to delete comment: ${error.message}`);
    }
  };

  if (!isLoaded || !user) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-600 overflow-hidden">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src="https://via.placeholder.com/40"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <button
              onClick={() => signOut(() => router.push('/'))}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Add New Song</h2>
          <form onSubmit={handleAddSong} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                placeholder="Enter song title"
              />
            </div>
            <div>
              <label htmlFor="artist" className="block text-sm font-medium mb-1">Artist</label>
              <input
                id="artist"
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                placeholder="Enter artist name"
              />
            </div>
            <div>
              <label htmlFor="genre" className="block text-sm font-medium mb-1">Genre</label>
              <input
                id="genre"
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                placeholder="Enter genre"
              />
            </div>
            <div>
              <label htmlFor="audioFileInput" className="block text-sm font-medium mb-1">Audio File</label>
              <input
                id="audioFileInput"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files[0])}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-gray-300"
              />
            </div>
            <div>
              <label htmlFor="coverFileInput" className="block text-sm font-medium mb-1">Cover Image</label>
              <input
                id="coverFileInput"
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files[0])}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 transition text-gray-300"
              />
            </div>
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded transition"
            >
              Add Song
            </button>
            {uploadStatus && (
              <p className={`mt-2 text-sm ${uploadStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                {uploadStatus}
              </p>
            )}
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 col-span-2 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Manage Songs</h2>
            {isSongsLoading ? (
              <p className="text-gray-400">Loading songs...</p>
            ) : songs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition flex flex-col justify-between h-full"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        src={song.coverUrl || '/api/placeholder/48/48'}
                        alt={song.title}
                        width={48}
                        height={48}
                        className="rounded"
                      />
                      <div className="truncate">
                        <p className="font-medium text-sm truncate">{song.title || 'Unknown Title'}</p>
                        <p className="text-xs text-gray-400 truncate">{song.artist || 'Unknown Artist'}</p>
                        <p className="text-xs text-gray-500 truncate">{song.genre || 'Unknown Genre'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSong(song.id, song.audioPublicId, song.coverPublicId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition mt-4 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No songs available.</p>
            )}
            {deleteStatus && (
              <p className={`mt-4 text-sm ${deleteStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                {deleteStatus}
              </p>
            )}
          </div>

          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Manage Comments</h2>
            {isCommentsLoading ? (
              <p className="text-gray-400">Loading comments...</p>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-center justify-between bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition"
                  >
                    <div>
                      <p className="font-medium">{comment.username || 'Unknown User'}</p>
                      <p className="text-sm text-gray-300">{comment.comment}</p>
                      <p className="text-sm text-gray-500">Song ID: {comment.songId}</p>
                      <p className="text-sm text-gray-500">
                        Posted: {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No comments available.</p>
            )}
            {deleteCommentStatus && (
              <p className={`mt-4 text-sm ${deleteCommentStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                {deleteCommentStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;