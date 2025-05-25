const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to upload file to Cloudinary
async function uploadToCloudinary(localPath, folder) {
  try {
    console.log(`Uploading ${localPath} to Cloudinary (${folder})...`);
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: folder === 'audio' ? 'video' : 'image',
    });
    console.log(`Uploaded successfully: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`Failed to upload ${localPath}:, error`);
    return null;
  }
}

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const songs = [
    {
      title: 'C U Again',
      artist: 'Cartoon, Jéja',
      album: 'Chill Vibes',
      genre: 'Drum & Bass',
      releaseDate: new Date('2016-12-13'),
      coverUrl: 'C U Again.jpg',
      audioUrl: 'C U Again.mp3',
    },
    {
      title: 'On & On',
      artist: 'Cartoon, Daniel Levi',
      album: 'Chill Vibes',
      genre: 'Electronic, Pop',
      releaseDate: new Date('2015-07-15'),
      coverUrl: 'On & On.jpg',
      audioUrl: 'On & On.mp3',
    },
    {
        title: 'Why We Lose',
        artist: 'Cartoon, Colemon Trapp',
        album: 'Chill Vibes',
        genre: 'Drum & Bass',
        releaseDate: new Date('2015-06-03'),
        coverUrl: 'Why We Lose.jpg',
        audioUrl: 'Why We Lose.mp3',
      },
      {
        title: 'Invincible',
        artist: 'DEAF KEV',
        album: 'Chill Vibes',
        genre: 'Glitch Hop',
        releaseDate: new Date('2015-05-14'),
        coverUrl: 'Invincible.jpg',
        audioUrl: 'Invincible.mp3',
      },
      {
        title: 'My Heart',
        artist: 'Different Heaven, EH!DE',
        album: 'Chill Vibes',
        genre: 'Drumstep',
        releaseDate: new Date('2013-11-13'),
        coverUrl: 'My Heart.jpg',
        audioUrl: 'My Heart.mp3',
      },
      {
        title: 'Nekozilla',
        artist: 'Different Heaven',
        album: 'Chill Vibes',
        genre: 'Electronic',
        releaseDate: new Date('2015-08-06'),
        coverUrl: 'Nekozilla.jpg',
        audioUrl: 'Nekozilla.mp3',
      },
      {
        title: 'Blank',
        artist: 'Disfigure',
        album: 'Chill Vibes',
        genre: 'Melodic Dubstep',
        releaseDate: new Date('2013-05-01'),
        coverUrl: 'Blank.jpg',
        audioUrl: 'Blank.mp3',
      },
      {
        title: 'Savannah',
        artist: 'Diviners',
        album: 'Chill Vibes',
        genre: 'Electronic',
        releaseDate: new Date('2015-11-25'),
        coverUrl: 'Savannah.jpg',
        audioUrl: 'Savannah.mp3',
      },
      {
        title: 'Royalty',
        artist: 'Egzod & Maestro Chives',
        album: 'Chill Vibes',
        genre: 'Electronic',
        releaseDate: new Date('2021-04-02'),
        coverUrl: 'Royalty.jpg',
        audioUrl: 'Royalty.mp3',
      },
      {
        title: 'Symbolism',
        artist: 'Electro-Light',
        album: 'Chill Vibes',
        genre: ' Electronic',
        releaseDate: new Date('2016-03-18'),
        coverUrl: 'Symbolism.jpg',
        audioUrl: 'Symbolism.mp3',
      },
      {
        title: 'Heroes Tonight',
        artist: 'Janji, Johnning',
        album: 'Chill Vibes',
        genre: 'Progressive House',
        releaseDate: new Date('2015-06-09'),
        coverUrl: 'Heroes Tonight.jpg',
        audioUrl: 'Heroes Tonight.mp3',
      },
      {
        title: 'Invisible',
        artist: 'Juilius Dreisig, Zeus X Crona',
        album: 'Chill Vibes',
        genre: 'Electronic',
        releaseDate: new Date('2017-10-20'),
        coverUrl: 'Invisible.jpg',
        audioUrl: 'Invisible.mp3',
      },
      {
        title: 'Dreams pt. II',
        artist: 'Lost Sky, Sara',
        album: 'Chill Vibes',
        genre: 'Trap',
        releaseDate: new Date('2016-09-27'),
        coverUrl: 'Dreams pt. II.jpg',
        audioUrl: 'Dreams pt. II.mp3',
      },
      {
        title: 'Fearless pt. II',
        artist: 'Lost Sky, Chris Linton',
        album: 'Chill Vibes',
        genre: 'Trap',
        releaseDate: new Date('2017-12-27'),
        coverUrl: 'Fearless pt. II.jpg',
        audioUrl: 'Fearless pt. II.mp3',
      },
      {
        title: 'Where We Started',
        artist: 'Lost Sky, Jex',
        album: 'Chill Vibes',
        genre: 'Melodic Dubstep',
        releaseDate: new Date('2018-01-12'),
        coverUrl: 'Where We Started.jpg',
        audioUrl: 'Where We Started.mp3',
      },
      {
        title: 'Light it Up',
        artist: 'Robin Hustin, TobiMorrow ',
        album: 'Chill Vibes',
        genre: 'Future Bass',
        releaseDate: new Date('2018-08-11'),
        coverUrl: 'Light it Up.jpg',
        audioUrl: 'Light it Up.mp3',
      },
      {
        title: 'Ark',
        artist: 'Ship Wrek',
        album: 'Chill Vibes',
        genre: 'Future Bass',
        releaseDate: new Date('2016-02-05'),
        coverUrl: 'Ark.jpg',
        audioUrl: 'Ark.mp3',
      },
      {
        title: 'Shine',
        artist: 'Spektrem',
        album: 'Chill Vibes',
        genre: 'Progressive House',
        releaseDate: new Date('2016-03-16'),
        coverUrl: 'Shine.jpg',
        audioUrl: 'Shine.mp3',
      },
      {
        title: 'Cradles',
        artist: 'Sub Urban',
        album: 'Chill Vibes',
        genre: 'Pop',
        releaseDate: new Date('2017-05-14'),
        coverUrl: 'Cradles.jpg',
        audioUrl: 'Cradles.mp3',
      },
    // ...add all other songs here...
  ];

  const data = [];

  for (const song of songs) {
    const coverPath = path.join(projectRoot, 'public', 'covers', song.coverUrl);
    const audioPath = path.join(projectRoot, 'public', 'audio', song.audioUrl);
    console.log(`\nProcessing song: ${song.title}`);

    const coverCloudUrl = await uploadToCloudinary(coverPath, 'covers');
    const audioCloudUrl = await uploadToCloudinary(audioPath, 'audio');

    if (!coverCloudUrl || !audioCloudUrl) {
      console.warn(`⚠️  Skipping ${song.title} due to upload failure.`);
      continue;
    }

    console.log(`✅ Upload completed for ${song.title}`);

    data.push({
      ...song,
      coverUrl: coverCloudUrl,
      audioUrl: audioCloudUrl,
    });
  }

  await prisma.song.createMany({ data });
  console.log("🎉 Seeded ${data.length} songs with Cloudinary URLs successfully.");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());     