import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  CloseButton,
  Flex,
  FlexProps,
  HStack,
  Icon,
  useColorModeValue,
  useOutsideClick,
} from "@chakra-ui/react";
import { MessageDescriptor } from "@lingui/core";
import { defineMessage } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import React, { PropsWithChildren, ReactNode, useRef, useState } from "react";
import { IconType } from "react-icons";
import { AiFillHome } from "react-icons/ai";
import {
  FaCalendarDay,
  FaCloudDownloadAlt,
  FaCodeBranch,
  FaFileImport,
  FaRegChartBar,
} from "react-icons/fa";
import { NavLink as ReactLink } from "react-router-dom";
import { RobotList } from "./submenus/robot-list";

interface LinkItemProps {
  id: string;
  name: MessageDescriptor;
  icon: IconType;
  to: string;
  subMenu?: ReactNode;
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
    to: "/robot",
    id: "reporting",
    subMenu: <RobotList />,
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
    <ReactLink to={to} style={{ textDecoration: "none", position: "relative" }}>
      {/* {({ isActive }) => ( */}
      <Flex
        align="center"
        p="4"
        role="group"
        cursor="pointer"
        color="white"
        _hover={{
          bg: "rgba(255,255,255, 0.3)",
        }}
        // bg={isActive ? "rgba(255,255,255, 0.3)" : undefined}
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
        <Flex flex="1" justifyContent="space-between" align="center">
          {children}
        </Flex>
      </Flex>
      {/* )} */}
    </ReactLink>
  );
};

export default function SidebarContent({ onClose, ...rest }: SidebarProps) {
  const { i18n } = useLingui();
  const [visible, setVisible] = useState(false);
  const [, setActiveLink] = useState("home");

  const subMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick({
    ref: subMenuRef,
    handler: () => setVisible(false),
  });

  const clickHandler = (link: LinkItemProps) => {
    if (link.subMenu != null) {
      setActiveLink(link.id);
      setVisible(true);
    } else setVisible(false);
  };

  return (
    <HStack
      transition="3s ease"
      bg={useColorModeValue("#33B4DE", "gray.200")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      pos="fixed"
      h="full"
      zIndex={99}
      {...rest}
    >
      <Flex h="full">
        <Box w={{ base: "full", md: 60 }}>
          <Flex h="20" justifyContent="space-between">
            <Box w={40} p={4} alignItems="center">
              <img src="/header_logo.png" width="90%" alt="avatar" />
            </Box>
            <CloseButton
              display={{ base: "flex", md: "none" }}
              onClick={onClose}
            />
          </Flex>
          {LinkItems.map((link) => (
            <Box key={link.id}>
              <NavItem
                to={link.to}
                icon={link.icon}
                onClick={() => clickHandler(link)}
                onMouseOver={() => {
                  if (link.subMenu != null) {
                    setVisible(true);
                  } else {
                    setVisible(false);
                  }
                }}
              >
                {i18n._(link.name)}
                {link.subMenu != null && <ChevronRightIcon fontSize={20} />}
              </NavItem>

              {visible && link.subMenu != null && (
                <Box
                  ref={subMenuRef}
                  h="100vh"
                  right="-100%"
                  top="0"
                  bg="#71CBE8"
                  zIndex={999}
                  w={{ base: "full", md: 60 }}
                  position="absolute"
                  transition="0.2s"
                >
                  <Flex h="20" justifyContent="space-between"></Flex>
                  {link.subMenu}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Flex>
    </HStack>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}
