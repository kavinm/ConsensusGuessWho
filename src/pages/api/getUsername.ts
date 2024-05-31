import { MongoClient } from "mongodb";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Connect to MongoDB
  const client = new MongoClient(process.env.MONGODB_URI2!);
  await client.connect();
  const db = client.db();

  try {
    const record = await db
      .collection("stringsCollection")
      .findOne({}, { projection: { userName: 1, _id: 0 } });
    console.log(record);

    if (record && record.userName) {
      res.status(200).json({ userName: record.userName });
    } else {
      res.status(404).json({ error: "UserName not found" });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: "Failed to fetch userName" });
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
