import axios from "axios";

const openAiApiBaseUrl = "https://api.openai.com/v1/chat/completions";

const createPromptWithTweets = (tweets: any) => {
  const tweetsText = tweets.map((tweet: any) => tweet.text).join("\n");
  return `Here are some tweets from the user:\n\n${tweetsText}\n\nBased on these tweets, answer the following question. Only reply with a yes or no and how sure you are it is yes or no based on the tweets`;
};

export default async function handler(req: any, res: any) {
  const { tweets, question } = req.body;
  const prompt = createPromptWithTweets(tweets);

  try {
    const response = await axios.post(
      openAiApiBaseUrl,
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
          { role: "user", content: question },
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY!}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content.trim();
    res.status(200).json({ answer });
  } catch (error: any) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to get answer" });
  }
}
