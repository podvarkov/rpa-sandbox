import { useCallback } from "react";
import { useToast as useChakraToast, UseToastOptions } from "@chakra-ui/react";

export function useToast() {
  const chakraToast = useChakraToast({ position: "top-right", duration: 1000 });
  const toast = useCallback(
    (status: UseToastOptions["status"], title: string) =>
      chakraToast({
        status,
        title,
      }),
    [chakraToast]
  );

  return {
    message: toast,
    errorMessage: toast.bind(null, "error"),
    successMessage: toast.bind(null, "success"),
    infoMessage: toast.bind(null, "info"),
  };
}
