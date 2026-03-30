import axios from "axios";

export const getSongsFromYouTube = async (artist) => {
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
    }
  );

  return res.data.items.map((item) => ({
    songName: item.snippet.title,
    artist,
    coverImage: item.snippet.thumbnails.high.url,
    previewUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
};