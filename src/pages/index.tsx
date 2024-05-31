import { useEffect, useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useCurrentWallet,
  useSuiClient,
  useSignTransaction,
} from "@mysten/dapp-kit";
import { askQuestion, guessAnswer } from "@/contract/calls";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Image,
  HStack,
  Flex,
  Heading,
} from "@chakra-ui/react";
import { getStakeBalance } from "@/contract/indexer";

export default function Home() {
  const [potBalance, setPotBalance] = useState("0");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tweets, setTweets] = useState([]);
  const [guess, setGuess] = useState("");
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signTransaction } = useSignTransaction();

  useEffect(() => {
    handleFetchTweets()
      .then(() => {})
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const fetchPotBalance = async () => {
    try {
      const balance = await getStakeBalance();
      setPotBalance(balance.toString());
    } catch (error) {
      console.error("Error fetching pot balance:", error);
    }
  };

  const handleFetchTweets = async () => {
    try {
      const getUsernameResponse = await fetch("/api/getUsername");
      const getUsernameData = await getUsernameResponse.json();
      const storedUsername = getUsernameData.userName;
      console.log(storedUsername);

      // Call fetchTweets API with the retrieved username
      const fetchTweetsResponse = await fetch(
        `/api/tweets?username=${storedUsername}`
      );
      const fetchTweetsData = await fetchTweetsResponse.json();
      console.log(fetchTweetsData.tweets);

      setTweets(fetchTweetsData.tweets);
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
      await fetchPotBalance();
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, tweets }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  const handleGuess = async () => {
    try {
      console.log("Guessing answer:", guess);
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
      await fetchPotBalance();
      console.log(executeResult);
      if (executeResult.events && executeResult.events?.length > 0) {
        const winner = (executeResult as any).events[0].parsedJson.winner;
        console.log("Winner: ", winner);
        if (winner === account?.address) {
          // TODO:
          alert("You won!");
          const response = await fetch("/api/round");
          if (response.ok) {
            alert("New round started!");
          } else {
            console.log(response);
            alert("Error starting new round");
          }
          await handleFetchTweets();
        }
      }
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  return (
    <>
      <ConnectButton />
      <div>{potBalance} SUI</div>
      <Box
        p={4}
        minH="100vh"
        backgroundImage="url('/blueBG.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Image
          src="/guessPerson.png"
          alt="Guess Person"
          boxSize="250px"
          position="absolute"
          left="20%"
          bottom="10%"
          transform="translateX(-50%)"
        />
        <Image
          src="/potPerson.png"
          alt="Pot Person"
          boxSize="350px"
          position="absolute"
          right="25%"
          bottom="5%"
          transform="translateX(50%)"
        />
        <VStack spacing={4} p={8} bg="transparent" borderRadius="md">
          <Image
            src="/guessWho.png"
            alt="Guess Who"
            boxSize="450px" // Increased size
            mb={4}
            position="absolute"
            top="0.1%"
            left="50%"
            transform="translateX(-50%)"
            width="90%"
          />
          <VStack spacing={4} w="100%" maxW="md" mt="100%">
            {" "}
            // Adjusted margin-top
            <HStack w="100%">
              <Input
                placeholder="Ask a question"
                color="black"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                size="sm"
                bg="whiteAlpha.800"
                sx={{ fontFamily: "HelloRoti" }}
              />
              <Button onClick={handleAskQuestion} colorScheme="teal" size="sm">
                Ask
              </Button>
            </HStack>
            <HStack w="100%">
              <Input
                placeholder="Submit your guess"
                color="black"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                size="sm"
                bg="whiteAlpha.800"
                sx={{ fontFamily: "HelloRoti" }}
              />
              <Button onClick={handleGuess} colorScheme="teal" size="sm">
                Guess
              </Button>
            </HStack>
          </VStack>
          {answer && (
            <Text
              mt={4}
              bg="whiteAlpha.800"
              p={2}
              color="black"
              borderRadius="md"
              textAlign="center"
            >
              Answer: {answer}
            </Text>
          )}
        </VStack>
      </Box>
    </>
  );
}
