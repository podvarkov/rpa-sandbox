import React, { useEffect, useState } from "react";
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
import { api, WorkflowTemplate } from "../api";
// import * as Yup from "yup";
import { Field, FieldProps, Form, Formik } from "formik";
import { AxiosError } from "axios";

export const WorkflowRunnerPage: React.FC = () => {
  const params = useParams<{ id: string }>();
  const { data: workflow } = useFetch(() => api.getWorkflow(params.id!), true);
  const [template, setTemplate] = useState<WorkflowTemplate>();
  const [status, setStatus] = useState<{
    status: "info" | "error";
    message: string;
  }>();

  useEffect(() => {
    if (workflow?.templateId) {
      api
        .getTemplate("openrpa", workflow.templateId)
        .then((res) => setTemplate(res));
    }
  }, [workflow?.templateId]);

  // todo validate schema from params

  return (
    <Box h={"100%"}>
      {workflow && template ? (
        <Container p={4}>
          <VStack spacing={4}>
            <Heading size="lg">{workflow.name}</Heading>
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
                    {(template.Parameters || [])
                      .sort((a, b) => (a.name > b.name ? -1 : 1))
                      .sort((a) => (a.direction === "in" ? -1 : 1))
                      .map(({ type, name }) => {
                        return (
                          <Field name={`arguments.${name}`} key={name}>
                            {({ field, meta }: FieldProps) => {
                              return (
                                <FormControl
                                  isInvalid={!!(meta.touched && meta.error)}
                                >
                                  <FormLabel>
                                    {name}({type})
                                  </FormLabel>
                                  <Input placeholder={name} {...field} />
                                  <FormErrorMessage>
                                    {meta.error}
                                  </FormErrorMessage>
                                </FormControl>
                              );
                            }}
                          </Field>
                        );
                      })}
                    <Field name="expiration">
                      {({ field, meta }: FieldProps) => (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <FormLabel>Timeout</FormLabel>
                          <Input
                            type="number"
                            placeholder={"timeout"}
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
                      Execute
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
