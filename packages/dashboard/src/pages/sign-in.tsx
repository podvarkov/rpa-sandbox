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
            <Heading size="lg">Sign in</Heading>
          </Center>

          <Formik
            initialValues={{ username: "", password: "" }}
            onSubmit={(values, actions) => {
              signin(values)
                .then(() => {
                  actions.setSubmitting(false);
                })
                .catch((e: AxiosError) => {
                  console.error(e);
                  setError("Wrong password or username");
                });
            }}
            validationSchema={Yup.object({
              username: Yup.string()
                .email("Must be a valid email")
                .required("This field is required"),
              password: Yup.string().required("This field is required"),
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
                {error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <Button type="submit" colorScheme="teal">
                  Sign in
                </Button>
              </Stack>
            </Form>
          </Formik>

          <Text fontSize="sm" align="right">
            Not a member?{" "}
            <Link color="teal.500" to="/signup" as={RouterLink}>
              Sign up
            </Link>
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};
