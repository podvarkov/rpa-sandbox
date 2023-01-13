import {
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { Field, FieldProps, Form, Formik } from "formik";
import React from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import { api } from "../api";
import { RobotParametrs } from "../components/robot-parametrs";

export const BetaRpa: React.FC = () => {
  const { id } = useParams();
  console.log(id);

  return id ? (
    <Center flexDirection="column" maxW="xl" mx="auto">
      <Heading size="sm">
        <Text fontSize="lg" pb="5" align="center">
          <Trans>Monthly report creation</Trans>
        </Text>
      </Heading>
      <Formik
        initialValues={{
          name: "",
          description: "",
          templateId: id,
        }}
        onSubmit={(values, actions) => {
          console.log(values);
          api.upsertWorkflow(values);
          actions.setSubmitting(false);
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
                      <Input
                        {...field}
                        variant="default"
                        placeholder={t`Enter event title`}
                      />
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
              <RobotParametrs robotId={id} />{" "}
              <Button
                isLoading={isSubmitting}
                px={10}
                type="submit"
                variant="outline"
              >
                <Trans>Save</Trans>
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Center>
  ) : null;
};
