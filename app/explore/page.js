'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../component/Sidebar'; // Adjust the path based on your folder structure
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

const ExplorePage = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [activeTab, setActiveTab] = useState('explore');
  const router = useRouter();
  const { signOut } = useClerk();

  // Handle logout (optional additional logic)
  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };
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

  // Fetch songs by genre when a genre is selected
  useEffect(() => {
    if (!selectedGenre) {
      setFilteredSongs([]);
      return;
    }

    const fetchSongsByGenre = async () => {
      try {
        const res = await fetch(`/api/playlists/song-routes?genre=${encodeURIComponent(selectedGenre)}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          console.log(`Fetched songs for genre ${selectedGenre}:`, data);
          setFilteredSongs(data);
        } else {
          console.error('Expected an array for filtered songs, got:', data);
          setFilteredSongs([]);
        }
      } catch (error) {
        console.error('Error fetching songs by genre:', error);
        setFilteredSongs([]);
      }
    };

    fetchSongsByGenre();
  }, [selectedGenre]);

  // Group songs by genre, artist, and album
  const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const groupValue = item[key] || 'Unknown';
      if (!result[groupValue]) {
        result[groupValue] = [];
      }
      result[groupValue].push(item);
      return result;
    }, {});
  };

  const songsByGenre = groupBy(songs, 'genre');
  const songsByArtist = groupBy(songs, 'artist');
  const songsByAlbum = groupBy(songs, 'album');

  // Extract unique genres and artists
  const genres = Object.keys(songsByGenre);
  const artists = Object.keys(songsByArtist);
  const albums = Object.keys(songsByAlbum);

  // Generate placeholder artists with random names
  const placeholderArtists = [
    { id: 1, name: 'Alex Carter', imageUrl: '/api/placeholder/96/96' },
    { id: 2, name: 'Samantha Lee', imageUrl: '/api/placeholder/96/96' },
    { id: 3, name: 'Jordan Miles', imageUrl: '/api/placeholder/96/96' },
    { id: 4, name: 'Emily Rose', imageUrl: '/api/placeholder/96/96' },
    { id: 5, name: 'Michael Stone', imageUrl: '/api/placeholder/96/96' },
    { id: 6, name: 'Luna Gray', imageUrl: '/api/placeholder/96/96' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {loading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <>
            {/* Songs Available Section (Left-Right Scrollable) */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Songs Available</h2>
              {songs.length > 0 ? (
                <div className="flex overflow-x-auto space-x-4 pb-4">
                  {songs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-md flex-shrink-0 w-64"
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
                      <div>
                        <Link
                          href={`/songs/${song.id}`}
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

            {/* Genres Section (Clickable Buttons) */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Browse by Genre</h2>
              <div className="flex flex-wrap gap-3 mb-6">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
                    className={`px-4 py-2 rounded-full ${
                      selectedGenre === genre
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    } transition`}
                  >
                    {genre}
                  </button>
                ))}
              </div>

              {selectedGenre && (
                <div>
                  <h3 className="text-xl font-medium mb-2">Songs in {selectedGenre}</h3>
                  {filteredSongs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSongs.map((song) => (
                        <div
                          key={song.id}
                          className="bg-gray-800 hover:bg-gray-700 transition p-4 rounded-xl shadow-md"
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
                          <div>
                            <Link
                              href={`/songs/${song.id}`}
                              className="text-white font-semibold hover:text-pink-400 transition"
                            >
                              {song.title || 'Unknown Title'}
                            </Link>
                            <p className="text-sm text-gray-400">{song.artist || 'Unknown Artist'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                      No songs found for this genre.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Artists Section (Artist Names as Buttons in Grid) */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Artists</h2>
              {artists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {artists.map((artist) => (
                    <button
                      key={artist}
                      className="px-4 py-2 bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white rounded-lg transition"
                    >
                      {artist}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                  No artists available.
                </p>
              )}
            </section>

            {/* Albums Section (Box Buttons with Background) */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Albums</h2>
              {albums.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {albums.map((album) => (
                    <button
                      key={album}
                      className="px-4 py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white rounded-lg shadow-md hover:from-gray-600 hover:to-gray-500 transition"
                    >
                      {album}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                  No albums available.
                </p>
              )}
            </section>

            {/* Placeholder Artists Section (With Images) */}
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4">Featured Artists</h2>
              {placeholderArtists.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {placeholderArtists.map((artist) => (
                    <div key={artist.id} className="text-center">
                      <div className="relative w-24 h-24 mx-auto">
                        <Image
                          src={artist.imageUrl}
                          alt={artist.name}
                          width={96}
                          height={96}
                          className="rounded-full object-cover w-full h-full"
                        />
                      </div>
                      <p className="mt-2 text-sm text-white">{artist.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center p-4 bg-gray-800 rounded-xl">
                  No artists available.
                </p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;