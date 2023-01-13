import {
  Avatar,
  Box,
  Center,
  Flex,
  Heading,
  HStack,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { api, WorkflowTemplate } from "../api";
import { useToast } from "../components/use-toast";
import { WorkflowForm, WorkflowFormValues } from "../components/workflow-form";

const TemplatePreview: React.FC<
  Pick<WorkflowTemplate, "name" | "humanReadableName" | "logoSrc"> & {
    onClick: () => void;
  }
> = ({ name, logoSrc, humanReadableName, onClick }) => {
  return (
    <HStack
      onClick={onClick}
      cursor="pointer"
      _hover={{
        bg: "gray.50",
      }}
      border="1px"
      borderColor="borderColors.main"
      borderRadius={10}
      alignItems="center"
      p={2}
      ml={25}
      mb={25}
      mr={0}
      spacing={2}
      w={["100%", "100%", "100%", "45%", "30%", "23%"]}
      maxW={["100%", "100%", "100%", "45%", "30%", "23%"]}
      bg="white"
      minW={0}
    >
      <Box flexShrink={0}>
        <Image
          objectFit="contain"
          boxSize={"4rem"}
          alt="logo"
          src={logoSrc || "/default-rpa-logo.png"}
        />
      </Box>
      <Text
        fontSize="lg"
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        flexGrow={1}
      >
        {humanReadableName || name}
      </Text>
    </HStack>
  );
};

export const TemplatesPage: React.FC = () => {
  const { errorMessage, successMessage } = useToast();
  const { error, data: templates } = useQuery("templates", ({ signal }) =>
    api.getTemplates(signal)
  );
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>();

  const mutation = useMutation(
    (workflow: WorkflowFormValues) => {
      return api.upsertWorkflow(workflow);
    },
    {
      onSuccess: () => {
        successMessage(t`Workflow created`);
        setSelectedTemplate(undefined);
      },
      onError: (e) => {
        console.error(e);
        errorMessage(t`Can not create workflow`);
      },
    }
  );

  useEffect(() => {
    if (error) {
      errorMessage(t`There was an error while loading`);
    }
  }, [error]);

  return templates && templates.length === 0 ? (
    <Center>
      <Heading size="md">
        <Trans>No templates found</Trans>
      </Heading>
    </Center>
  ) : (
    <>
      {selectedTemplate ? (
        <Modal
          size="lg"
          isOpen={!!selectedTemplate}
          onClose={() => setSelectedTemplate(undefined)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Avatar
                  size={"sm"}
                  src={selectedTemplate.logoSrc || "/default-rpa-logo.png"}
                />
                <Heading fontFamily={"roboto"} size={"md"}>
                  <Trans>New workflow</Trans>
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalBody fontFamily="roboto">
              <WorkflowForm
                templateParameters={selectedTemplate.Parameters}
                initialValues={{
                  name: selectedTemplate.name,
                  templateId: selectedTemplate._id,
                  description: "",
                  defaultArguments: (selectedTemplate.Parameters || [])
                    .filter(({ direction }) => direction === "in")
                    .reduce((acc, param) => ({ ...acc, [param.name]: "" }), {}),
                }}
                onSubmit={(values) => {
                  return mutation.mutateAsync(values);
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}

      <Flex mt={3} flexWrap="wrap" alignItems="baseline">
        {templates?.map((template) => (
          <TemplatePreview
            onClick={() => setSelectedTemplate(template)}
            key={template._id}
            name={template.name}
            humanReadableName={template.humanReadableName}
            logoSrc={template.logoSrc}
          />
        ))}
      </Flex>
    </>
  );
};
