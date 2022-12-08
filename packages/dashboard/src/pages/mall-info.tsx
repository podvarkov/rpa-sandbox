import {
  Box,
  Button,
  Center,
  Flex,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import React from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";

export const MallInfo: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Header onOpen={null} />
      <Center flexDirection="column">
        <Box w={20} my={2} borderRadius={5} overflow="hidden">
          <img src="/rakuten_logo.png" />
        </Box>

        <Stack my={5}>
          {/* <Text>R-LoginのIDとパスワードを入力してください。</Text> */}
          <Text>
            <Trans>Please enter your R-Login ID and password.</Trans>
          </Text>

          <Input variant="mypage_input" placeholder={t`ID`} />
          <Input variant="mypage_input" placeholder={t`password`} />
        </Stack>

        <Stack my={5}>
          {/* <Text>楽天会員のIDとパスワードを入力してください</Text> */}
          <Text>
            <Trans>Enter your Rakuten member ID and password.</Trans>
          </Text>

          <Input variant="mypage_input" placeholder={t`ID`} />
          <Input variant="mypage_input" placeholder={t`password`} />
        </Stack>

        <Button>
          <Trans>register</Trans>
        </Button>

        <Flex justifyContent="center" mt={10}>
          <Button
            px={10}
            bg="none"
            type="submit"
            _hover={{
              bg: "none",
            }}
            onClick={() => {
              navigate("/mypage");
            }}
          >
            {/* 登録 */}
            <AiOutlineArrowLeft />
            <Trans> back</Trans>
          </Button>
        </Flex>
      </Center>
    </>
  );
};
