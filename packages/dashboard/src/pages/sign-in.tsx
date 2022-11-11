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
import { useAuth } from "../components/auth-provider";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import { AxiosError } from "axios";
import { t, Trans } from "@lingui/macro";

export const SigninPage: React.FC = () => {
  const { session, signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (session) navigate(from, { replace: true });
  }, [session, from]);

  return (
    <Box bg="gray.50" h="100vh" color="black" pt="12em">
      <Container bg="white" boxShadow="sm" p="6">
        <Stack spacing="4" direction="column">
          <Center>
            <Heading size="lg">
              <Trans>Sign in</Trans>
            </Heading>
          </Center>

          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={(values, actions) => {
              signin(values)
                .catch((e: AxiosError) => {
                  console.error(e);
                  setError(t`Wrong password or username`);
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
                    <Trans>Sign in</Trans>
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>

          <Text fontSize="sm" align="right">
            <Trans>Not a member? </Trans>{" "}
            <Link color="teal.500" to="/signup" as={RouterLink}>
              <Trans>Sign up</Trans>
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};
