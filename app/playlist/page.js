'use client';
import PlaylistManager from '../playlist/PlaylistManager';

export default function PlaylistPage() {
  const handlePlaylistSelect = (songs, playlistId) => {
    console.log('Selected playlist:', playlistId, 'Songs:', songs);
    // Optional: Add logic (e.g., store songs in state or navigate)
    // Example: useRouter().push(`/playlist/${playlistId}`);
  };

  return (
    <div className="container min-w-screen  bg-gray-900 min-h-screen">
      <PlaylistManager onPlaylistSelect={handlePlaylistSelect} />
    </div>
  );
}