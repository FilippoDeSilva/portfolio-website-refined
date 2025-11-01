import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseBuffer } from 'music-metadata';
import sharp from 'sharp';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { audioUrl, audioName } = await req.json();

    if (!audioUrl || !audioName) {
      return NextResponse.json(
        { error: 'audioUrl and audioName are required' },
        { status: 400 }
      );
    }

    // Download the audio file from Supabase
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio file: ${audioResponse.statusText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const buffer = Buffer.from(audioBuffer);

    // Extract metadata and thumbnail from audio file
    const metadata = await parseBuffer(buffer);
    
    if (!metadata.common.picture || metadata.common.picture.length === 0) {
      return NextResponse.json(
        { error: 'No embedded artwork found in audio file' },
        { status: 404 }
      );
    }

    // Get the first available picture (usually the album art)
    const picture = metadata.common.picture[0];
    
    // Process the image with Sharp to ensure it's in a web-friendly format
    const processedImageBuffer = await sharp(picture.data)
      .resize(512, 512, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Generate a unique filename for the thumbnail
    const audioBaseName = audioName.replace(/\.[^/.]+$/, ''); // Remove extension
    const thumbnailName = `${audioBaseName}_thumbnail_${Date.now()}.jpg`;
    const thumbnailPath = `music-thumbnails/${thumbnailName}`;

    // Upload thumbnail to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('blog-attachments')
      .upload(thumbnailPath, processedImageBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000' // Cache for 1 year
      });

    if (uploadError) {
      console.error('Thumbnail upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload thumbnail' },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded thumbnail
    const { data: { publicUrl: thumbnailUrl } } = supabase.storage
      .from('blog-attachments')
      .getPublicUrl(thumbnailPath);

    // Return metadata along with thumbnail URL
    const trackInfo = {
      title: metadata.common.title || audioBaseName,
      artist: metadata.common.artist || metadata.common.albumartist || 'Unknown Artist',
      album: metadata.common.album || 'Unknown Album',
      year: metadata.common.year || null,
      genre: metadata.common.genre && metadata.common.genre.length > 0 ? metadata.common.genre[0] : null,
      duration: metadata.format.duration || null,
      thumbnailUrl,
      thumbnailPath
    };

    return NextResponse.json({
      success: true,
      thumbnail: {
        url: thumbnailUrl,
        path: thumbnailPath,
        name: thumbnailName
      },
      metadata: trackInfo
    });

  } catch (error: any) {
    console.error('Thumbnail extraction error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to extract thumbnail', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
