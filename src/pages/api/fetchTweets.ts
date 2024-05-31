import axios from "axios";
import { MongoClient } from "mongodb";

const fetchAllTweetsFromMongoDB = async (db) => {
  console.log(`Retrieving all tweets from MongoDB...`);
  try {
    return db.collection("tweets").find({}).toArray();
  } catch (e: any) {
    console.log(`Error encountered on tweets fetch from MongoDB: ${e.message}`);
    return [];
  }
};

const fetchTweetsFromMongoDB = async (userName: string, db) => {
  console.log(`Retrieving tweets from mongodb for userName ${userName}...`);
  try {
    return db.collection("tweets").findOne({ userName });
  } catch (e: any) {
    console.log(`Error encountered on tweets fetch from mongodb: ${e.message}`);
    return {};
  }
};

export default async function handler(req, res) {
  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  const { username } = req.query;

  try {
    const cachedTweets = await fetchTweetsFromMongoDB(username, db);
    res.status(200).json(cachedTweets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch tweets" });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
