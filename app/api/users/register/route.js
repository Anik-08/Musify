import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { Clerk } from '@clerk/clerk-sdk-node';

// Initialize Clerk Client with your secret key from environment variables
const clerkClient =  Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request) {
  const { clerkUserId, email, profileImageUrl } = await request.json();

  if (!clerkUserId || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Register or update the user in MongoDB via Prisma
    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: { email, profileImageUrl },
      create: { clerkUserId, email, profileImageUrl },
    });

    // Set isAdmin flag in Clerk's publicMetadata for specific users (e.g., based on email)
    const isAdmin = email === 'aniktiwary1234@gmail.com'; // Replace with your admin email
    await clerkClient.users.updateUser(clerkUserId, {
      publicMetadata: { isAdmin },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}