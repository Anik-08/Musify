import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient({ log: ['query', 'error'] });

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const songs = await prisma.song.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(songs, { status: 200 });
  } catch (error) {
    console.error('Error fetching user songs:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Failed to fetch songs', details: { message: error.message } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, artist, genre, audioUrl, audioPublicId, coverUrl, coverPublicId, duration, visibility } = await request.json();

    if (!title || !artist || !genre || !audioUrl || !audioPublicId || !coverUrl || !coverPublicId || !visibility) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        genre,
        audioUrl,
        audioPublicId,
        coverUrl,
        coverPublicId,
        duration,
        visibility,
        userId,
      },
    });

    return NextResponse.json(song, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: 'Failed to create song', details: { message: error.message, code: error.code, meta: error.meta } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}