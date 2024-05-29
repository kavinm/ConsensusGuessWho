import axios from "axios";
import { MongoClient } from "mongodb";

/*
* Twitter Operations
*/

const twitterApiBaseUrl = "https://api.twitter.com/2";
const headers = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
};

const fetchTweetsFromTwitter = async (authorId: string, nextToken: string | null = null) => {
  const url = `${twitterApiBaseUrl}/users/${authorId}/tweets`;
  const params = {
    max_results: 100,
    "tweet.fields": "created_at,author_id",
    exclude: "retweets,replies",
    ...(nextToken && { pagination_token: nextToken }),
  };

  const response = await axios.get(url, { headers, params });
  return response.data;
};

/*
* MongoDB Operations
*/

const fetchTweetsFromMongoDB = async (authorId: string, db) => {
  return db.collection('tweets').findOne({ authorId });
};

const saveTweetsToMongoDB = async (authorId: string, tweets, db) => {
  return db.collection('tweets').updateOne(
    { authorId },
    { $set: { authorId, tweets, lastUpdated: new Date() } },
    { upsert: true }
  );
};

const transformTweets = (tweets) => {
  return tweets.map(tweet => ({
    text: tweet.text,
    created_at: tweet.created_at
  }));
};

export default async function handler(req, res) {
  const { username } = req.query;

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();

  try {
    // Get the user ID from Twitter API
    const userResponse = await axios.get(
      `${twitterApiBaseUrl}/users/by/username/${username}`,
      { headers }
    );
    const authorId = userResponse.data.data.id;

    // Check MongoDB for existing tweets
    const cachedTweets = await fetchTweetsFromMongoDB(authorId, db);

    if (cachedTweets) {
      // Return cached tweets if they exist
      res.status(200).json({
        author_id: cachedTweets.authorId,
        tweets: cachedTweets.tweets
      });
    } else {
      // Fetch tweets from Twitter API
      let allTweets = [];
      let nextToken = null;
      let count = 0;

      do {
        const response = await fetchTweetsFromTwitter(authorId, nextToken);
        const filteredTweets = transformTweets(response.data);
        allTweets = allTweets.concat(filteredTweets);
        nextToken = response.meta.next_token;
        count += response.data.length;
      } while (nextToken && count < 1000); // Fetch up to 1000 tweets

      // Save the new tweets to MongoDB
      await saveTweetsToMongoDB(authorId, allTweets, db);

      // Return the fetched tweets
      res.status(200).json({
        author_id: authorId,
        tweets: allTweets
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tweets" });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
