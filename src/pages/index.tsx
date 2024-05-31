import { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useCurrentWallet,
  useSuiClient,
  useSignTransaction,
} from "@mysten/dapp-kit";
import { askQuestion, guessAnswer, newRound } from "@/contract/calls";

export default function Home() {
  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tweets, setTweets] = useState([]);
  const [guess, setGuess] = useState("");
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signTransaction } = useSignTransaction();

  const handleFetchTweets = async () => {
    try {
      const txb = await newRound(username);
      const { bytes, signature } = await signTransaction({
        transaction: txb,
        chain: "sui:testnet",
      });
      const executeResult = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
      });

      console.log(executeResult);
      const response = await fetch(`/api/tweets?username=${username}`);
      const data = await response.json();
      setTweets(data);
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  const handleAskQuestion = async () => {
    try {
      const txb = await askQuestion();
      const { bytes, signature } = await signTransaction({
        transaction: txb,
        chain: "sui:testnet",
      });
      const executeResult = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
      });

      console.log(executeResult);
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

  const handleGuess = async () => {
    try {
      const txb = await guessAnswer(guess);
      const { bytes, signature } = await signTransaction({
        transaction: txb,
        chain: "sui:testnet",
      });
      const executeResult = await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEvents: true,
        },
      });

      console.log(executeResult);
      if (executeResult.events) {
        const winner = (executeResult as any).events[0].parsedJson.winner;
        if (winner === account?.address) {
          // TODO:
          alert("You won!");
        }
      }
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  return (
    <div>
      <ConnectButton />
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
          <form onSubmit={handleGuess}>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Enter your guess"
            />
            <button type="submit">Guess</button>
          </form>
        </div>
      )}
      {answer && <p>Answer: {answer}</p>}
    </div>
  );
}
