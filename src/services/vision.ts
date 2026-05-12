import { CONFIG } from '../config';

export interface VisionLabel {
  description: string;
  score: number;
}

export interface VisionAnalysis {
  labels: VisionLabel[];
  text?: string;
  isSafe: boolean;
}

export const visionService = {
  async analyzeImage(imageUri: string): Promise<VisionAnalysis | null> {
    if (!CONFIG.API_KEYS.GOOGLE) return null;

    try {
      // Extract base64 if it's a data URL
      const base64Image = imageUri.split(',')[1] || imageUri;

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${CONFIG.API_KEYS.GOOGLE}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Image },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 10 },
                  { type: 'TEXT_DETECTION' },
                  { type: 'SAFE_SEARCH_DETECTION' }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) throw new Error('Vision API failed');

      const data = await response.json();
      const result = data.responses[0];

      if (!result) return null;

      const safeSearch = result.safeSearchAnnotation;
      const isSafe = safeSearch ? 
        (safeSearch.adult === 'VERY_UNLIKELY' && safeSearch.violence === 'VERY_UNLIKELY') : true;

      return {
        labels: (result.labelAnnotations || []).map((l: any) => ({
          description: l.description,
          score: l.score
        })),
        text: result.fullTextAnnotation?.text,
        isSafe
      };
    } catch (error) {
      console.error('Vision Service Error:', error);
      return null;
    }
  }
};
