import { useState } from "react";
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

export default function Home() {
  const [question, setQuestion] = useState("");
  const [guess, setGuess] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAskQuestion = async () => {
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error("Error asking question:", error);
    }
  };

  const handleSubmitGuess = () => {
    // Logic for handling guess submission can be added here
    console.log("Guess submitted:", guess);
  };

  return (
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
            <Button onClick={handleSubmitGuess} colorScheme="teal" size="sm">
              Guess
            </Button>
          </HStack>
        </VStack>
        {answer && (
          <Text
            mt={4}
            bg="whiteAlpha.800"
            p={2}
            borderRadius="md"
            textAlign="center">
            Answer: {answer}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
