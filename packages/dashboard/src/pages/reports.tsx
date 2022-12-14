import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { format } from "date-fns";
import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
import { api, ScheduledEvent } from "../api";
import { useAuth } from "../components/auth-provider";

export const ReportsPage: React.FC = () => {
  const { error, data: reports } = useQuery("reports", ({ signal }) =>
    api.getReports(signal)
  );
  const toast = useToast();
  const auth = useAuth();

  const client = useQueryClient();
  const [deleteIntent, setDeleteIntent] = useState<string>();
  const cancelRef = useRef(null);
  const mutation = useMutation(
    async () => {
      return deleteIntent ? api.deleteReport(deleteIntent) : undefined;
    },
    {
      onSuccess: (data) => {
        toast({
          title: t`Report deleted`,
          status: "success",
          position: "top-right",
          duration: 1000,
        });
        setDeleteIntent(undefined);
        client.setQueryData<ScheduledEvent[]>("reports", (res) =>
          (res || []).filter(({ _id }) => data?.id !== _id)
        );
      },
      onError: (e) => {
        console.error(e);
        toast({
          title: t`Can not delete report`,
          status: "error",
          position: "top-right",
          duration: 1000,
        });
      },
    }
  );

  useEffect(() => {
    if (error) {
      toast({
        title: t`There was an error while loading`,
        status: "error",
        position: "top-right",
        duration: 1000,
      });
      console.error(error);
    }
  }, [error]);

  return (
    <Box bg="white" px={6}>
      <AlertDialog
        isOpen={!!deleteIntent}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteIntent(undefined)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <Trans>Delete report</Trans>
            </AlertDialogHeader>

            <AlertDialogBody>
              <Trans>
                Are you sure? You can not undo this action afterwards.
              </Trans>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setDeleteIntent(undefined);
                }}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                isLoading={mutation.isLoading}
                colorScheme="red"
                ml={3}
                onClick={() => {
                  mutation.mutate();
                }}
              >
                <Trans>Delete</Trans>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <TableContainer bg="gray.50">
        <Table size="md">
          <Thead bg="#33B4DE">
            <Tr>
              <Th py={4} textColor="whitesmoke">
                <Trans>Name</Trans>
              </Th>
              <Th py={4} textColor="whitesmoke">
                <Trans>Created</Trans>
              </Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {reports && reports.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <Trans>No data available</Trans>
                </Td>
              </Tr>
            ) : (
              reports?.map((file) => {
                return (
                  <Tr key={file._id}>
                    <Td>
                      <Trans>{file.metadata.name}</Trans>
                    </Td>
                    {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
                    <Td>{format(new Date(file.uploadDate), "Pp")}</Td>
                    <Td>
                      <HStack spacing={2} justifyContent="end" w="100%">
                        <a
                          href={`/api/reports/download/${file._id}?token=${auth.session?.jwt}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <DownloadIcon
                            cursor="pointer"
                            fontSize="sm"
                            color="gray.500"
                            aria-label="download"
                          />
                        </a>

                        <IconButton
                          variant="ghost"
                          color="gray.500"
                          size="sm"
                          aria-label="delete"
                          icon={<DeleteIcon />}
                          onClick={() => setDeleteIntent(file._id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};