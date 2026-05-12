import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const GOOGLE_API_KEY = process.env.VITE_GOOGLE_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function testYouTube() {
  console.log('--- YouTube API Test ---');
  console.log('Using API Key:', GOOGLE_API_KEY ? 'Present' : 'MISSING');

  if (!GOOGLE_API_KEY) {
    console.error('Error: VITE_GOOGLE_API_KEY is missing in .env');
    return;
  }

  const query = 'nature conservation';
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&key=${GOOGLE_API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      console.error('YouTube API Error:', data.error?.message || 'Unknown error');
      return;
    }

    console.log(`Success! Fetched ${data.items?.length || 0} videos.`);
    data.items?.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.snippet.title} (ID: ${item.id.videoId})`);
    });

    await testSupabase(data.items);
  } catch (err) {
    console.error('Network Error:', err.message);
  }
}

async function testSupabase(items) {
  console.log('\n--- Supabase Connection Test ---');
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Error: Supabase credentials missing in .env');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const testVideos = items.map(item => ({
    video_id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channel: item.snippet.channelTitle,
    published_at: item.snippet.publishedAt,
    fetched_at: new Date().toISOString(),
    view_count: 0,
    category_tag: 'eco'
  }));

  try {
    const { data, error } = await supabase
      .from('youtube_credits')
      .upsert(testVideos, { onConflict: 'video_id' })
      .select();

    if (error) {
      console.error('Supabase Upsert Error:', error.message);
      if (error.code === '42P01') {
        console.log('>>> TIP: The table "youtube_credits" does not exist in your Supabase DB.');
      } else if (error.code === '42501') {
        console.log('>>> TIP: Permission denied. Have you added the INSERT policy to "youtube_credits"?');
      }
    } else {
      console.log('Success! Successfully stored/updated videos in Supabase.');
    }
  } catch (err) {
    console.error('Supabase Client Error:', err.message);
  }
}

testYouTube();
