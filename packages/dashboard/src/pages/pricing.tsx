import {
  Box,
  Button,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useQuery } from "react-query";
import { api } from "../api";
import { useAuth } from "../components/auth-provider";

const PriceWrapper: React.FC<{
  price: number;
  priceId: string;
  currency: string;
  title: string;
  descriptions: string[];
}> = ({ price, priceId, currency, title, descriptions }) => {
  const { session } = useAuth();
  return (
    <Box
      mb={4}
      shadow="base"
      borderWidth="1px"
      alignSelf={{ base: "center" }}
      borderColor={useColorModeValue("gray.200", "gray.500")}
      borderRadius={"xl"}
    >
      <Box py={4} px={12}>
        <Text fontWeight="500" fontSize="2xl">
          {title}
        </Text>
        <HStack justifyContent="center">
          <Text fontSize="3xl" fontWeight="600">
            {currency}
          </Text>
          <Text fontSize="5xl" fontWeight="900">
            {price}
          </Text>
          <Text fontSize="3xl" color="gray.500">
            /<Trans>mo</Trans>
          </Text>
        </HStack>
      </Box>
      <VStack
        bg={useColorModeValue("gray.50", "gray.700")}
        py={4}
        h="50%"
        borderBottomRadius={"xl"}
      >
        <List spacing={3} textAlign="start" px={12}>
          {descriptions.map((item, idx) => (
            <ListItem key={idx}>
              <ListIcon as={FaCheckCircle} color="green.500" />
              {item}
            </ListItem>
          ))}
        </List>
        <Box w="80%" pt={7}>
          <a href={`/payments/checkout/${priceId}?token=${session?.jwt}`}>
            <Button w="full" colorScheme="blue">
              <Trans>Subscribe</Trans>
            </Button>
          </a>
        </Box>
      </VStack>
    </Box>
  );
};

export const PricingPage: React.FC = () => {
  const { data: subscription, isFetching } = useQuery("subscription", () =>
    api.getSubscriptionInfo()
  );

  return !isFetching ? (
    <Box py={12}>
      {subscription && subscription.status === "active" ? (
        <Trans>You already on a paid plan</Trans>
      ) : (
        <>
          <VStack spacing={2} textAlign="center">
            <Heading as="h1" fontSize="4xl">
              <Trans>Plans that fit your need</Trans>
            </Heading>
          </VStack>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 2, xl: 4 }}
            gap="2"
            py={10}
          >
            <PriceWrapper
              price={30000}
              currency="¥"
              title={t`Robotic A`}
              descriptions={[
                t`unlimited executions minutes`,
                t`20 robots available`,
                t`up to 3 simultaneously executions`,
              ]}
              priceId="price_1MIADXJnl8Mom13wfuenEQM2"
            />{" "}
            <PriceWrapper
              price={50000}
              currency="¥"
              title={t`Robotic B`}
              descriptions={[
                t`unlimited executions minutes`,
                t`30 robots available`,
                t`up to 3 simultaneously executions`,
              ]}
              priceId="price_1MIACtJnl8Mom13wvqxfDuQM"
            />
            <PriceWrapper
              price={70000}
              currency="¥"
              title={t`Robotic C`}
              descriptions={[
                t`unlimited executions minutes`,
                t`all robots available`,
                t`up to 3 simultaneously executions`,
              ]}
              priceId="price_1MIABrJnl8Mom13wnrqbFViW"
            />
            <PriceWrapper
              price={200000}
              currency="¥"
              title={t`Premium`}
              descriptions={[
                t`same as Robotic C`,
                t`full robots customization`,
                t`dedicated support`,
              ]}
              priceId="price_1MIABFJnl8Mom13wFWEeFLxx"
            />
          </SimpleGrid>
        </>
      )}
    </Box>
  ) : null;
};
