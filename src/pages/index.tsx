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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import Link from "next/link";
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
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    handleFetchTweets()
      .then(() => {
        getStakeBalance().then((balance) => {
          setPotBalance(balance.toString());
        });
      })
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
      onOpen(); // Open the modal
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
      } else {
        alert("You guessed incorrectly!");
      }
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  return (
    <>
      <Box
        p={4}
        minH="100vh"
        backgroundImage="url('/blueBG.png')"
        backgroundSize="cover"
        backgroundPosition="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative">
        <Box position="absolute" top="1rem" right="1rem">
          <ConnectButton />
        </Box>
        <Box position="absolute" bottom="43%" right="70%" cursor="pointer">
          <Link href="/how-to-play" passHref>
            <Box bg="#32a0a8" borderRadius="md">
              <Text fontSize="2xl" color="black">
                How to Play
              </Text>
            </Box>
          </Link>
        </Box>
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
        <Box
          position="absolute"
          right="27%"
          bottom="15%"
          transform="translateX(50%)"
          color="white"
          bg="transparent"
          p={2}
          borderRadius="md"
          fontWeight="bold"
          fontSize="2xl">
          Current Pot: {potBalance} SUI
        </Box>
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
          <VStack spacing={4} w="100%" maxW="md">
            <HStack w="100%" spacing={4}>
              <Input
                placeholder="Ask a question"
                color="black"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                size="lg" // Adjusted size
                p={4} // Added padding
                fontSize="lg" // Increased font size
                width="80%" // Adjusted width
                bg="whiteAlpha.800"
                sx={{ fontFamily: "HelloRoti" }}
              />
              <Button
                onClick={handleAskQuestion}
                colorScheme="teal"
                size="lg"
                fontSize="lg">
                Ask
              </Button>
            </HStack>
            <HStack w="100%" spacing={4}>
              <Input
                placeholder="Submit your guess"
                color="black"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                size="lg" // Adjusted size
                p={4} // Added padding
                fontSize="lg" // Increased font size
                width="80%" // Adjusted width
                bg="whiteAlpha.800"
                sx={{ fontFamily: "HelloRoti" }}
              />
              <Button
                onClick={handleGuess}
                colorScheme="teal"
                size="lg"
                fontSize="lg">
                Guess
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          backgroundImage="url('/blueBG.png')"
          backgroundSize="cover"
          backgroundPosition="center">
          <ModalHeader>Answer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="black" p={2} borderRadius="md" textAlign="center">
              {answer}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
