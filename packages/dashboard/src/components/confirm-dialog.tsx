import React, { useRef } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import { t } from "@lingui/macro";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void | Promise<void>;
  okText?: string;
  cancelText?: string;
  headerText?: string;
  bodyText?: string;
  loading?: boolean;
};
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  okText,
  cancelText,
  headerText,
  bodyText,
  onOk,
  onClose,
  loading,
}) => {
  const cancelRef = useRef(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => onClose()}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {headerText || t`Confirm action`}
          </AlertDialogHeader>

          <AlertDialogBody>
            {bodyText ||
              t`Are you sure? You can not undo this action afterwards.`}
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              size="sm"
              ref={cancelRef}
              onClick={() => {
                onClose();
              }}
            >
              {cancelText || t`Cancel`}
            </Button>
            <Button
              size="sm"
              isLoading={loading}
              colorScheme="red"
              ml={3}
              onClick={() => {
                onOk();
              }}
            >
              {okText || t`Confirm`}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
