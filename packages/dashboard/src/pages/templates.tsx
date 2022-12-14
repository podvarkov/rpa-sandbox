import {
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  ListItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { t, Trans } from "@lingui/macro";
import { useMutation, useQuery } from "react-query";
import { api, WorkflowTemplate } from "../api";
import { useToast } from "../components/use-toast";
import { WorkflowForm, WorkflowFormValues } from "../components/workflow-form";

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
                <Avatar size={"sm"} src="/wf-icon.png" />
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
                  expiration: 60000,
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

      <Flex alignItems="baseline" flexWrap={"wrap"}>
        {templates?.map((template) => (
          <Box
            m={2}
            flexShrink={0}
            flexGrow={0}
            w={[null, null, "47%", "30%", "24%"]}
            maxW={[null, null, "47%", "30%", "24%"]}
            bg="white"
            key={template._id}
            boxShadow={"sm"}
            _hover={{ boxShadow: "md" }}
          >
            <HStack p={4}>
              <Avatar size={"sm"} src="/wf-icon.png" />
              <Heading fontFamily={"roboto"} size={"md"}>
                {template.name}
              </Heading>
            </HStack>
            <Divider />
            <Box p={4} fontFamily={"roboto"}>
              <Text mb={4}>{template.description || t`No description `}</Text>
              {template.Parameters?.length ? (
                <UnorderedList>
                  {template?.Parameters?.filter(
                    ({ direction }) => direction === "in"
                  )?.map((param) => (
                    <ListItem key={param.name}>
                      {param.name} - {param.type}
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                <Text>
                  <Trans>No parameters</Trans>
                </Text>
              )}
            </Box>
            <Box textAlign="right" px={4} pb={4}>
              <Button
                size="sm"
                variant="outline"
                rounded="sm"
                colorScheme="teal"
                onClick={() => {
                  setSelectedTemplate(template);
                }}
              >
                <Trans>Use template</Trans>
              </Button>
            </Box>
          </Box>
        ))}
      </Flex>
    </>
  );
};
