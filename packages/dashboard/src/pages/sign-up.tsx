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
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { AxiosError } from "axios";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { useAuth } from "../components/auth-provider";

export const SignupPage: React.FC = () => {
  const { signup, session } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const { email } = useParams();

  useEffect(() => {
    if (session) navigate("/", { replace: true });
  }, [session]);

  return (
    <Box h="100vh" color="black" pt="5em">
      <Container maxW="2xl" bg="white" p="6">
        <Stack spacing="4" direction="column" align="center">
          <Center mb="4em">
            <Heading size="lg">
              <Trans>Sign up</Trans>
            </Heading>
          </Center>

          <Formik
            initialValues={{
              username: email || "",
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
                <Stack spacing="5" align="center">
                  <Stack mx="auto" maxWidth={400}>
                    <Field name="username">
                      {({ field, meta }: FieldProps) => {
                        return (
                          <FormControl
                            isInvalid={!!(meta.touched && meta.error)}
                          >
                            <Input
                              variant="signUpInput"
                              placeholder={t`Email`}
                              {...field}
                            />
                            <FormErrorMessage>{meta.error}</FormErrorMessage>
                          </FormControl>
                        );
                      }}
                    </Field>
                    <Field name="password">
                      {({ field, meta }: FieldProps) => (
                        <FormControl isInvalid={!!(meta.touched && meta.error)}>
                          <Input
                            variant="signUpInput"
                            type="password"
                            placeholder={t`Password`}
                            {...field}
                          />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </Stack>

                  <Box fontSize="14px">
                    <Text>
                      <Trans>
                        Password must be 8 characters or more and 32 characters
                        or less. You can use single-byte alphanumeric characters
                        and the following symbols.
                      </Trans>
                    </Text>
                    <Text>
                      <Trans>Available symbols (half-width)</Trans>
                    </Text>
                    <Text>
                      <Trans> _ ! # $ ~ ^ @</Trans>
                    </Text>
                    <Text>
                      <Trans>
                        *Please do not set a password that is related to your
                        personal information such as your login ID, date of
                        birth, phone number, name, etc., or a simple character
                        string that can be easily guessed by a third party (e.g.
                        password). .s
                      </Trans>
                    </Text>
                    <Text>
                      <Trans>
                        You may not be able to receive the e-mail if you have
                        set reception refusal such as specified domain
                        reception. Please cancel the setting or proceed with the
                        procedure after setting it so that you can receive mail
                        from the following domain.
                      </Trans>
                    </Text>
                  </Box>
                  {error ? (
                    <Alert status="error">
                      <AlertIcon />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : null}
                  <Box maxWidth={300} w="100%">
                    <Button
                      type="submit"
                      variant="outline"
                      w="100%"
                      isLoading={isSubmitting}
                    >
                      <Trans>register</Trans>
                    </Button>
                  </Box>
                </Stack>
              </Form>
            )}
          </Formik>
          <Stack maxWidth={300} w="100%" align="center" pt="2em">
            <Text fontSize="sm">
              <Trans>For account holders </Trans>{" "}
            </Text>
            <Button
              variant="outline"
              w="100%"
              onClick={() => navigate("/signin")}
            >
              <Trans>Go to login screen</Trans>
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
