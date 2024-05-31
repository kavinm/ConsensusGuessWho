import React from "react";
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
import { useRouter } from "next/router";

export default function Instructions() {
  const router = useRouter();
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
        src="/robot.png"
        alt="Pot Person"
        boxSize="250px"
        position="absolute"
        right="15%"
        bottom="5%"
        transform="translateX(50%)"
      />
      <VStack spacing={4} p={8} bg="transparent" borderRadius="md">
        <Text fontSize="4xl" color="black" top="0.1%" fontWeight="bold">
          Ask Questions based on the user's tweets for a small fee!
        </Text>
        <Text fontSize="4xl" color="black" top="0.1%" fontWeight="bold">
          Guess the username for a larger fee!
        </Text>
        <Text fontSize="4xl" color="black" top="0.1%" fontWeight="bold">
          The first person to guess the username gets all the money in the pot!
        </Text>
        <Image
          src="/back.png"
          alt="Guess Who"
          mb={4}
          position="absolute"
          top="0.1%"
          left="5%"
          transform="translateX(-50%)"
          width="10%"
          onClick={() => router.push("/")}
        />
      </VStack>
    </Box>
  );
}
