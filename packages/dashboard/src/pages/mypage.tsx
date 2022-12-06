import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  Grid,
  GridItem,
  Heading,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import React, { useState } from "react";
import { FaAsterisk } from "react-icons/fa";
import { RiCheckFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

export const MyPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState<Boolean>(false);
  const [message, setMessage] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navigate = useNavigate();
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg="bgColors.modalBg" />
        <ModalContent>
          <ModalHeader fontSize="sm">お問い合わせ</ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody py={6}>
            <Heading size="md">
              <Text>お問い合わせ内容</Text>
            </Heading>
            <Box mt={2}>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                size="sm"
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" shadow="sm" px={8} borderRadius={20}>
              送信
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Grid templateColumns="repeat(5, 1fr)" gap={4} px={2}>
        <GridItem colSpan={4} h="10">
          <Center>
            <Box width="100%" maxWidth="600px">
              <HStack spacing="16px" color="textColors.main">
                <Box
                  width="50%"
                  border="1px"
                  borderColor="borderColors.main"
                  p="16px"
                  borderRadius={5}
                >
                  <Heading as="h6" size="xs">
                    <Text>プロフィール登録</Text>
                  </Heading>
                  <RiCheckFill size={45} />
                  <Button
                    onClick={() => setIsVisible(!isVisible)}
                    variant="brandPrimary"
                    size="xs"
                    pl={0}
                  >
                    登録・編集
                  </Button>
                </Box>
                <Box
                  width="50%"
                  border="1px"
                  borderColor="borderColors.main"
                  p="16px"
                  borderRadius={5}
                >
                  <Heading as="h6" size="xs">
                    <Text>店舗情報登録</Text>
                  </Heading>
                  <RiCheckFill size={45} />
                  <Button
                    variant="brandPrimary"
                    pl={0}
                    onClick={() => navigate("/mallinfo")}
                    size="xs"
                  >
                    登録・編集
                  </Button>
                </Box>
              </HStack>

              {isVisible && (
                <Box
                  p={4}
                  py={8}
                  my={4}
                  border="1px"
                  borderColor="borderColors.main"
                  borderRadius={5}
                >
                  <MyPageInput />
                </Box>
              )}
            </Box>
          </Center>
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
                <Text fontSize="18px">御社の担当</Text>
              </Heading>
              <Text fontSize="16px" py={4}>
                {"salesManager " + Math.floor(Math.random() * 10)}
              </Text>
              <Box fontSize="12px">
                <Text>RPAに関するお問い合わせ</Text>
                <Text>TEL:00-0000-0000</Text>
                <Text>FAX:00-0000-0000</Text>
                <Text> MAIL:00000@00.com</Text>
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
                お問い合わせはこちら
              </Button>
            </Box>
            <Box p={4} my={2} border="1px" borderColor="borderColors.main">
              <Text fontSize="14px" mb={2}>
                ご契約情報
              </Text>
              <Text fontSize="12px" color="textColors.main">
                111様
              </Text>
              <Text fontSize="12px" color="textColors.main">
                お試し無料プラン
              </Text>
            </Box>
            <Box p={4} border="1px" borderColor="borderColors.main">
              <Text fontSize="16px" mb={2} color="textColors.main">
                レポート結果
              </Text>
              <Text fontSize="14px" color="textColors.main">
                閲覧
              </Text>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </>
  );
};

interface Values {
  surname: string;
  name: string;
  furigana_surname: string;
  furigana_may: string;
  company_name: string;
  email: string;
}

const MyPageInput: React.FC = () => {
  return (
    <Formik
      initialValues={{
        surname: "",
        name: "",
        furigana_surname: "",
        furigana_may: "",
        company_name: "",
        email: "",
      }}
      onSubmit={(values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(true);
        }, 500);
      }}
      validationSchema={Yup.object({
        surname: Yup.string().required(`お名前を入力してください`),
        name: Yup.string().required(`お名前を入力してください`),
        furigana_surname: Yup.string().required(`フリガナを入力してください`),
        furigana_may: Yup.string().required(`フリガナを入力してください`),
        company_name: Yup.string().required(`会社名を入力してください`),
        email: Yup.string().required(`有効なメールアドレスを入力してください`),
      })}
    >
      {({ isSubmitting }) => (
        <Form>
          <Stack spacing="25px">
            <HStack>
              <Flex w="30%">
                <Text>お名前</Text>
                <FaAsterisk size={10} color="red" />
              </Flex>
              <Flex w="70%" gap={2}>
                <Field name="surname">
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <Input
                          placeholder={`姓`}
                          {...field}
                          variant="mypage_input"
                        />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="name">
                  {({ field, meta }: FieldProps) => (
                    <FormControl isInvalid={!!(meta.touched && meta.error)}>
                      <Input
                        placeholder={`名`}
                        {...field}
                        variant="mypage_input"
                      />
                      <FormErrorMessage>{meta.error}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Flex>
            </HStack>
            <HStack>
              <Flex w="30%">
                <Text>フリガナ</Text>
                <FaAsterisk size={10} color="red" />
              </Flex>
              <Flex w="70%" gap={2}>
                <Field name="furigana_surname">
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <Input
                          placeholder={`セイ`}
                          {...field}
                          variant="mypage_input"
                        />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
                <Field name="furigana_may">
                  {({ field, meta }: FieldProps) => (
                    <FormControl isInvalid={!!(meta.touched && meta.error)}>
                      <Input
                        placeholder={`メイ`}
                        {...field}
                        variant="mypage_input"
                      />
                      <FormErrorMessage>{meta.error}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Flex>
            </HStack>
            <HStack>
              <Flex w="30%">
                <Text>会社名</Text>
                <FaAsterisk size={10} color="red" />
              </Flex>
              <Flex w="70%">
                <Field name="company_name">
                  {({ field, meta }: FieldProps) => {
                    return (
                      <FormControl isInvalid={!!(meta.touched && meta.error)}>
                        <Input {...field} variant="mypage_input" />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    );
                  }}
                </Field>
              </Flex>
            </HStack>
            <HStack>
              <Flex w="30%">
                <Text>メールアドレス</Text>
                <FaAsterisk size={10} color="red" />
              </Flex>
              <Flex w="70%">
                <Field name="email">
                  {({ field, meta }: FieldProps) => (
                    <FormControl isInvalid={!!(meta.touched && meta.error)}>
                      <Input
                        placeholder={`入力例：coreus@example.com`}
                        {...field}
                        variant="mypage_input"
                      />
                      <FormErrorMessage>{meta.error}</FormErrorMessage>
                    </FormControl>
                  )}
                </Field>
              </Flex>
            </HStack>

            <Button type="submit" variant="submitBtn" isLoading={isSubmitting}>
              登録
            </Button>
          </Stack>
        </Form>
      )}
    </Formik>
  );
};
