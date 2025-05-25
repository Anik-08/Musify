import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');

    let songs;
    if (genre) {
      songs = await prisma.song.findMany({
        where: {
          genre: genre,
        },
      });
    } else {
      songs = await prisma.song.findMany();
    }

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}