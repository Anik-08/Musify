import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function POST(request) {
  const { clerkUserId, email, profileImageUrl } = await request.json();

  try {
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: { email, profileImageUrl },
      create: { clerkUserId, email, profileImageUrl },
    });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}