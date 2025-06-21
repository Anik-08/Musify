// script/updateSongs.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateSongs() {
  try {
    const songs = await prisma.song.findMany();
    console.log('Current songs:', songs);

    for (const song of songs) {
      let updates = {};
      if (!song.audioPublicId && song.audioUrl) {
        // Extract public_id from audioUrl (e.g., https://res.cloudinary.com/duvihtb1s/video/upload/v1234567890/audio/some_audio_id.mp3)
        const audioMatch = song.audioUrl.match(/\/v\d+\/(.+)\.\w+$/);
        if (audioMatch) updates.audioPublicId = audioMatch[1];
      }
      if (!song.coverPublicId && song.coverUrl) {
        // Extract public_id from coverUrl (e.g., https://res.cloudinary.com/duvihtb1s/image/upload/v1747840185/covers/byjwwly2lb5xrjt4okpy.jpg)
        const coverMatch = song.coverUrl.match(/\/v\d+\/(.+)\.\w+$/);
        if (coverMatch) updates.coverPublicId = coverMatch[1];
      }
      if (Object.keys(updates).length > 0) {
        await prisma.song.update({
          where: { id: song.id },
          data: updates,
        });
        console.log(`Updated song ${song.id}:`, updates);
      }
    }
  } catch (error) {
    console.error('Error updating songs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSongs();