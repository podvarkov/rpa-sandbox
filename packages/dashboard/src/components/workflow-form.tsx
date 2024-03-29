import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Field, FieldProps, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import { UpsertWorkflowValues, WorkflowTemplate } from "../api";
import { ParametersFormField } from "../components/parameter-form-field";

export const WorkflowForm: React.FC<{
  templateParameters: WorkflowTemplate["Parameters"];
  initialValues: UpsertWorkflowValues;
  onSubmit: (values: UpsertWorkflowValues) => Promise<unknown>;
}> = ({ initialValues, onSubmit, templateParameters }) => {
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
        <Form style={{ width: "100%" }}>
          <Stack spacing="4" mb={4}>
            <Field name="name">
              {({ field, meta }: FieldProps) => {
                return (
                  <FormControl isInvalid={!!(meta.touched && meta.error)}>
                    <FormLabel>
                      <Trans>Workflow name:</Trans>
                    </FormLabel>
                    <Input {...field} variant="default" />
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
                    <Input
                      placeholder={t`Optional description`}
                      {...field}
                      variant="default"
                    />
                    <FormErrorMessage>{meta.error}</FormErrorMessage>
                  </FormControl>
                );
              }}
            </Field>

            {(templateParameters || [])
              .filter(({ direction }) => direction === "in")
              .sort((a, b) => (a.name > b.name ? -1 : 1))
              .map(({ type, name }) => (
                <ParametersFormField
                  key={name}
                  type={type}
                  label={t`Input argument: ${name}`}
                  placeholder={t`Input argument: ${name}`}
                  disabled={false}
                  name={`defaultArguments.${name}`}
                />
              ))}

            <Button
              isLoading={isSubmitting}
              type="submit"
              variant={"submitBtn"}
            >
              {initialValues._id ? t`Update workflow` : t`Create workflow`}
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
