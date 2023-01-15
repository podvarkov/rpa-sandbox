import {
  Avatar,
  Box,
  Flex,
  FlexProps,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { setDefaultOptions } from "date-fns";
import React from "react";
import { setDefaultLocale } from "react-datepicker";
import { FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { datefnsLocales, locales } from "../i18n";
import { useAuth } from "./auth-provider";

interface MobileProps extends FlexProps {
  onOpen?: () => void;
}

export const Header: React.FC<MobileProps> = ({ onOpen }: MobileProps) => {
  const { signout, session } = useAuth();
  const navigate = useNavigate();
  const { i18n } = useLingui();

  return (
    <Flex
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between" }}
    >
      {onOpen && (
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          variant="outline"
          aria-label="open menu"
          icon={<FiMenu />}
        />
      )}
      <Box w={40} p={4} alignItems="center">
        <img alt="profile" src="/header-logo-with-bg.png" width="90%" />
      </Box>

      <HStack spacing={{ base: "0", md: "6" }}>
        <Select
          style={{ marginLeft: "1rem" }}
          variant="flushed"
          value={i18n.locale}
          onChange={(e) => {
            localStorage.setItem("locale", e.target.value);
            i18n.activate(e.target.value);
            setDefaultLocale(e.target.value);
            setDefaultOptions({ locale: datefnsLocales[e.target.value] });
          }}
        >
          {Object.entries(locales).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </Select>
        <Flex alignItems={"center"}>
          <Menu>
            <MenuButton
              py={2}
              transition="all 0.3s"
              _focus={{ boxShadow: "none" }}
            >
              <HStack>
                <Avatar size={"sm"} name={session?.user.username} />
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem onClick={() => navigate("/profile")}>
                <Trans>Profile</Trans>
              </MenuItem>
              <MenuItem onClick={() => signout()}>
                <Trans>Sign out</Trans>
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
