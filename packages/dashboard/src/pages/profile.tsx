import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { AxiosError } from "axios";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { RiCheckFill } from "react-icons/ri";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { api, UpdatableProfile } from "../api";
import { useAuth } from "../components/auth-provider";
import { useToast } from "../components/use-toast";

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const profileValidationSchema = {
  surname: Yup.string().required(`お名前を入力してください`),
  name: Yup.string().required(`お名前を入力してください`),
  furiganaSurname: Yup.string().required(`フリガナを入力してください`),
  furiganaMay: Yup.string().required(`フリガナを入力してください`),
  username: Yup.string()
    .email()
    .required(`有効なメールアドレスを入力してください`),
  phone: Yup.string().matches(phoneRegExp),
};

const HorizontalFormField: React.FC<
  PropsWithChildren<{ required?: boolean; title: string; readonly?: boolean }>
> = ({ children, title, required, readonly }) => {
  return (
    <HStack
      alignItems="baseline"
      style={{
        pointerEvents: readonly ? "none" : "initial",
        color: readonly ? "gray" : "inherit",
      }}
    >
      <Text
        w="30%"
        _after={
          required
            ? {
                content: `"*"`,
                color: readonly ? "gray" : "red",
                fontSize: "1.2em",
                lineHeight: "1.2em",
              }
            : {}
        }
      >
        {title}
      </Text>

      <HStack w="70%" alignItems="baseline">
        {children}
      </HStack>
    </HStack>
  );
};
const ProfileInfoFields: React.FC = () => {
  return (
    <>
      <HorizontalFormField title={t`Name`} required>
        <Field name="surname">
          {({ field, meta }: FieldProps) => {
            return (
              <FormControl isInvalid={!!(meta.touched && meta.error)}>
                <Input placeholder={t`surname`} {...field} variant="default" />
                <FormErrorMessage>{meta.error}</FormErrorMessage>
              </FormControl>
            );
          }}
        </Field>

        <Field name="name">
          {({ field, meta }: FieldProps) => (
            <FormControl isInvalid={!!(meta.touched && meta.error)}>
              <Input placeholder={t`name`} {...field} variant="default" />
              <FormErrorMessage>{meta.error}</FormErrorMessage>
            </FormControl>
          )}
        </Field>
      </HorizontalFormField>

      <HorizontalFormField title="フリガナ" required>
        <Field name="furiganaSurname">
          {({ field, meta }: FieldProps) => {
            return (
              <FormControl isInvalid={!!(meta.touched && meta.error)}>
                <Input placeholder={`セイ`} {...field} variant="default" />
                <FormErrorMessage>{meta.error}</FormErrorMessage>
              </FormControl>
            );
          }}
        </Field>
        <Field name="furiganaMay">
          {({ field, meta }: FieldProps) => (
            <FormControl isInvalid={!!(meta.touched && meta.error)}>
              <Input placeholder={`メイ`} {...field} variant="default" />
              <FormErrorMessage>{meta.error}</FormErrorMessage>
            </FormControl>
          )}
        </Field>
      </HorizontalFormField>

      <HorizontalFormField title={t`Phone number`}>
        <Field name="phone">
          {({ field, meta }: FieldProps) => {
            return (
              <FormControl isInvalid={!!(meta.touched && meta.error)}>
                <Input {...field} variant="default" />
                <FormErrorMessage>{meta.error}</FormErrorMessage>
              </FormControl>
            );
          }}
        </Field>
      </HorizontalFormField>

      <HorizontalFormField title={t`Email`} required>
        <Field name="username">
          {({ field, meta }: FieldProps) => (
            <FormControl isInvalid={!!(meta.touched && meta.error)}>
              <Input
                placeholder={`入力例：coreus@example.com`}
                {...field}
                variant="default"
              />
              <FormErrorMessage>{meta.error}</FormErrorMessage>
              <FormHelperText>
                <Trans>Changing email will lead to sign out </Trans>
              </FormHelperText>
            </FormControl>
          )}
        </Field>
      </HorizontalFormField>
    </>
  );
};

