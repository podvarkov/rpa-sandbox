import {
  Box,
  Flex,
  FlexProps,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { useQuery } from "react-query";
import { NavLink as ReactLink } from "react-router-dom";
import { api } from "../../api";

interface NavItemProps extends FlexProps {
  to: string;
  name: string;
}
const NavItem: React.FC<PropsWithChildren<NavItemProps>> = ({
  // icon,
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
            border: "1px",
            borderColor: "gray.200",
          }}
          {...rest}
        >
          {/* <Flex flex="1" justifyContent="space-between" align="center"> */}
          {children}
          {/* </Flex> */}
        </Flex>
      )}
    </ReactLink>
  );
};

export const RobotList: React.FC = (isActive) => {
  const { error, data: Robots } = useQuery("templates", ({ signal }) =>
    api.getTemplates(signal)
  );

  console.log(Robots, isActive, error);

  return (
    <HStack
      transition="3s ease"
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: 60 }}
      // pos="fixed"
      h="full"
      className="robotList"
      // {...rest}
    >
      <Box
        position="relative"
        h="full"
        w="full"
        alignItems="center"
        className="myBox"
      >
        {Robots?.map((item) => (
          <NavItem name={item.name} key={item._id} to={`robot/${item._id}`}>
            {item.name}
          </NavItem>
        ))}
      </Box>
    </HStack>
  );
};
