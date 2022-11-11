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
import { t, Trans } from "@lingui/macro";

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
        name: Yup.string().required(t`This field is required`),
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
                    <FormLabel>
                      <Trans>Workflow name:</Trans>
                    </FormLabel>
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
                    <FormLabel>
                      <Trans>Workflow description:</Trans>
                    </FormLabel>
                    <Input placeholder={t`Optional description`} {...field} />
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
                        <FormLabel>
                          <Trans>Input argument: {key}</Trans>
                        </FormLabel>
                        <Input placeholder={t`Input argument`} {...field} />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
              );
            })}

            <Button isLoading={isSubmitting} type="submit" colorScheme="teal">
              {initialValues._id ? t`Update workflow` : t`Create workflow`}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
