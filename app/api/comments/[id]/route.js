import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient({ log: ['query', 'error'] });

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid comment ID', details: { id } },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found', details: { id } },
        { status: 404 }
      );
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting comment:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      {
        error: 'Failed to delete comment',
        details: {
          message: error.message,
          code: error.code,
          meta: error.meta,
        },
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}