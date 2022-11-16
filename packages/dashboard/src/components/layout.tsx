import React from "react";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  Text,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Progress,
  Select,
} from "@chakra-ui/react";
import { useAuth } from "./auth-provider";
import { Link as ReactLink, Outlet } from "react-router-dom";
import { useProgress } from "./progress-provider";
import { defineMessage, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { locales } from "../i18n";

/* eslint-disable string-to-lingui/missing-lingui-transformation */
const menuItems = [
  {
    title: defineMessage({ message: "Templates" }),
    to: "/templates",
  },
  {
    title: defineMessage({ message: "Workflows" }),
    to: "/workflows",
  },
  {
    title: defineMessage({ message: "Executions" }),
    to: "/executions",
  },
];
/* eslint-enable string-to-lingui/missing-lingui-transformation */

export const Footer: React.FC = () => {
  return (
    <Box
      bg="white"
      color="gray.700"
      maxW={"6xl"}
      p={4}
      mt={"2px"}
      boxShadow={"sm"}
    >
      <Text>
        <Trans>© 2022 Coreus RPA. All rights reserved</Trans>
      </Text>
    </Box>
  );
};

export const Header: React.FC = () => {
  const { session, signout } = useAuth();
  const { i18n } = useLingui();

  return (
    <Box bg={"white"} px={4} boxShadow="sm" mb="2px">
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <HStack spacing={8} alignItems={"center"}>
          <Box w={32}>
            <img alt="logo" src="/logo.png" />
          </Box>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            {menuItems.map(({ title, to }) => (
              <Link
                key={to}
                px={2}
                py={1}
                rounded={"md"}
                _hover={{
                  textDecoration: "none",
                  bg: "gray.200",
                }}
                as={ReactLink}
                to={to}
              >
                {i18n._(title)}
              </Link>
            ))}
          </HStack>
        </HStack>
        <HStack alignItems="center" px={4}>
          <Menu>
            <MenuButton>
              <Avatar size="sm" name={session?.user.username} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => signout()}>
                <Trans>Sign out</Trans>
              </MenuItem>
            </MenuList>
          </Menu>
          <Text>{session?.user.username}</Text>

          <Select
            style={{ marginLeft: "1rem" }}
            variant="flushed"
            value={i18n.locale}
            onChange={(e) => {
              localStorage.setItem("locale", e.target.value);
              i18n.activate(e.target.value);
            }}
          >
            {Object.entries(locales).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </Select>
        </HStack>
      </Flex>
    </Box>
  );
};

const Layout: React.FC = () => {
  const { visible } = useProgress();
  return (
    <>
      <Flex direction="column" h="100vh">
        <Header />
        {visible ? <Progress size="xs" isIndeterminate /> : null}

        <Box p={4} bg="gray.50" h={"100%"} overflowY="scroll">
          <Outlet />
        </Box>

        <Footer />
      </Flex>
    </>
  );
};

export default Layout;
