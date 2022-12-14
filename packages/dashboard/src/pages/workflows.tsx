import React, { useEffect, useState } from "react";
import {
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
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { t, Trans } from "@lingui/macro";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { AxiosError } from "axios";
import { api, Workflow } from "../api";
import { ConfirmDialog } from "../components/confirm-dialog";
import { useToast } from "../components/use-toast";

export const WorkflowsPage: React.FC = () => {
  const { infoMessage, errorMessage, successMessage } = useToast();
  const navigate = useNavigate();
  const [isExecuting, { on: startExecuting, off: stopExecuting }] =
    useBoolean(false);
  const { data: workflows, error } = useQuery("workflows", ({ signal }) =>
    api.getWorkflows(signal)
  );
  const client = useQueryClient();
  const [deleteIntent, setDeleteIntent] = useState<string>();
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
                      infoMessage(t`queued`);
                    })
                    .catch((e: AxiosError<{ message: string | string[] }>) => {
                      console.error(e);
                      errorMessage(
                        e.response?.data.message
                          ? Array.isArray(e.response?.data.message)
                            ? e.response?.data.message.join("\n")
                            : e.response?.data.message
                          : t`error`
                      );
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
