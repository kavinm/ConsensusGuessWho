import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userName } = req.body;

  if (!userName) {
    return res.status(400).json({ error: "userName is required" });
  }

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI2);
  await client.connect();
  const db = client.db();

  try {
    // Delete all existing records
    await db.collection("stringsCollection").deleteMany({});

    // Add the new string
    await db.collection("stringsCollection").insertOne({ userName });

    res
      .status(200)
      .json({
        message: "userName successfully added and previous userName deleted",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process request" });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
