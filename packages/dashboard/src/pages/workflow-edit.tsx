import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Center, Container, Heading, VStack } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { api } from "../api";
import { WorkflowForm, WorkflowFormValues } from "../components/workflow-form";
import { useToast } from "../components/use-toast";

export const EditWorkflowPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { errorMessage, successMessage } = useToast();
  const client = useQueryClient();
  const navigate = useNavigate();
  const { data: workflow, isFetching } = useQuery(
    ["workflows", params.id],
    async ({ signal }) => {
      if (params.id) return api.getWorkflowWithTemplate(params.id, signal);
    },
    { enabled: !!params.id }
  );

  const mutation = useMutation(
    (wf: WorkflowFormValues) => {
      return api.upsertWorkflow(wf);
    },
    {
      onSuccess: (data, variables) => {
        successMessage(t`Workflow updated`);

        client.removeQueries(["workflows", variables._id]);
        client.removeQueries("workflows");
        navigate("/workflows");
      },
      onError: (e) => {
        console.error(e);
        errorMessage(t`Can not edit workflow`);
      },
    }
  );

  return (
    <Box h={"100%"} bg="white">
      {!isFetching && !workflow ? (
        <Center>
          <Heading size="sm">
            <Trans>Workflow with {params.id} id not found</Trans>
          </Heading>
        </Center>
      ) : null}
      {workflow ? (
        <Container p={4}>
          <VStack spacing={4}>
            <Heading size="lg" p={4}>
              {workflow.name}
            </Heading>
            <WorkflowForm
              initialValues={workflow}
              templateParameters={workflow?.template?.Parameters || []}
              onSubmit={(values) => mutation.mutateAsync(values)}
            />
          </VStack>
        </Container>
      ) : null}
    </Box>
  );
};
