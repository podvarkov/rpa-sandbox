import React, { useEffect, useState } from "react";
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
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Field, FieldProps, Form, Formik } from "formik";
import * as Yup from "yup";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth-provider";
import { AxiosError } from "axios";
import { t, Trans } from "@lingui/macro";

export const SignupPage: React.FC = () => {
  const { signup, session } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session]);

  return (
    <Box bg="gray.50" h="100vh" color="black" pt="12em">
      <Container bg="white" boxShadow="sm" p="6">
        <Stack spacing="4" direction="column">
          <Center>
            <Heading size="lg">
              <Trans>Sign up</Trans>
            </Heading>
          </Center>

          <Formik
            initialValues={{
              username: "",
              password: "",
              passwordConfirmation: "",
            }}
            onSubmit={(values, actions) => {
              signup(values)
                .catch((e: AxiosError) => {
                  console.error(e);
                  setError(
                    e.response?.status === 409
                      ? t`User ${values.username} already exists`
                      : t`Something goes wrong`
                  );
                })
                .finally(() => {
                  actions.setSubmitting(false);
                });
            }}
            validationSchema={Yup.object({
              username: Yup.string()
                .email(t`Must be a valid email`)
                .required(t`This field is required`),
              password: Yup.string().required(t`This field is required`),
              passwordConfirmation: Yup.string()
                .oneOf([Yup.ref("password")], t`Passwords must match`)
                .required(t`This field is required`),
            })}
          >
            {({ isSubmitting }) => (
              <Form>
                <Stack spacing="4">
                  <Field name="username">
                    {({ field, meta }: FieldProps) => {
                      return (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <FormLabel>
                            <Trans>Email address</Trans>
                          </FormLabel>
                          <Input placeholder={t`Email`} {...field} />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      );
                    }}
                  </Field>
                  <Field name="password">
                    {({ field, meta }: FieldProps) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <FormLabel>
                          <Trans>Password</Trans>
                        </FormLabel>
                        <Input
                          type="password"
                          placeholder={t`Password`}
                          {...field}
                        />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  <Field name="passwordConfirmation">
                    {({ field, meta }: FieldProps) => (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <FormLabel>
                          <Trans>Confirm password</Trans>
                        </FormLabel>
                        <Input
                          type="password"
                          placeholder={t`Confirm password`}
                          {...field}
                        />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                  {error ? (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  <Button
                    type="submit"
                    colorScheme="teal"
                    isLoading={isSubmitting}
                  >
                    <Trans>Create account</Trans>
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>

          <Text fontSize="sm" align="right">
            <Trans>Have an account? </Trans>{" "}
            <Link color="teal.500" to="/signin" as={RouterLink}>
              <Trans>Sign in</Trans>
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};
