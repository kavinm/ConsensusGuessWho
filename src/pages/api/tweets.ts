import axios from "axios";

const twitterApiBaseUrl = "https://api.twitter.com/2";
const headers = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
};

const fetchTweets = async (userId, nextToken = null) => {
  const url = `${twitterApiBaseUrl}/users/${userId}/tweets`;
  const params = {
    max_results: 100,
    "tweet.fields": "created_at,author_id",
    exclude: "retweets,replies",
    ...(nextToken && { pagination_token: nextToken }),
  };

  const response = await axios.get(url, { headers, params });
  return response.data;
};

export default async function handler(req, res) {
  const { username } = req.query;
  try {
    const userResponse = await axios.get(
      `${twitterApiBaseUrl}/users/by/username/${username}`,
      { headers }
    );
    const userId = userResponse.data.data.id;

    let allTweets = [];
    let nextToken = null;
    let count = 0;

    do {
      const response = await fetchTweets(userId, nextToken);
      allTweets = allTweets.concat(response.data);
      nextToken = response.meta.next_token;
      count += response.data.length;
    } while (nextToken && count < 1000); // Fetch up to 1000 tweets

    res.status(200).json(allTweets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
}
