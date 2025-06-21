// path: app/api/songs/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const songs = await prisma.song.findMany();
    console.log('Fetched songs:', songs); // Log to verify fields
    return NextResponse.json(songs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const songData = await request.json();
    console.log('Received song data:', songData);

    // Validate required fields
    if (
      !songData.title ||
      !songData.artist ||
      !songData.genre ||
      !songData.audioUrl ||
      !songData.audioPublicId ||
      !songData.coverUrl ||
      !songData.coverPublicId
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newSong = await prisma.song.create({
      data: {
        title: songData.title,
        artist: songData.artist,
        genre: songData.genre,
        audioUrl: songData.audioUrl,
        audioPublicId: songData.audioPublicId,
        coverUrl: songData.coverUrl,
        coverPublicId: songData.coverPublicId,
        duration: songData.duration || 180,
      },
    });

    console.log('Saved song:', newSong);
    return NextResponse.json(newSong, { status: 201 });
  } catch (error) {
    console.error('Error saving song:', error);
    return NextResponse.json({ error: 'Failed to save song', details: error.message }, { status: 500 });
  }
}