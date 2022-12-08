import { Box, Center, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { AiFillInfoCircle } from "react-icons/ai";
import { BsFillPinAngleFill } from "react-icons/bs";

interface NewsItem {
  date: Date;
  content: string;
  category: string;
  id: string;
}

const news: Array<NewsItem> = [
  {
    date: new Date(),
    content: "先行ロボットをリリースしました",
    category: "お知らせ",
    id: "identifier",
  },
];

export const Home: React.FC = () => {
  return (
    <Box p={2}>
      {news.map((item) => (
        <Flex key={item.id} borderBottom="1px" borderColor="borderColors.main">
          <Box width="10%">
            <Center flexDirection="column" justifyContent="space-between">
              <AiFillInfoCircle size={32} color="#C2C2C2" />
              <Text>{item.category}</Text>
            </Center>
          </Box>
          <Box justifyContent="space-between" flex={1}>
            <Text>There should be date </Text>
            {/* <Input placeholder="Select Date and Time" size="md" type="date" /> */}
            <Text mt={2}>{item.content}</Text>
          </Box>
          <Box>
            <BsFillPinAngleFill size={24} color="#C2C2C2" />
          </Box>
        </Flex>
      ))}
    </Box>
  );
};
