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
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { AxiosError } from "axios";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useAuth } from "../components/auth-provider";

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
    <Box h="100vh" color="black" pt="5em">
      <Container bg="white" p="6">
        <Stack spacing="4" direction="column" maxWidth={400} align="center">
          <Center>
            <Heading size="lg" mb="2em">
              <Trans>Login</Trans>
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
                          type="password"
                          placeholder={t`Password`}
                          {...field}
                          variant="signUpInput"
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
                    variant="outline"
                    mt="2em"
                  >
                    <Trans>login</Trans>
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>

          <Text fontSize="sm" align="right">
            <Link to="/signup" as={RouterLink}>
              <Trans>Those who have not yet registered as a member</Trans>
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};
