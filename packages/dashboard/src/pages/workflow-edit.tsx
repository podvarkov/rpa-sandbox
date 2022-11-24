import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Center,
  Container,
  Heading,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { api } from "../api";
import { t, Trans } from "@lingui/macro";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { WorkflowForm, WorkflowFormValues } from "../components/workflow-form";

export const EditWorkflowPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const toast = useToast();
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
        toast({
          title: t`Workflow updated`,
          status: "success",
          position: "top-right",
          duration: 1000,
        });

        client.removeQueries(["workflows", variables._id]);
        client.removeQueries("workflows");
        navigate("/workflows");
      },
      onError: (e) => {
        console.error(e);
        toast({
          title: t`Can not edit workflow`,
          status: "error",
          position: "top-right",
          duration: 1000,
        });
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
              templateParameters={workflow.template.Parameters}
              onSubmit={(values) => mutation.mutateAsync(values)}
            />
          </VStack>
        </Container>
      ) : null}
    </Box>
  );
};
