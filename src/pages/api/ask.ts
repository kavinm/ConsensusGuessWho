import axios from "axios";

const openAiApiBaseUrl = "https://api.openai.com/v1/chat/completions";

const createPromptWithTweets = (tweets) => {
  const tweetsText = tweets.map((tweet) => tweet.text).join("\n");
  return `Here are some tweets from the user:\n\n${tweetsText}\n\nBased on these tweets, answer the following question:`;
};

export default async function handler(req, res) {
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
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = response.data.choices[0].message.content.trim();
    res.status(200).json({ answer });
  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to get answer" });
  }
}
