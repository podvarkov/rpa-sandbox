import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  VStack,
} from "@chakra-ui/react";
import * as Yup from "yup";
import { api } from "../api";
import { Field, FieldProps, Form, Formik } from "formik";
import { AxiosError } from "axios";
import { t, Trans } from "@lingui/macro";
import { ParametersFormField } from "../components/parameter-form-field";
import { useQuery } from "react-query";

export const WorkflowRunnerPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: workflow, isFetching } = useQuery(
    ["workflows", params.id],
    async ({ signal }) => {
      if (params.id) return api.getWorkflowWithTemplate(params.id, signal);
    },
    { enabled: !!params.id }
  );

  const [status, setStatus] = useState<{
    status: "info" | "error";
    message: string;
  }>();

  return (
    <Box h={"100%"}>
      {!isFetching && !workflow ? (
        <Center>
          <Heading size="sm">
            <Trans>Workflow with {params.id} not found</Trans>
          </Heading>
        </Center>
      ) : null}
      {workflow ? (
        <Container p={4}>
          <VStack spacing={4}>
            <Heading size="lg" p={4}>
              {workflow.name}
            </Heading>
            <Formik
              validationSchema={Yup.object({
                expiration: Yup.number().required(t`This field is required`),
              })}
              initialValues={{
                arguments: workflow.defaultArguments || {},
                expiration: workflow.expiration,
                workflowid: workflow.templateId,
              }}
              onSubmit={(values, actions) => {
                void api
                  .executeWorkflow(values)
                  .then((res) => {
                    setStatus({
                      message: "completed",
                      status: "info",
                    });
                    actions.setFieldValue("arguments", res.data);
                  })
                  .catch((e: AxiosError<{ message: string | string[] }>) => {
                    console.error(e);
                    setStatus({
                      message: e.response?.data.message
                        ? Array.isArray(e.response?.data.message)
                          ? e.response?.data.message.join("\n")
                          : e.response?.data.message
                        : t`error`,
                      status: "error",
                    });
                  })
                  .finally(() => {
                    actions.setSubmitting(false);
                  });
              }}
            >
              {({ isSubmitting }) => (
                <Form style={{ width: "100%" }}>
                  <Stack spacing="4">
                    {(workflow.template.Parameters || [])
                      .sort((a, b) => (a.name > b.name ? -1 : 1))
                      .sort((a) => (a.direction === "in" ? -1 : 1))
                      .map(({ type, name, direction }) => {
                        return (
                          <ParametersFormField
                            key={`arguments.${name}`}
                            name={`arguments.${name}`}
                            label={name}
                            placeholder={name}
                            type={type}
                            disabled={direction === "out"}
                          />
                        );
                      })}

                    <Field name="expiration">
                      {({ field, meta }: FieldProps) => (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <FormLabel>
                            <Trans>Timeout</Trans>
                          </FormLabel>
                          <Input
                            type="number"
                            placeholder={t`timeout`}
                            {...field}
                          />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>

                    {status ? (
                      <Alert status={status.status}>
                        <AlertIcon />
                        <AlertDescription>{status.message}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Button
                      isLoading={isSubmitting}
                      disabled={isFetching}
                      type="submit"
                      colorScheme="teal"
                    >
                      <Trans>Execute</Trans>
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          </VStack>
        </Container>
      ) : null}
    </Box>
  );
};
