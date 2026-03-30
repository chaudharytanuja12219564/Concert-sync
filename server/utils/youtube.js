import axios from "axios";

export const getSongsFromYouTube = async (artist) => {
  try {
    const res = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          q: `${artist} official song`,
          type: "video",
          maxResults: 5,
          key: process.env.YOUTUBE_API_KEY,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!res.data.items || res.data.items.length === 0) {
      return [];
    }

    return res.data.items.map((item) => ({
      songName: item.snippet.title,
      artist,
      coverImage: item.snippet.thumbnails.high.url,
      previewUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));
  } catch (error) {
    console.error(`YouTube API error for "${artist}":`, error.message);
    return [];
  }
};