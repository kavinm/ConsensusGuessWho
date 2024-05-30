import { useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import ADDRESSES from "../deployed_addresses.json";
import { sha256 } from "js-sha256";
import { Transaction } from "@mysten/sui/transactions";

export default function Home() {
  const STAKE = 10;
  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tweets, setTweets] = useState([]);
  const [game, setGame] = useState("");
  const [guess, setGuess] = useState("");
  const { PACKAGE_ID } = ADDRESSES;

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const handleFetchTweets = async () => {
    try {
      const txb = new Transaction();
      const influencer = sha256(username);
      txb.moveCall({
        target: `${PACKAGE_ID}::game::new`,
        arguments: [txb.pure.string(influencer)],
      });
      signAndExecuteTransaction(
        {
          transaction: txb,
          chain: "sui:testnet",
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result);
            const response = await fetch(`/api/tweets?username=${username}`);
            const data = await response.json();
            setTweets(data);
          },
          onError: (error) => {
            console.error("Error asking question:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error fetching tweets:", error);
    }
  };

  const handleAskQuestion = async () => {
    try {
      const txb = new Transaction();
      const [coin] = txb.splitCoins(txb.gas, [STAKE]);
      txb.moveCall({
        target: `${PACKAGE_ID}::game::ask`,
        arguments: [txb.object(game), txb.object(coin)],
      });
      signAndExecuteTransaction(
        {
          transaction: txb,
          chain: "sui:testnet",
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result);
            const response = await fetch("/api/ask", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ tweets, question }),
            });
            const data = await response.json();
            setAnswer(data.answer);
          },
          onError: (error) => {
            console.error("Error asking question:", error);
          },
        }
      );
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  const handleGuess = async () => {
    try {
      const txb = new Transaction();
      const [coin] = txb.splitCoins(txb.gas, [STAKE]);
      txb.moveCall({
        target: `${PACKAGE_ID}::game::guess`,
        arguments: [txb.object(game), txb.object(coin), txb.pure.string(guess)],
      });
      signAndExecuteTransaction(
        {
          transaction: txb,
          chain: "sui:testnet",
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result);
            // TODO:
          },
          onError: (error) => {
            console.error("Error asking question:", error);
          },
        }
      );
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
