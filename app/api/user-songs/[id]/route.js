import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient({ log: ['query', 'error'] });

export async function DELETE(request, { params }) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid song ID', details: { id } }, { status: 400 });
    }

    const song = await prisma.song.findUnique({ where: { id, userId } });
    if (!song) {
      return NextResponse.json({ error: 'Song not found or not owned by user' }, { status: 404 });
    }

    await prisma.song.delete({ where: { id } });
    return NextResponse.json({ message: 'Song deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting song:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: 'Failed to delete song', details: { message: error.message, code: error.code, meta: error.meta } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json({ error: 'Invalid song ID', details: { id } }, { status: 400 });
    }

    const { visibility } = await request.json();
    if (!['public', 'private'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility value' }, { status: 400 });
    }

    const song = await prisma.song.findUnique({ where: { id, userId } });
    if (!song) {
      return NextResponse.json({ error: 'Song not found or not owned by user' }, { status: 404 });
    }

    const updatedSong = await prisma.song.update({
      where: { id },
      data: { visibility },
    });

    return NextResponse.json(updatedSong, { status: 200 });
  } catch (error) {
    console.error('Error updating song visibility:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { error: 'Failed to update song visibility', details: { message: error.message, code: error.code, meta: error.meta } },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}