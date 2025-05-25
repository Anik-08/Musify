import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { playlistId, songId } = await req.json();
    console.log('Adding song to playlist:', { playlistId, songId });

    if (!playlistId || !songId) {
      return NextResponse.json({ error: 'Missing playlistId or songId' }, { status: 400 });
    }

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
      },
    });

    return NextResponse.json(playlistSong, { status: 200 });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}