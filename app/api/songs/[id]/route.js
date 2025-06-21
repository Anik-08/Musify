import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request, { params }) {
  try {
    const { songId } = params;

    if (!songId) {
      return NextResponse.json({ error: 'Missing song ID' }, { status: 400 });
    }

    // 1. Fetch the song from the database
    const song = await prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const { audioPublicId, coverPublicId } = song;

    if (!audioPublicId || !coverPublicId) {
      return NextResponse.json(
        { error: 'Missing audioPublicId or coverPublicId in song data' },
        { status: 400 }
      );
    }

    // 2. Delete audio from Cloudinary
    const audioDeleteResult = await cloudinary.uploader.destroy(audioPublicId, {
      resource_type: 'video',
    });

    if (!['ok', 'not found'].includes(audioDeleteResult.result)) {
      console.warn('Audio file deletion failed:', audioDeleteResult);
    }

    // 3. Delete cover image from Cloudinary
    const coverDeleteResult = await cloudinary.uploader.destroy(coverPublicId, {
      resource_type: 'image',
    });

    if (!['ok', 'not found'].includes(coverDeleteResult.result)) {
      console.warn('Cover image deletion failed:', coverDeleteResult);
    }

    // 4. Delete the song record from the database
    await prisma.song.delete({
      where: { id: songId },
    });

    return NextResponse.json(
      { message: 'Song and assets deleted successfully', deletedSong: song },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'Failed to delete song', details: error.message },
      { status: 500 }
    );
  }
}
