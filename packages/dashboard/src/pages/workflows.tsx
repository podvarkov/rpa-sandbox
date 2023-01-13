import {
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import { FaPlay, FaTrash } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { api, Workflow } from "../api";
import { ConfirmDialog } from "../components/confirm-dialog";
import { useToast } from "../components/use-toast";

export const WorkflowsPage: React.FC = () => {
  const { infoMessage, errorMessage, successMessage } = useToast();
  const navigate = useNavigate();
  const [executionId, setExecutionId] = useState<string>();
  const [deleteIntent, setDeleteIntent] = useState<string>();

  const { data: workflows, error } = useQuery("workflows", ({ signal }) =>
    api.getWorkflows(signal)
  );
  const client = useQueryClient();
  const mutation = useMutation(
    async () => {
      return deleteIntent ? api.deleteWorkflow(deleteIntent) : undefined;
    },
    {
      onSuccess: (data) => {
        successMessage(t`Workflow deleted`);
        setDeleteIntent(undefined);
        client.setQueryData<Workflow[]>("workflows", (res) =>
          (res || []).filter(({ _id }) => data?.id !== _id)
        );
      },
      onError: (e) => {
        console.error(e);
        errorMessage(t`Can not delete workflow`);
      },
    }
  );

  useEffect(() => {
    if (error) {
      errorMessage(t`There was an error while loading`);
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
      <ConfirmDialog
        isOpen={!!deleteIntent}
        onClose={() => setDeleteIntent(undefined)}
        onOk={() => mutation.mutate()}
        loading={mutation.isLoading}
        headerText={t`Delete workflow`}
      />

      <Flex mt={3} flexWrap="wrap" alignItems="baseline">
        {workflows?.map((workflow) => {
          return (
            <HStack
              onClick={() => {
                navigate(workflow._id);
              }}
              minW={0}
              key={workflow._id}
              cursor="pointer"
              _hover={{
                bg: "gray.50",
              }}
              border="1px"
              borderColor="borderColors.main"
              borderRadius={10}
              alignItems="center"
              p={2}
              ml={25}
              mb={25}
              mr={0}
              spacing={2}
              w={["100%", "100%", "100%", "45%", "30%", "23%"]}
              maxW={["100%", "100%", "100%", "45%", "30%", "23%"]}
              bg="white"
            >
              <Box flexShrink={0}>
                <Image
                  objectFit="contain"
                  boxSize={"4rem"}
                  alt="logo"
                  src={"/default-rpa-logo.png"}
                />
              </Box>
              <Tooltip label={workflow.description} aria-label="description">
                <Text
                  fontSize="lg"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  flexGrow={1}
                >
                  {workflow.name}
                </Text>
              </Tooltip>

              <HStack spacing={0}>
                <IconButton
                  size="sm"
                  variant="ghost"
                  aria-label="execute"
                  isLoading={workflow._id === executionId}
                  disabled={workflow.disabled || workflow._id === executionId}
                  icon={
                    <Icon
                      as={FaPlay}
                      color="bgColors.main"
                      title={t`Execute workflow`}
                    />
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    setExecutionId(workflow._id);
                    void api
                      .executeWorkflow({
                        workflowId: workflow._id,
                        templateId: workflow.templateId,
                        arguments: workflow.arguments || {},
                        expiration: workflow.expiration,
                      })
                      .then(() => {
                        infoMessage(t`queued`);
                      })
                      .catch(
                        (e: AxiosError<{ message: string | string[] }>) => {
                          console.error(e);
                          errorMessage(
                            e.response?.data.message
                              ? Array.isArray(e.response?.data.message)
                                ? e.response?.data.message.join("\n")
                                : e.response?.data.message
                              : t`error`
                          );
                        }
                      )
                      .finally(() => {
                        setExecutionId(undefined);
                      });
                  }}
                />

                <IconButton
                  size="sm"
                  variant="ghost"
                  aria-label="delete"
                  icon={
                    <Icon
                      as={FaTrash}
                      title={t`Delete workflow`}
                      color="gray.500"
                    />
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteIntent(workflow._id);
                  }}
                />
              </HStack>
            </HStack>
          );
        })}
      </Flex>
    </>
  );
};
