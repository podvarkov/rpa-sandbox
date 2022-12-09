import {
  createMultiStyleConfigHelpers,
  defineStyle,
  defineStyleConfig,
  extendTheme,
} from "@chakra-ui/react";

import { inputAnatomy } from "@chakra-ui/anatomy";

// varinats for button
const brandPrimary = defineStyle({
  background: "none",
  color: "#000000",
  fontWeight: "normal",
  _hover: { color: "textColors.onhover" },
});

const submitBtn = defineStyle({
  background: "#33B4DE",
  color: "white",
  fontWeight: "normal",
  borderRadius: 20,
});

const buttonTheme = defineStyleConfig({
  variants: { brandPrimary, submitBtn },
});

// variants for input

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const defaultInput = definePartsStyle({
  field: {
    border: "1px",
    borderColor: "gray.200",
    background: "none",
    borderRadius: 0,

    _dark: {
      borderColor: "gray.600",
      background: "gray.800",
    },
  },
});

const inputTheme = defineMultiStyleConfig({
  variants: { default: defaultInput },
});

export const theme = extendTheme({
  colors: {
    textColors: {
      main: "rgb(134, 134, 134)",
      onhover: "#4BB0FF",
      // ...
      500: "#333333",
    },
    borderColors: {
      main: "rgb(228, 228, 228)",
      secondary: "#f0f0f0",
    },
    bgColors: {
      main: "#4BB0FF",
      primary: "#33B4DE",
      modalBg: "rgba(27, 32 , 36, 0.85)",
      secondary: "#f0f0f0",
    },
  },
  components: { Button: buttonTheme, Input: inputTheme, Select: inputTheme },
});
