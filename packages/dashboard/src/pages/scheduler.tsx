import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { api, ScheduledEvent } from "../api";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useBoolean,
  useToast,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { SchedulerForm } from "../components/scheduler-form";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { format } from "date-fns";

export const SchedulerPage: React.FC = () => {
  const {
    data: events,
    error,
    refetch,
  } = useQuery("events", ({ signal }) => api.getEvents(signal), {
    keepPreviousData: true,
  });
  const [isOpen, { on, off }] = useBoolean(false);
  const [editIntent, setEditIntent] = useState<ScheduledEvent>();
  const toast = useToast();

  const client = useQueryClient();
  const [deleteIntent, setDeleteIntent] = useState<string>();
  const cancelRef = useRef(null);
  const mutation = useMutation(
    async () => {
      return deleteIntent ? api.deleteEvent(deleteIntent) : undefined;
    },
    {
      onSuccess: (data) => {
        toast({
          title: t`Event deleted`,
          status: "success",
          position: "top-right",
          duration: 1000,
        });
        setDeleteIntent(undefined);
        client.setQueryData<ScheduledEvent[]>("events", (res) =>
          (res || []).filter(({ _id }) => data?.id !== _id)
        );
      },
      onError: (e) => {
        console.error(e);
        toast({
          title: t`Can not delete event`,
          status: "error",
          position: "top-right",
          duration: 1000,
        });
      },
    }
  );

  const { data: workflows, error: workflowsError } = useQuery(
    "workflows",
    ({ signal }) => api.getWorkflows(signal)
  );

  useEffect(() => {
    if (error || workflowsError) {
      toast({
        title: t`There was an error while loading`,
        status: "error",
        position: "top-right",
        duration: 1000,
      });
      console.error(error, workflowsError);
    }
  }, [error, workflowsError]);

  // todo edit event

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
              <Trans>Delete workflow</Trans>
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

      <Modal
        size="lg"
        isOpen={!!editIntent || isOpen}
        onClose={() => {
          off();
          setEditIntent(undefined);
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Heading size={"md"}>
                <Trans>Schedule execution</Trans>
              </Heading>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <SchedulerForm
              event={
                editIntent
                  ? {
                      name: editIntent.name,
                      _id: editIntent._id,
                      workflowId: editIntent.workflowId,
                      rrule: {
                        dtstart: new Date(editIntent.rrule.dtstart),
                        until: editIntent.rrule.until
                          ? new Date(editIntent.rrule.until)
                          : undefined,
                        byweekday: editIntent.rrule.byweekday,
                        freq: editIntent.rrule.freq,
                        interval: editIntent.rrule.interval,
                        preset: editIntent.rrule.preset,
                      },
                    }
                  : undefined
              }
              onSubmit={(values) => {
                return api
                  .upsertEvent(values)
                  .then(() => {
                    toast({
                      title: t`Success`,
                      status: "success",
                      position: "top-right",
                      duration: 1000,
                    });
                    setEditIntent(undefined);
                    off();
                    return refetch();
                  })
                  .catch(() => {
                    toast({
                      title: t`Something goes wrong`,
                      status: "error",
                      position: "top-right",
                      duration: 1000,
                    });
                  });
              }}
              workflows={workflows || []}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <TableContainer bg="gray.50">
        <Table size="md">
          <Thead bg="#33B4DE">
            <Tr>
              <Th py={4} textColor="whitesmoke">
                <Trans>Title</Trans>
              </Th>
              <Th py={4} textColor="whitesmoke">
                <Trans>Created</Trans>
              </Th>
              <Th py={4} textColor="whitesmoke">
                <Trans>Modified</Trans>
              </Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {events && events.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <Trans>No data available</Trans>
                </Td>
              </Tr>
            ) : (
              events?.map((event) => {
                return (
                  <Tr
                    key={event?._id}
                    _hover={{
                      bg: "var(--chakra-colors-chakra-border-color)",
                    }}
                  >
                    <Td>{event.name}</Td>
                    {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
                    <Td>{format(new Date(event._created), "Pp")}</Td>
                    {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
                    <Td>{format(new Date(event._modified), "Pp")}</Td>
                    <Td>
                      <HStack spacing={2} justifyContent="end" w="100%">
                        <IconButton
                          variant="ghost"
                          color="gray.500"
                          size="sm"
                          aria-label="edit"
                          icon={<EditIcon />}
                          onClick={() => setEditIntent(event)}
                        />
                        <IconButton
                          variant="ghost"
                          color="gray.500"
                          size="sm"
                          aria-label="delete"
                          icon={<DeleteIcon />}
                          onClick={() => setDeleteIntent(event._id)}
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

      <Button onClick={on} mt={8}>
        <Trans>Add event</Trans>
      </Button>
    </Box>
  );
};
