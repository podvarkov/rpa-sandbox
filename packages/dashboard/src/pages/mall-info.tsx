import { Box, Button, Center, Input, Stack, Text } from "@chakra-ui/react";
import React from "react";

export const MallInfo: React.FC = () => {
  return (
    <Center flexDirection="column">
      <Box w={20} my={2} borderRadius={5} overflow="hidden">
        <img src="/rakuten_logo.png" />
      </Box>

      <Stack>
        <Text>R-LoginのIDとパスワードを入力してください。</Text>

        <Input variant="mypage_input" placeholder="ID" />
        <Input variant="mypage_input" placeholder="パスワード" />
      </Stack>

      <Stack my={5}>
        <Text>楽天会員のIDとパスワードを入力してください</Text>

        <Input variant="mypage_input" placeholder="ID" />
        <Input variant="mypage_input" placeholder="パスワード" />
      </Stack>

      <Button>登録</Button>
    </Center>
  );
};
