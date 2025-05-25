import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { playlistId, songId } = await req.json();
    console.log('Removing song from playlist:', { playlistId, songId });

    if (!playlistId || !songId) {
      return NextResponse.json({ error: 'Missing playlistId or songId' }, { status: 400 });
    }

    // Check if the playlist-song association exists
    const playlistSong = await prisma.playlistSong.findFirst({
      where: {
        playlistId,
        songId,
      },
    });

    if (!playlistSong) {
      return NextResponse.json(
        { error: 'Song not found in the specified playlist' },
        { status: 404 }
      );
    }

    // Remove the song from the playlist
    await prisma.playlistSong.delete({
      where: {
        id: playlistSong.id,
      },
    });

    return NextResponse.json({ message: 'Song removed from playlist successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error removing song from playlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}