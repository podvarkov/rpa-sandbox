import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { useFetch } from "../components/use-fetch";
import { api } from "../api";
import { Field, FieldProps, Form, Formik } from "formik";
import { AxiosError } from "axios";
import { t, Trans } from "@lingui/macro";
import { ParametersFormField } from "../components/parameter-form-field";

export const WorkflowRunnerPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: workflow } = useFetch(async () => {
    if (params.id) return api.getWorkflow(params.id);
  }, true);

  const [status, setStatus] = useState<{
    status: "info" | "error";
    message: string;
  }>();

  return (
    <Box h={"100%"}>
      {workflow ? (
        <Container p={4}>
          <VStack spacing={4}>
            <Heading size="lg" p={4}>
              {workflow.name}
            </Heading>
            <Formik
              initialValues={{
                arguments: workflow.defaultArguments || {},
                expiration: 60000,
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
                  .catch((e: AxiosError<{ message: string }>) => {
                    console.error(e);
                    setStatus({
                      message: e.response?.data.message || "error",
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
