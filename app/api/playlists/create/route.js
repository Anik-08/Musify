import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  const { userId, name } = await request.json();

  if (!userId || !name) {
    return NextResponse.json({ error: 'Missing userId or name' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const playlist = await prisma.playlist.create({
      data: {
        userId: user.id,
        name,
      },
    });

    return NextResponse.json({ success: true, playlist }, { status: 201 });
  } catch (error) {
    console.error('Error creating playlist:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}