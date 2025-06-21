import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      select: {
        id: true,
        songId: true,
        userId: true,
        username: true,
        comment: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group comments by songId and limit to 10 per song
    const groupedComments = comments.reduce((acc, comment) => {
      const songId = comment.songId;
      if (!acc[songId]) {
        acc[songId] = [];
      }
      acc[songId].push(comment);
      // Ensure only the 10 most recent comments per song
      acc[songId] = acc[songId].slice(0, 10);
      return acc;
    }, {});

    return NextResponse.json(groupedComments, { status: 200 });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { songId, userId, username, comment } = await request.json();
    if (!songId || !userId || !username || !comment) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify song and user exist
    const song = await prisma.song.findUnique({ where: { id: songId } });
    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });

    if (!song || !user) {
      return NextResponse.json({ error: 'Song or user not found' }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        songId,
        userId: user.id, // Use the Prisma User.id (ObjectId) for the relation
        username,
        comment,
      },
      select: {
        id: true,
        songId: true,
        userId: true,
        username: true,
        comment: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}