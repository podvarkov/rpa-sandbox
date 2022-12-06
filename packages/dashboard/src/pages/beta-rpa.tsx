import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";

export const BetaRpa: React.FC = () => {
  return (
    <Center>
      <Box>
        <Center flexDirection="column">
          <Heading size="sm">
            <Text fontSize="lg" pb="5" align="center">
              月次レポート作成
            </Text>
          </Heading>
          <Text fontSize="xs">実行したいロボットを選択してください。</Text>
          <Text fontSize="xs">*β版では楽天のみ対応となります</Text>
        </Center>
        <HStack spacing={25} mt={3}>
          <Flex
            border="1px"
            borderColor="borderColors.main"
            borderRadius={10}
            alignItems="center"
            p={2}
          >
            <Box w={20}>
              <img width="100%" src="/rakuten_logo.png" />
            </Box>
            <Text fontSize="lg">楽天月次レポート作成 </Text>
          </Flex>
          <Flex
            border="1px"
            borderColor="borderColors.main"
            borderRadius={10}
            bg="bgColors.secondary"
            alignItems="center"
            p={2}
          >
            <Box w={20} borderRadius={5} overflow="hidden">
              <img width="100%" src="/yahoo_logo.png" />
            </Box>
            <Text fontSize="lg">Yahoo!月次レポート作成</Text>
          </Flex>
        </HStack>

        <Stack spacing="30px" maxWidth={400} mx="auto" mt={6}>
          <Heading size="md" textAlign="center">
            <Text>楽天 - 月次レポート作成</Text>
          </Heading>
          <FormControl as="fieldset">
            <FormLabel as="legend">レポートデータ開始日</FormLabel>
            <Input type="date" />
          </FormControl>

          <FormControl as="fieldset">
            <FormLabel as="legend">レポートデータ終了日</FormLabel>
            <Input type="date" />
          </FormControl>

          <FormControl as="fieldset">
            <FormLabel as="legend">ロボット送付希望日</FormLabel>
            <Input type="date" />
          </FormControl>

          <Flex justifyContent="center" mt={10}>
            <Button variant="submitBtn" px={10} type="submit">
              登録
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Center>
  );
};
