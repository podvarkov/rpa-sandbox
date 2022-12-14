import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Text,
  useBoolean,
  useToast,
} from "@chakra-ui/react";
import { api, Workflow } from "../api";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { t, Trans } from "@lingui/macro";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AxiosError } from "axios";

export const WorkflowsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [isExecuting, { on: startExecuting, off: stopExecuting }] =
    useBoolean(false);
  const { data: workflows, error } = useQuery("workflows", ({ signal }) =>
    api.getWorkflows(signal)
  );
  const client = useQueryClient();
  const [deleteIntent, setDeleteIntent] = useState<string>();
  const cancelRef = useRef(null);
  const mutation = useMutation(
    async () => {
      return deleteIntent ? api.deleteWorkflow(deleteIntent) : undefined;
    },
    {
      onSuccess: (data) => {
        toast({
          title: t`Workflow deleted`,
          status: "success",
          position: "top-right",
          duration: 1000,
        });
        setDeleteIntent(undefined);
        client.setQueryData<Workflow[]>("workflows", (res) =>
          (res || []).filter(({ _id }) => data?.id !== _id)
        );
      },
      onError: (e) => {
        console.error(e);
        toast({
          title: t`Can not delete workflow`,
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
    }
  }, [error]);

  return workflows && workflows.length === 0 ? (
    <Center>
      <Heading size="sm">
        <Trans>Your workflows will be listed here</Trans>
      </Heading>
    </Center>
  ) : (
    <>
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

      <Flex alignItems="baseline" flexWrap={"wrap"}>
        {workflows?.map((wf) => (
          <Box
            m={2}
            flexShrink={0}
            flexGrow={1}
            w={[null, null, "47%", "30%", "24%"]}
            maxW={[null, null, "47%", "30%", "24%"]}
            bg="white"
            key={wf._id}
            boxShadow={"sm"}
            _hover={{ boxShadow: "md" }}
          >
            <HStack p={4}>
              <Avatar size={"sm"} src="/wf-icon.png" />
              <Heading flex={1} fontFamily={"roboto"} size={"md"}>
                {wf.name}
              </Heading>
              <IconButton
                size="xs"
                variant="outline"
                aria-label={
                  /* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */
                  "Edit"
                }
                onClick={() => {
                  navigate(wf._id);
                }}
                icon={<EditIcon />}
              />
              <IconButton
                size="xs"
                variant="outline"
                aria-label={
                  /* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */
                  "Delete"
                }
                onClick={() => setDeleteIntent(wf._id)}
                icon={<DeleteIcon />}
              />
            </HStack>
            <Divider />
            <Box p={4} fontFamily={"roboto"}>
              <Text mb={4}>{wf.description || t`No description`}</Text>
            </Box>
            <Box textAlign="right" px={4} pb={4}>
              <Button
                size="sm"
                variant="outline"
                rounded="sm"
                colorScheme="teal"
                isLoading={isExecuting}
                onClick={() => {
                  startExecuting();
                  void api
                    .executeWorkflow({
                      workflowId: wf._id,
                      templateId: wf.templateId,
                      arguments: wf.defaultArguments || {},
                      expiration: wf.expiration,
                    })
                    .then(() => {
                      toast({
                        title: t`queued`,
                        status: "info",
                        duration: 1000,
                        position: "top-right",
                      });
                    })
                    .catch((e: AxiosError<{ message: string | string[] }>) => {
                      console.error(e);
                      toast({
                        title: e.response?.data.message
                          ? Array.isArray(e.response?.data.message)
                            ? e.response?.data.message.join("\n")
                            : e.response?.data.message
                          : t`error`,
                        status: "error",
                        duration: 1000,
                        position: "top-right",
                      });
                    })
                    .finally(() => {
                      stopExecuting();
                    });
                }}
              >
                <Trans>Run workflow</Trans>
              </Button>
            </Box>
          </Box>
        ))}
      </Flex>
    </>
  );
};
