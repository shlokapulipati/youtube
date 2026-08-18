import axios from 'axios';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

export const fetchTrendingVideos = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: 'US',
        maxResults: 50,
        key: API_KEY,
      },
    });
    return data.items;
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return [];
  }
};

export const searchVideos = async (query: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        maxResults: 50,
        type: 'video',
        key: API_KEY,
      },
    });
    return data.items;
  } catch (error) {
    console.error('Error searching videos:', error);
    return [];
  }
};

export const getVideoDetails = async (id: string) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: id,
        key: API_KEY,
      },
    });
    return data.items[0];
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
};
