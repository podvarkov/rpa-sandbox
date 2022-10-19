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
            <Heading size="lg">Sign up</Heading>
          </Center>

          <Formik
            initialValues={{
              username: "",
              password: "",
              passwordConfirmation: "",
            }}
            onSubmit={(values, actions) => {
              signup(values)
                .then(() => {
                  actions.setSubmitting(false);
                })
                .catch((e: AxiosError) => {
                  console.error(e);
                  setError(
                    e.response?.status === 409
                      ? `User ${values.username} already exists`
                      : "Something goes wrong"
                  );
                });
            }}
            validationSchema={Yup.object({
              username: Yup.string()
                .email("Must be a valid email")
                .required("This field is required"),
              password: Yup.string().required("This field is required"),
              passwordConfirmation: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must match")
                .required("This field is required"),
            })}
          >
            <Form>
              <Stack spacing="4">
                <Field name="username">
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <FormLabel>Email address</FormLabel>
                        <Input placeholder="Email" {...field} />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="password">
                  {({ field, meta }: FieldProps) => (
                    <FormControl isInvalid={!!(meta.touched && meta.error)}>
                      <FormLabel>Password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                      <FormErrorMessage>{meta.error}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
                <Field name="passwordConfirmation">
                  {({ field, meta }: FieldProps) => (
                    <FormControl isInvalid={!!(meta.touched && meta.error)}>
                      <FormLabel>Confirm password</FormLabel>
                      <Input
                        type="password"
                        placeholder="Confirm password"
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
                <Button type="submit" colorScheme="teal">
                  Create account
                </Button>
              </Stack>
            </Form>
          </Formik>

          <Text fontSize="sm" align="right">
            Have an account?{" "}
            <Link color="teal.500" to="/signin" as={RouterLink}>
              Sign in
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};
