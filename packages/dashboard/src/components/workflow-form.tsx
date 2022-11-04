import React from "react";
import { Field, FieldProps, Form, Formik } from "formik";
import * as Yup from "yup";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";

export type WorkflowFormValues = {
  _id?: string;
  name: string;
  description?: string;
  templateId: string;
  defaultArguments?: { [key: string]: unknown };
};

export const WorkflowForm: React.FC<{
  initialValues: WorkflowFormValues;
  onSubmit: (values: WorkflowFormValues) => Promise<unknown>;
}> = ({ initialValues, onSubmit }) => {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values, actions) => {
        void onSubmit(values).finally(() => {
          actions.setSubmitting(false);
        });
      }}
      validationSchema={Yup.object({
        name: Yup.string().required("This field is required"),
        description: Yup.string(),
      })}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing="4" mb={4}>
            <Field name="name">
              {({ field, meta }: FieldProps) => {
                return (
                  <FormControl isInvalid={!!(meta.touched && meta.error)}>
                    <FormLabel>Workflow name:</FormLabel>
                    <Input {...field} />
                    <FormErrorMessage>{meta.error}</FormErrorMessage>
                  </FormControl>
                );
              }}
            </Field>

            <Field name="description">
              {({ field, meta }: FieldProps) => {
                return (
                  <FormControl isInvalid={!!(meta.touched && meta.error)}>
                    <FormLabel>Workflow description:</FormLabel>
                    <Input placeholder="Optional description" {...field} />
                    <FormErrorMessage>{meta.error}</FormErrorMessage>
                  </FormControl>
                );
              }}
            </Field>

            {Object.keys(initialValues.defaultArguments || {}).map((key) => {
              return (
                <Field name={`defaultArguments.${key}`} key={key}>
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <FormLabel>Input argument: {key}</FormLabel>
                        <Input placeholder="Input argument" {...field} />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
              );
            })}

            <Button isLoading={isSubmitting} type="submit" colorScheme="teal">
              {initialValues._id ? "Update workflow" : "Create workflow"}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
