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
} from "@chakra-ui/react";
import { useAuth } from "./auth-provider";
import { Link as ReactLink, Outlet } from "react-router-dom";

const menuItems = [
  {
    title: "Templates",
    to: "/templates",
  },
  {
    title: "Workflows",
    to: "/workflows",
  },
  {
    title: "Executions",
    to: "/executions",
  },
];

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
      <Text>© 2022 Coreus RPA. All rights reserved</Text>
    </Box>
  );
};

export const Header: React.FC = () => {
  const { session, signout } = useAuth();
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
                key={title}
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
                {title}
              </Link>
            ))}
          </HStack>
        </HStack>
        <HStack alignItems="center">
          <Menu>
            <MenuButton>
              <Avatar size="sm" name={session?.user.username} />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => signout()}>Sign out</MenuItem>
            </MenuList>
          </Menu>
          <Text>{session?.user.username}</Text>
        </HStack>
      </Flex>
    </Box>
  );
};

const Layout: React.FC = () => {
  return (
    <Flex direction="column" h="100vh">
      <Header />

      <Box p={4} bg="gray.50" h={"100%"}>
        <Outlet />
      </Box>

      <Footer />
    </Flex>
  );
};

export default Layout;
