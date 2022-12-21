import React, { PropsWithChildren } from "react";
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
import { defineMessage } from "@lingui/macro";
import { useLingui } from "@lingui/react";
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
import { MessageDescriptor } from "@lingui/core";

interface LinkItemProps {
  id: string;
  name: MessageDescriptor;
  icon: IconType;
  to: string;
}
/* eslint-disable string-to-lingui/missing-lingui-transformation */
const LinkItems: Array<LinkItemProps> = [
  {
    name: defineMessage({ message: "Home" }),
    icon: AiFillHome,
    to: "/home",
    id: "home",
  },
  {
    name: defineMessage({ message: "Reporting" }),
    icon: FaRegChartBar,
    to: "/beta-rpa",
    id: "reporting",
  },
  {
    name: defineMessage({ message: "Executions" }),
    id: "executions",
    icon: FaCodeBranch,
    to: "/executions",
  },
  {
    name: defineMessage({ message: "Schedule" }),
    id: "schedule",
    icon: FaCalendarDay,
    to: "/schedule",
  },
  {
    name: defineMessage({ message: "Report download" }),
    id: "report",
    icon: FaCloudDownloadAlt,
    to: "/reports",
  },
  {
    name: defineMessage({ message: "Templates" }),
    id: "templates",
    icon: FaFileImport,
    to: "/templates",
  },
  {
    name: defineMessage({ message: "Workflows" }),
    id: "workflows",
    icon: FaRegChartBar,
    to: "/workflows",
  },
];
/* eslint-enable string-to-lingui/missing-lingui-transformation */

interface NavItemProps extends FlexProps {
  icon: IconType;
  to: string;
}
const NavItem: React.FC<PropsWithChildren<NavItemProps>> = ({
  icon,
  to,
  children,
  ...rest
}) => {
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
          {children}
        </Flex>
      )}
    </ReactLink>
  );
};

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const { i18n } = useLingui();
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
        <NavItem to={link.to} key={link.id} icon={link.icon}>
          {i18n._(link.name)}
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
