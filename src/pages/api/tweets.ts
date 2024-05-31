import axios from "axios";
import { MongoClient } from "mongodb";

/*
 * Twitter Operations
 */

const twitterApiBaseUrl = "https://api.twitter.com/2";
const headers = {
  Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
};

const fetchTweetsFromTwitter = async (
  authorId: string,
  nextToken: string | null = null
) => {
  const url = `${twitterApiBaseUrl}/users/${authorId}/tweets`;
  const params = {
    max_results: 100,
    "tweet.fields": "created_at,author_id",
    exclude: "retweets,replies",
    ...(nextToken && { pagination_token: nextToken }),
  };

  try {
    const response = await axios.get(url, { headers, params });
    return response.data;
  } catch (e: any) {
    console.log(`Error encountered when fetching tweets from X: ${e.message}`);
    return {};
  }
};

/*
 * MongoDB Operations
 */

const fetchTweetsFromMongoDB = async (authorId: string, db: any) => {
  console.log(`Retrieving tweets from mongodb for userId ${authorId}...`);
  try {
    return db.collection("tweets").findOne({ authorId });
  } catch (e: any) {
    console.log(`Error encountered on tweets fetch from mongodb: ${e.message}`);
    return {};
  }
};

const saveTweetsToMongoDB = async (
  userName: string,
  authorId: string,
  tweets: any[],
  db: any
) => {
  try {
    console.log(`Saving tweets from ${authorId} in mongodb.`);
    return db
      .collection("tweets")
      .updateOne(
        { authorId },
        { $set: { authorId, userName, tweets, lastUpdated: new Date() } },
        { upsert: true }
      );
  } catch (e: any) {
    console.log(`Error encountered on tweets save to mongodb: ${e.message}`);
    return {};
  }
};

const transformTweets = (tweets: any) => {
  return tweets.map((tweet: any) => ({
    text: tweet.text,
    created_at: tweet.created_at,
  }));
};

export default async function handler(req: any, res: any) {
  const { username } = req.query;

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI!);
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
      console.log(`Found cached tweets for userId ${authorId}.`);
      // Return cached tweets if they exist
      res.status(200).json({
        author_id: cachedTweets.authorId,
        author_name: cachedTweets.userName,
        tweets: cachedTweets.tweets,
      });
    } else {
      console.log(`Unable to find cached tweets for userId ${authorId}.`);
      // Fetch tweets from Twitter API
      let allTweets: any[] = [];
      let nextToken = null;
      let count = 0;

      do {
        const response = await fetchTweetsFromTwitter(authorId, nextToken);
        if (response.data) {
          const filteredTweets = transformTweets(response.data);
          allTweets = allTweets.concat(filteredTweets);
          nextToken = response.meta.next_token;
          count += response.data.length;
        }
      } while (nextToken && count < 1000); // Fetch up to 1000 tweets

      if (allTweets.length > 0) {
        // Save the new tweets to MongoDB
        await saveTweetsToMongoDB(username, authorId, allTweets, db);
      }

      // Return the fetched tweets
      res.status(200).json({
        author_id: authorId,
        author_name: username,
        tweets: allTweets,
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
