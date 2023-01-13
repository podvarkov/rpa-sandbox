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
import { RobotParameters } from "../components/robot-parameters";

export const BetaRpa: React.FC = () => {
  const { id } = useParams();

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
          arguments: {},
        }}
        onSubmit={(values, actions) => {
          api.upsertWorkflow(values).then(() => {
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
              <RobotParameters robotId={id} />
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
