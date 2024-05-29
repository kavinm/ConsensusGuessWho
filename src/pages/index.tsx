import { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tweets, setTweets] = useState([]);

  const handleFetchTweets = async () => {
    try {
      const response = await fetch(`/api/tweets?username=${username}`);
      const data = await response.json();
      setTweets(data);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  const handleAskQuestion = async () => {
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweets, question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  return (
    <div>
      <h1>Twitter Guess Who</h1>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter Twitter username"
      />
      <button onClick={handleFetchTweets}>Fetch Tweets</button>
      {tweets.length > 0 && (
        <div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the tweets"
          />
          <button onClick={handleAskQuestion}>Ask Question</button>
        </div>
      )}
      {answer && <p>Answer: {answer}</p>}
    </div>
  );
}