export const ProfilePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    data: profile,
    error,
    refetch,
  } = useQuery("profile", ({ signal }) => {
    return api.getProfile(signal);
  });
  const { errorMessage, successMessage } = useToast();
  const { signout } = useAuth();

  const mutation = useMutation(
    (data: UpdatableProfile) => api.updateProfile(data),
    {
      onError: (e: AxiosError) => {
        errorMessage(
          e.response?.status
            ? t`User with such email already exists`
            : t`Can not update profile`
        );
      },
      onSuccess: () => {
        successMessage(t`Profile updated`);
        refetch();
      },
    }
  );

  useEffect(() => {
    if (error) {
      errorMessage(t`There was an error while loading`);
    }
  }, [error]);

  const navigate = useNavigate();
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="bgColors.modalBg" />
        <ModalContent>
          <ModalHeader fontSize="sm">
            <Trans>inquiry</Trans>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            {profile ? (
              <Formik
                initialValues={{
                  surname: profile.surname,
                  name: profile.name,
                  furiganaSurname: profile.furiganaSurname,
                  furiganaMay: profile.furiganaMay,
                  phone: profile.phone,
                  username: profile.username,
                  inquiry: "",
                }}
                onSubmit={(values: any, { setSubmitting, setValues }) => {
                  mutation
                    .mutateAsync(values)
                    .then((data) => {
                      setValues(data);
                    })
                    .then(() => api.SendInquiryToManager(values))
                    .finally(() => {
                      setSubmitting(false);
                    });
                }}
                validationSchema={Yup.object(profileValidationSchema)}
              >
                <Form>
                  <Stack spacing="6">
                    <ProfileInfoFields />
                    <HorizontalFormField title={t`inquiry`}>
                      <Field name="inquiry">
                        {({ field, meta }: FieldProps) => {
                          return (
                            <FormControl
                              isInvalid={!!(meta.touched && meta.error)}
                            >
                              <Textarea
                                placeholder={t`inquiry`}
                                {...field}
                                size="sm"
                              />
                              <FormErrorMessage>{meta.error}</FormErrorMessage>
                            </FormControl>
                          );
                        }}
                      </Field>
                    </HorizontalFormField>
                  </Stack>
                  <Flex justify="right" w="100%" mt="4">
                    <Button
                      variant="outline"
                      shadow="sm"
                      type="submit"
                      px={8}
                      borderRadius={20}
                    >
                      <Trans>Send&Save</Trans>
                    </Button>
                  </Flex>
                </Form>
              </Formik>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>
      <Grid templateColumns="repeat(5, 1fr)" gap={4} px={2}>
        <GridItem colSpan={4} h="10">
          <Box width="100%" maxWidth="600px" mx="auto">
            <Wrap w="100%">
              <WrapItem
                w={{ sm: "100%", lg: "48%" }}
                border="1px"
                borderColor="borderColors.main"
                p="16px"
                borderRadius={5}
                flexDirection="column"
              >
                <Heading as="h6" size="xs">
                  <Text>
                    <Trans>Profile registration</Trans>
                  </Text>
                </Heading>
                <RiCheckFill size={45} />
                <Button
                  onClick={() => setIsVisible(!isVisible)}
                  variant="brandPrimary"
                  size="xs"
                  pl={0}
                >
                  <Trans>Registration / Editing</Trans>
                </Button>
              </WrapItem>
              <WrapItem
                w={{ sm: "100%", lg: "48%" }}
                border="1px"
                borderColor="borderColors.main"
                p="16px"
                borderRadius={5}
                flexDirection="column"
              >
                <Heading as="h6" size="xs">
                  <Text>
                    <Trans>Store Information Registration</Trans>
                  </Text>
                </Heading>
                <RiCheckFill size={45} />
                <Button
                  variant="brandPrimary"
                  pl={0}
                  onClick={() => navigate("/mallinfo")}
                  size="xs"
                >
                  <Trans>Registration / Editing</Trans>
                </Button>
              </WrapItem>
            </Wrap>

            {isVisible && (
              <Box
                p={4}
                py={8}
                my={4}
                border="1px"
                borderColor="borderColors.main"
                borderRadius={5}
              >
                {profile ? (
                  <Formik
                    initialValues={{
                      surname: profile.surname,
                      name: profile.name,
                      furiganaSurname: profile.furiganaSurname,
                      furiganaMay: profile.furiganaMay,
                      phone: profile.phone,
                      username: profile.username,
                    }}
                    onSubmit={(values: UpdatableProfile, { setSubmitting }) => {
                      mutation
                        .mutateAsync(values)
                        .then((data) => {
                          if (data.username !== profile.username) {
                            signout();
                          }
                        })
                        .finally(() => {
                          setSubmitting(false);
                        });
                    }}
                    validationSchema={Yup.object(profileValidationSchema)}
                  >
                    {({ isSubmitting, dirty }) => (
                      <Form>
                        <Stack spacing="6">
                          <ProfileInfoFields />
                          <Button
                            type="submit"
                            variant="submitBtn"
                            isLoading={isSubmitting}
                            disabled={!dirty}
                          >
                            登録
                          </Button>
                        </Stack>
                      </Form>
                    )}
                  </Formik>
                ) : null}
              </Box>
            )}
          </Box>
        </GridItem>

        <GridItem width="100%" colSpan={1} h="10">
          <Box>
            <Box
              p={4}
              border="1px"
              borderColor="borderColors.main"
              minHeight="200px"
            >
              <Heading>
                <Text fontSize="18px">
                  <Trans>In charge of your company</Trans>
                </Text>
              </Heading>
              <Text fontSize="16px" py={4}>
                {profile?.salesManager?.name}
              </Text>
              <Box fontSize="12px">
                <Text>
                  <Trans>Inquiries about RPA</Trans>
                </Text>
                <Text>
                  <Trans>TEL: {profile?.salesManager?.phone}</Trans>
                </Text>
                <Text>
                  <Trans>FAX: {profile?.salesManager?.fax}</Trans>
                </Text>
                <Text>
                  <Trans>MAIL: {profile?.salesManager?.email}</Trans>
                </Text>
              </Box>

              <Button
                borderRadius={20}
                boxShadow="xs"
                fontSize={12}
                my={4}
                onClick={onOpen}
                width="100%"
                bg="bgColors.primary"
                color="white"
              >
                <Trans>Contact us</Trans>
              </Button>
            </Box>
            <Box p={4} my={2} border="1px" borderColor="borderColors.main">
              <Text fontSize="14px" mb={2}>
                <Trans>Contract Information</Trans>
              </Text>
              <Text fontSize="12px" color="textColors.main">
                <Trans>Dear 111</Trans>
              </Text>
              <Text fontSize="12px" color="textColors.main">
                <Trans>Free Trial Plan</Trans>
              </Text>
            </Box>
            <Box p={4} border="1px" borderColor="borderColors.main">
              <Text fontSize="16px" mb={2} color="textColors.main">
                <Trans>Report Results</Trans>
              </Text>
              <Text fontSize="14px" color="textColors.main">
                <Trans>Browse</Trans>
              </Text>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};
