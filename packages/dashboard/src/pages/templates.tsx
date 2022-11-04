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
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { api, WorkflowTemplate } from "../api";
import { useFetch } from "../components/use-fetch";
import { WorkflowForm } from "../components/workflow-form";

export const TemplatesPage: React.FC = () => {
  const toast = useToast();
  const { data: templates, error } = useFetch(api.getTemplates.bind(api), true);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate>();

  useEffect(() => {
    if (error) {
      toast({
        title: "There was an error while loading",
        status: "error",
        position: "top-right",
        duration: 1000,
      });
    }
  }, [error]);

  return templates && templates.length === 0 ? (
    <Center>
      <Heading size="md">No templates found</Heading>
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
                  New workflow
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalBody fontFamily="roboto">
              <WorkflowForm
                initialValues={{
                  name: selectedTemplate.name,
                  templateId: selectedTemplate._id,
                  description: "",
                  defaultArguments: (selectedTemplate.Parameters || [])
                    .filter(({ direction }) => direction === "in")
                    .reduce((acc, param) => ({ ...acc, [param.name]: "" }), {}),
                }}
                onSubmit={(values) => {
                  return api
                    .upsertWorkflow(values)
                    .then(() => {
                      toast({
                        title: "Workflow created",
                        status: "success",
                        position: "top-right",
                        duration: 1000,
                      });
                      setSelectedTemplate(undefined);
                    })
                    .catch((e) => {
                      console.error(e);
                      toast({
                        title: "Can not create workflow",
                        status: "error",
                        position: "top-right",
                        duration: 1000,
                      });
                    });
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}

      <Flex alignItems="baseline" flexWrap={"wrap"}>
        {templates?.map((t) => (
          <Box
            m={2}
            flexShrink={0}
            flexGrow={1}
            w={[null, null, "45%", "25%", "20%"]}
            maxW={[null, null, "45%", "25%", "25%"]}
            bg="white"
            key={t._id}
            boxShadow={"sm"}
            _hover={{ boxShadow: "md" }}
          >
            <HStack p={4}>
              <Avatar size={"sm"} src="/wf-icon.png" />
              <Heading fontFamily={"roboto"} size={"md"}>
                {t.name}
              </Heading>
            </HStack>
            <Divider />
            <Box p={4} fontFamily={"roboto"}>
              <Text mb={4}>{t.description || "No description "}</Text>
              {t.Parameters?.length ? (
                <UnorderedList>
                  {t?.Parameters?.filter(
                    ({ direction }) => direction === "in"
                  )?.map((param) => (
                    <ListItem key={param.name}>
                      {param.name} - {param.type}
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                <Text> No parameters</Text>
              )}
            </Box>
            <Box textAlign="right" px={4} pb={4}>
              <Button
                size="sm"
                variant="outline"
                rounded="sm"
                colorScheme="teal"
                onClick={() => {
                  setSelectedTemplate(t);
                }}
              >
                Use template
              </Button>
            </Box>
          </Box>
        ))}
      </Flex>
    </>
  );
};
