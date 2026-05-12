import { CONFIG } from '../config';
import { supabase } from '../lib/supabase';

export interface YouTubeVideo {
  id?: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel: string;
  published_at: string;
  fetched_at: string;
  last_shown_at?: string;
  view_count: number;
  category_tag: 'eco' | 'plastic' | 'nature' | 'plants';
}

export const youtubeService = {
  async fetchNewVideos(force = false) {
    if (!CONFIG.API_KEYS.GOOGLE) {
      console.warn('YouTube: Google API Key missing.');
      return null;
    }

    try {
      if (!force) {
        const lastFetch = localStorage.getItem('youtube_last_fetch');
        if (lastFetch) {
          const hoursSinceLastFetch = (Date.now() - parseInt(lastFetch)) / (1000 * 60 * 60);
          if (hoursSinceLastFetch < 24) return null;
        }
      }

      const queryPool = [
        '45% plastic avoidance strategies',
        'how to reduce plastic waste by 45 percent',
        'sustainability innovation documentary 2024', 
        'plastic recycling technology advancements', 
        'ocean plastic cleanup technology',
        'circular economy explained',
        'environmental engineering restoration'
      ];
      
      const blacklist = ['drama', 'movie', 'reaction', 'roast', 'funny', 'music', 'hindi', 'tamil'];

      const selectedQueries = [...queryPool].sort(() => Math.random() - 0.5).slice(0, 2);
      let allFetchedVideos: YouTubeVideo[] = [];

      for (const query of selectedQueries) {
        try {
          const params = new URLSearchParams({
            part: 'snippet',
            maxResults: '10', 
            q: query,
            type: 'video',
            videoEmbeddable: 'true',
            relevanceLanguage: 'en',
            safeSearch: 'strict',
            key: CONFIG.API_KEYS.GOOGLE || ''
          });

          const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
          if (!response.ok) continue;

          const data = await response.json();
          if (!data.items) continue;

          const filtered = data.items
            .filter((item: any) => {
              if (!item.id?.videoId || !item.snippet) return false;
              const title = item.snippet.title.toLowerCase();
              return !blacklist.some(word => title.includes(word));
            })
            .map((item: any) => ({
              video_id: item.id.videoId,
              title: item.snippet.title,
              thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
              channel: item.snippet.channelTitle,
              published_at: item.snippet.publishedAt,
              fetched_at: new Date().toISOString(),
              view_count: 0,
              category_tag: 'eco'
            }));
          
          allFetchedVideos = [...allFetchedVideos, ...filtered];
        } catch (e) {
          console.warn(`YouTube Service: Query "${query}" failed:`, e);
        }
      }

      if (allFetchedVideos.length === 0) return [];

      // Attempt Supabase Sync
      try {
        const { error: upsertError } = await supabase
          .from('youtube_credits')
          .upsert(allFetchedVideos, { onConflict: 'video_id' });

        if (upsertError) {
          console.warn('YouTube Service: Supabase sync deferred (using live data):', upsertError.message);
        }
      } catch (dbErr) {
        console.warn('YouTube Service: Database unreachable, continuing with live data.');
      }

      localStorage.setItem('youtube_last_fetch', Date.now().toString());
      return allFetchedVideos;
    } catch (error: any) {
      console.error('YouTube Fetch Failure:', error);
      return null;
    }
  },

  async getCuratedVideos(limit = 10): Promise<YouTubeVideo[]> {
    try {
      // 1. Try to get from Supabase
      const { data, error } = await supabase
        .from('youtube_credits')
        .select('*')
        .order('last_shown_at', { ascending: true, nullsFirst: true })
        .limit(limit);

      if (error || !data || data.length === 0) {
        console.log('YouTube Service: DB empty or unreachable. Fetching live...');
        const live = await this.fetchNewVideos(true);
        if (live && live.length > 0) return live.slice(0, limit);
        return this.getFallbackVideos();
      }

      // 2. Mark as shown
      const videoIds = data.map(v => v.video_id);
      await supabase
        .from('youtube_credits')
        .update({ last_shown_at: new Date().toISOString() } as any)
        .in('video_id', videoIds);

      return data;
    } catch (error) {
      console.error('Curated videos error:', error);
      const live = await this.fetchNewVideos(true);
      if (live && live.length > 0) return live.slice(0, limit);
      return this.getFallbackVideos();
    }
  },

  getFallbackVideos(): YouTubeVideo[] {
    return [
      {
        video_id: '1',
        title: 'Environmental Restoration: A Guide',
        thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80',
        channel: 'NatureFirst',
        published_at: new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        view_count: 0,
        category_tag: 'nature'
      },
      {
        video_id: '2',
        title: 'Circular Economy Explained',
        thumbnail: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80',
        channel: 'Eco Hub',
        published_at: new Date().toISOString(),
        fetched_at: new Date().toISOString(),
        view_count: 0,
        category_tag: 'eco'
      }
    ];
  }
};
