import React from "react";
import {
  Box,
  BoxProps,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  FlexProps,
  Icon,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { IconType } from "react-icons";
import { AiFillHome } from "react-icons/ai";
import {
  FaCloudDownloadAlt,
  FaRegChartBar,
  FaCodeBranch,
  FaCalendarDay,
  FaFileImport,
} from "react-icons/fa";
import { Outlet, NavLink as ReactLink } from "react-router-dom";
import Header from "./header";

interface LinkItemProps {
  name: string;
  icon: IconType;
  to: string;
}
const LinkItems: Array<LinkItemProps> = [
  { name: t`Home`, icon: AiFillHome, to: "/home" },
  { name: t`Reporting`, icon: FaRegChartBar, to: "/beta-rpa" },
  { name: t`Executions`, icon: FaCodeBranch, to: "/executions" },
  { name: t`Schedule`, icon: FaCalendarDay, to: "/schedule" },
  { name: t`Report download`, icon: FaCloudDownloadAlt, to: "/report" },
  { name: t`Templates`, icon: FaFileImport, to: "/templates" },
  { name: t`Workflows`, icon: FaRegChartBar, to: "/workflows" },
];

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: string;
  to: string;
}
const NavItem = ({ icon, to, children, ...rest }: NavItemProps) => {
  return (
    <ReactLink to={to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Flex
          align="center"
          p="4"
          role="group"
          cursor="pointer"
          color="white"
          bg={isActive ? "rgba(255,255,255, 0.3)" : undefined}
          _hover={{
            bg: "rgba(255,255,255, 0.3)",
          }}
          {...rest}
        >
          {icon && (
            <Icon
              mr="4"
              fontSize="24"
              _groupHover={{
                color: "white",
              }}
              as={icon}
            />
          )}
          <Trans>{children}</Trans>
        </Flex>
      )}
    </ReactLink>
  );
};

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("#33B4DE", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" justifyContent="space-between">
        <Box w={40} p={4} alignItems="center">
          <img src="/header_logo.png" width="90%" alt="avatar" />
        </Box>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {LinkItems.map((link) => (
        <NavItem to={link.to} key={link.name} icon={link.icon}>
          {link.name}
        </NavItem>
      ))}
    </Box>
  );
};

export default function SidebarWithHeader() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh">
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      {/* <MobileNav onOpen={onOpen} /> */}
      <Header onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Outlet />
      </Box>
    </Box>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}
