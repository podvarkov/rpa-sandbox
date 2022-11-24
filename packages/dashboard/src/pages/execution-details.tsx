import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { api } from "../api";
import { useParams } from "react-router-dom";
import {
  Box,
  Center,
  Container,
  Heading,
  HStack,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import dayjs from "dayjs";
import { useLingui } from "@lingui/react";
import { executionStatuses } from "./executions";

export const ExecutionDetailsPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { i18n } = useLingui();
  const toast = useToast();

  const {
    data: execution,
    isFetching,
    error,
  } = useQuery(
    ["executions", params.id],
    async ({ signal }) => {
      if (params.id) return api.getExecution(params.id, signal);
    },
    { enabled: !!params.id }
  );

  const { data: workflow } = useQuery(
    ["workflows", execution?._id],
    async ({ signal }) => {
      if (execution?._id) return api.getWorkflow(execution.workflowId, signal);
    },
    { enabled: !!execution?._id }
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
    <Box h={"100%"} bg={"white"}>
      {!isFetching && !execution ? (
        <Center>
          <Heading size="sm">
            <Trans>Execution with {params.id} id not found</Trans>
          </Heading>
        </Center>
      ) : null}
      {execution ? (
        <Container p={4} textAlign="left">
          <VStack spacing={4}>
            <Heading mb={4}>
              <Trans>Execution details</Trans>
            </Heading>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>ID:</Trans>
              </Box>
              <Box flex={1}>{execution._id}</Box>
            </HStack>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Workflow:</Trans>
              </Box>
              <Box flex={1}>{workflow?.name || execution.workflowId}</Box>
            </HStack>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Status:</Trans>
              </Box>
              <Box flex={1}>
                {i18n._(
                  executionStatuses[
                    execution.status as keyof typeof executionStatuses
                  ]
                )}
              </Box>
            </HStack>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Expiration timeout:</Trans>
              </Box>
              <Box flex={1}>{execution.expiration}</Box>
            </HStack>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Arguments:</Trans>
              </Box>
              <Box flex={1}>
                {JSON.stringify(execution.arguments || {}, null, 2)}
              </Box>
            </HStack>
            {execution.status === "invokecompleted" ? (
              <HStack spacing={4} w="100%">
                <Box flex={0.2}>
                  <Trans>Output:</Trans>
                </Box>
                <Box flex={1}>
                  {JSON.stringify(execution.output || {}, null, 2)}
                </Box>
              </HStack>
            ) : (
              <HStack spacing={4} w="100%">
                <Box flex={0.2}>
                  <Trans>Error:</Trans>
                </Box>
                <Box flex={1}>{execution.error}</Box>
              </HStack>
            )}
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Started at:</Trans>
              </Box>
              <Box flex={1}>
                {dayjs(execution.startedAt).format("ll HH:mm:ss")}
              </Box>
            </HStack>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Invoked at:</Trans>
              </Box>
              <Box flex={1}>
                {dayjs(execution.invokedAt).format("ll HH:mm:ss")}
              </Box>
            </HStack>
            <HStack spacing={4} w="100%">
              <Box flex={0.2}>
                <Trans>Finished at:</Trans>
              </Box>
              <Box flex={1}>
                {dayjs(execution.finishedAt).format("ll HH:mm:ss")}
              </Box>
            </HStack>
          </VStack>
        </Container>
      ) : null}
    </Box>
  );
};