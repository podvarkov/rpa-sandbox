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
import { Trans } from "@lingui/macro";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export const BetaRpa: React.FC = () => {
  const [isExecuted, setIsExecuted] = useState<Boolean>(false);

  const [startDate, setStartDate] = useState(new Date());

  const navigate = useNavigate();
  return (
    <Center>
      <Box>
        <Center flexDirection="column">
          <Heading size="sm">
            <Text fontSize="lg" pb="5" align="center">
              {/* 月次レポート作成 */}
              <Trans>Monthly report creation</Trans>
            </Text>
          </Heading>
          <Text fontSize="xs">
            {/* 実行したいロボットを選択してください。 */}
            <Trans>Select the robot you want to run.</Trans>
          </Text>
          <Text fontSize="xs">
            {/* *β版では楽天のみ対応となります */}
            <Trans>*Beta version only supports Rakuten</Trans>
          </Text>
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
            <Text fontSize="lg">
              {/* 楽天月次レポート作成 */}
              <Trans>Rakuten monthly report creation</Trans>
            </Text>
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
            <Text fontSize="lg">
              {/* Yahoo!月次レポート作成 */}
              <Trans>Yahoo! monthly report creation</Trans>
            </Text>
          </Flex>
        </HStack>

        <Stack spacing="30px" maxWidth={400} mx="auto" mt={6}>
          <Heading size="md" textAlign="center">
            <Text>
              {/* 楽天 - 月次レポート作成 */}
              Rakuten - Monthly Report Creation
            </Text>
          </Heading>
          <FormControl as="fieldset">
            <FormLabel as="legend">
              {/* レポートデータ開始日 */}
              <Trans> Report data start date</Trans>
            </FormLabel>
            <Input type="date" />
          </FormControl>

          <FormControl as="fieldset">
            <FormLabel as="legend">
              {/* レポートデータ終了日 */}
              <Trans>Report data end date</Trans>
            </FormLabel>
            {/* <Input type="date" /> */}
            <DatePicker
              selected={startDate}
              onChange={(date: Date) => setStartDate(date)}
            />
          </FormControl>

          <FormControl as="fieldset">
            <FormLabel as="legend">
              {/* ロボット送付希望日 */}
              <Trans>Desired delivery date of the robot</Trans>
            </FormLabel>
            <Input type="date" />
          </FormControl>

          {isExecuted && (
            <Text textAlign="center">
              <Trans>
                Information is collected from various management screens such as
                malls and access analysis. If it is not reflected, the
                reflection on various management screens may be delayed. Please
                try again later.
              </Trans>
            </Text>
          )}

          <Flex justifyContent="center" mt={10}>
            <Button
              variant="submitBtn"
              px={10}
              type="submit"
              onClick={() => {
                setIsExecuted(true);
              }}
            >
              {/* 登録 */}
              <Trans>execution</Trans>
            </Button>
          </Flex>

          <Flex justifyContent="center" mt={10}>
            <Button
              px={10}
              bg="none"
              type="submit"
              _hover={{
                bg: "none",
              }}
            >
              {/* 登録 */}
              <AiOutlineArrowLeft />
              <Trans> back</Trans>
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Center>
  );
};
