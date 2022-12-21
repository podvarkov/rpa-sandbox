import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { AiOutlineArrowLeft } from "react-icons/ai";
import "../components/datepicker.css";

export const BetaRpa: React.FC = () => {
  const [isExecuted, setIsExecuted] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date("2022/02/08")
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());

  return (
    <Center>
      <Box>
        <Center flexDirection="column">
          <Heading size="sm">
            <Text fontSize="lg" pb="5" align="center">
              <Trans>Monthly report creation</Trans>
            </Text>
          </Heading>
          <Text fontSize="xs">
            <Trans>Select the robot you want to run.</Trans>
          </Text>
          <Text fontSize="xs">
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
            _hover={{ boxShadow: "1px 2px 3px 1px #00B7EE" }}
          >
            <Box w={20}>
              <img width="100%" src="/rakuten_logo.png" />
            </Box>
            <Text fontSize="lg">
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
              <Trans>Yahoo! monthly report creation</Trans>
            </Text>
          </Flex>
        </HStack>

        <Stack spacing="30px" maxWidth={400} mx="auto" mt={6}>
          <Heading size="md" textAlign="center">
            <Text>Rakuten - Monthly Report Creation</Text>
          </Heading>
          <FormControl as="fieldset">
            <FormLabel as="legend">
              <Trans> Report data start date</Trans>
            </FormLabel>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
            />
          </FormControl>

          <FormControl as="fieldset">
            <FormLabel as="legend">
              <Trans>Report data end date</Trans>
            </FormLabel>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="MM/yyyy"
              showMonthYearPicker
            />
          </FormControl>

          <FormControl as="fieldset">
            <FormLabel as="legend">
              <Trans>Desired delivery date of the robot</Trans>
            </FormLabel>
            <DatePicker
              selected={startDate}
              onChange={(date) => date}
              dateFormat="MM/yyyy"
              showMonthYearPicker
              wrapperClassName="react-datep-picker-wrapper"
            />
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
              <AiOutlineArrowLeft />
              <Trans> back</Trans>
            </Button>
          </Flex>
        </Stack>
      </Box>
    </Center>
  );
};
