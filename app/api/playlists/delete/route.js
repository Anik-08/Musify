import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  const { userId, playlistId } = await request.json();

  if (!userId || !playlistId) {
    return NextResponse.json({ error: 'Missing userId or playlistId' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.playlistSong.deleteMany({
      where: { playlistId },
    });

    const result = await prisma.playlist.deleteMany({
      where: { id: playlistId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}