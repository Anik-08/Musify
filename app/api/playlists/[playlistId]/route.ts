// app/api/playlists/[playlistId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  const { playlistId } = await params; // Await params to resolve Promise

  if (!playlistId) {
    return NextResponse.json({ error: 'Missing playlistId' }, { status: 400 });
  }

  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId }, // String-based ID
      include: {
        songs: {
          include: { song: true },
        },
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const songs = playlist.songs.map((playlistSong) => playlistSong.song);
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist songs' },
      { status: 500 }
    );
  }
}