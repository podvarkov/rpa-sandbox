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
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useDisclosure,
  VStack,
  WrapItem,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { AxiosError } from "axios";
import { format } from "date-fns";
import { Field, FieldProps, Form, Formik } from "formik";
import React, { PropsWithChildren, useEffect, useState } from "react";
import { RiCheckFill } from "react-icons/ri";
import { useMutation, useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import type { Stripe } from "stripe";
import * as Yup from "yup";
import { api, Profile, SendInquiryParams, UpdatableProfile } from "../api";
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
const ProfileInfoFields: React.FC<{ readonlyUsername: boolean }> = ({
  readonlyUsername = false,
}) => {
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

      <HorizontalFormField
        title={t`Email`}
        required
        readonly={readonlyUsername}
      >
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

const getPlanName = (id?: string): string | undefined => {
  switch (id) {
    case "prod_N2Eg0uXNtzdLhZ":
      return t`Robotic A`;
    case "prod_N2EgnuL10iGJZH":
      return t`Robotic B`;
    case "prod_N2EfDiqK1ZKFYK":
      return t`Robotic C`;
    case "prod_N2EebSaRJn9p5d":
      return t`Premium`;
    default:
      return t`No subscription`;
  }
};
const SubscriptionInfo: React.FC<{
  subscription: Stripe.Subscription | undefined;
}> = ({ subscription }) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const customer = subscription && (subscription.customer as Stripe.Customer);
  const plan =
    subscription && (subscription as unknown as Stripe.SubscriptionItem).plan;

  return (
    <VStack
      spacing={4}
      alignItems="flex-start"
      p={4}
      my={2}
      border="1px"
      borderColor="borderColors.main"
    >
      <Heading size="sm" mb={2}>
        <Trans>Contract Information</Trans>
      </Heading>

      <HStack spacing={2} fontSize="14px">
        <Text>
          <Trans>User:</Trans>
        </Text>
        <Text>{customer?.email || session?.user.username}</Text>
      </HStack>

      <HStack fontSize="14px" spacing={2}>
        <Text>
          <Trans>Plan:</Trans>
        </Text>
        <Text>{getPlanName(plan?.product as string)}</Text>
      </HStack>

      {subscription ? (
        <>
          <HStack fontSize="14px" spacing={2}>
            <Text>
              <Trans>Started at:</Trans>
            </Text>
            <Text>
              {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
              {format(new Date(subscription.current_period_start * 1000), "Pp")}
            </Text>
          </HStack>

          <HStack fontSize="14px" spacing={2}>
            <Text>
              <Trans>Active till:</Trans>
            </Text>
            <Text>
              {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
              {format(new Date(subscription.current_period_end * 1000), "Pp")}
            </Text>
          </HStack>

          <HStack fontSize="14px" spacing={2}>
            <Text>
              <Trans>Status:</Trans>
            </Text>
            <Text>
              {subscription.status === "active"
                ? t`Active`
                : subscription.status === "trialing"
                ? t`Trial period`
                : t`Inactive`}
            </Text>
          </HStack>
        </>
      ) : null}

      {["active", "trialing"].includes(subscription?.status || "") ? (
        <Box w={"100%"}>
          <a href={`/payments/portal?token=${session?.jwt}`}>
            <Button
              borderRadius={20}
              boxShadow="xs"
              fontSize={12}
              my={4}
              width="100%"
              bg="bgColors.primary"
              color="white"
            >
              <Trans>Manage</Trans>
            </Button>
          </a>
        </Box>
      ) : (
        <Button
          borderRadius={20}
          boxShadow="xs"
          fontSize={12}
          my={4}
          width="100%"
          bg="bgColors.primary"
          color="white"
          onClick={() => navigate("/pricing")}
        >
          <Trans>View plans</Trans>
        </Button>
      )}
    </VStack>
  );
};

const ContactInfo: React.FC<{
  profile?: Profile;
  onContactFormOpen: () => void;
}> = ({ profile, onContactFormOpen }) => {
  return (
    <Box p={4} border="1px" borderColor="borderColors.main" minHeight="200px">
      <Heading size="sm">
        <Trans>In charge of your company</Trans>
      </Heading>

      <Text fontSize="16px" py={4}>
        {profile?.salesManager?.name}
      </Text>

      <VStack spacing={4} fontSize="14px" alignItems="flex-start">
        <Heading size="sm">
          <Trans>Inquiries about RPA</Trans>
        </Heading>

        <Text>
          <Trans>TEL: {profile?.salesManager?.phone}</Trans>
        </Text>

        <Text>
          <Trans>FAX: {profile?.salesManager?.fax}</Trans>
        </Text>

        <Text>
          <Trans>MAIL: {profile?.salesManager?.email}</Trans>
        </Text>
      </VStack>

      <Button
        borderRadius={20}
        boxShadow="xs"
        fontSize={12}
        my={4}
        onClick={onContactFormOpen}
        width="100%"
        bg="bgColors.primary"
        color="white"
        disabled={!profile}
      >
        <Trans>Contact us</Trans>
      </Button>
    </Box>
  );
};

export const ProfilePage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    data: profile,
    error: profileError,
    refetch,
  } = useQuery("profile", ({ signal }) => {
    return api.getProfile(signal);
  });
  const { data: subscription, error: subscriptionError } = useQuery(
    "subscription",
    () => api.getSubscriptionInfo()
  );
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
    if (profileError) {
      errorMessage(t`There was an error while loading`);
    }
  }, [profileError, subscriptionError]);

  const navigate = useNavigate();
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay bg="bgColors.modalBg" />
        <ModalContent>
          <ModalHeader fontSize="sm">
            <Trans>Inquiry</Trans>
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
                onSubmit={(values: SendInquiryParams, { setSubmitting }) => {
                  mutation
                    .mutateAsync(values)
                    .then(() => api.sendInquiryToManager(values))
                    .catch((e) => {
                      console.error(e);
                      errorMessage(t`Something goes wrong`);
                    })
                    .finally(() => {
                      setSubmitting(false);
                      onClose();
                    });
                }}
                validationSchema={Yup.object({
                  ...profileValidationSchema,
                  inquiry: Yup.string().required(),
                })}
              >
                <Form>
                  <Stack spacing="6">
                    <ProfileInfoFields readonlyUsername />
                    <HorizontalFormField title={t`Inquiry`} required>
                      <Field name="inquiry">
                        {({ field, meta }: FieldProps) => {
                          return (
                            <FormControl
                              isInvalid={!!(meta.touched && meta.error)}
                            >
                              <Textarea
                                placeholder={t`Inquiry`}
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
                      <Trans>Send</Trans>
                    </Button>
                  </Flex>
                </Form>
              </Formik>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
      <Grid templateColumns="repeat(5, 1fr)" gap={4} px={2}>
        <GridItem colSpan={4} h="10">
          <Box w="100%" maxWidth="600px" mx="auto">
            <SimpleGrid columns={{ base: 1, lg: 2 }} w="100%" gap={2}>
              <WrapItem
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
            </SimpleGrid>

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
                          <ProfileInfoFields readonlyUsername={false} />
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
            <ContactInfo onContactFormOpen={() => onOpen()} profile={profile} />
            <SubscriptionInfo subscription={subscription} />

            <Box p={4} border="1px" borderColor="borderColors.main">
              <Text fontSize="16px" mb={2}>
                <Trans>Report Results</Trans>
              </Text>
              <Text fontSize="14px">
                <Trans>Browse</Trans>
              </Text>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};
