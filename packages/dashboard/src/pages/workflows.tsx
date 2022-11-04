import React, { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Avatar,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useFetch } from "../components/use-fetch";
import { api, Workflow } from "../api";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { WorkflowForm } from "../components/workflow-form";

export const WorkflowsPage: React.FC = () => {
  const toast = useToast();
  const {
    data: workflows,
    error,
    fetch,
  } = useFetch(api.getWorkflows.bind(api), true);
  const [deleteIntent, setDeleteIntent] = useState<string>();
  const [editIntent, setEditIntent] = useState<Workflow>();
  const cancelRef = useRef(null);

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

  return workflows && workflows.length === 0 ? (
    <Center>
      <Heading size="sm">Your workflows will be listed here</Heading>
    </Center>
  ) : (
    <>
      {editIntent ? (
        <Modal
          size="lg"
          isOpen={!!editIntent}
          onClose={() => setEditIntent(undefined)}
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
                initialValues={editIntent}
                onSubmit={(values) => {
                  return api
                    .upsertWorkflow(values)
                    .then(() => {
                      toast({
                        title: "Workflow edited",
                        status: "success",
                        position: "top-right",
                        duration: 1000,
                      });
                      setEditIntent(undefined);
                      fetch();
                    })
                    .catch((e) => {
                      console.error(e);
                      toast({
                        title: "Can not edit workflow",
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

      <AlertDialog
        isOpen={!!deleteIntent}
        leastDestructiveRef={cancelRef}
        onClose={() => setDeleteIntent(undefined)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete workflow
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can not undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setDeleteIntent(undefined);
                }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => {
                  api
                    .deleteWorkflow(deleteIntent!)
                    .then(() => {
                      toast({
                        title: "Workflow deleted",
                        status: "success",
                        position: "top-right",
                        duration: 1000,
                      });
                      fetch();
                      setDeleteIntent(undefined);
                    })
                    .catch((e) => {
                      console.error(e);
                      toast({
                        title: "Can not delete workflow",
                        status: "error",
                        position: "top-right",
                        duration: 1000,
                      });
                    });
                }}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Flex alignItems="baseline" flexWrap={"wrap"}>
        {workflows?.map((wf) => (
          <Box
            m={2}
            flexShrink={0}
            flexGrow={1}
            w={[null, null, "45%", "25%", "20%"]}
            maxW={[null, null, "45%", "25%", "25%"]}
            bg="white"
            key={wf._id}
            boxShadow={"sm"}
            _hover={{ boxShadow: "md" }}
          >
            <HStack p={4}>
              <Avatar size={"sm"} src="/wf-icon.png" />
              <Heading flex={1} fontFamily={"roboto"} size={"md"}>
                {wf.name}
              </Heading>
              <IconButton
                size="xs"
                variant="outline"
                aria-label="Edit"
                onClick={() => {
                  setEditIntent(wf);
                }}
                icon={<EditIcon />}
              />
              <IconButton
                size="xs"
                variant="outline"
                aria-label="Delete"
                onClick={() => setDeleteIntent(wf._id)}
                icon={<DeleteIcon />}
              />
            </HStack>
            <Divider />
            <Box p={4} fontFamily={"roboto"}>
              <Text mb={4}>{wf.description || "No description "}</Text>
            </Box>
            <Box textAlign="right" px={4} pb={4}>
              <Button
                size="sm"
                variant="outline"
                rounded="sm"
                colorScheme="teal"
                onClick={() => {
                  // setSelectedTemplate(t);
                }}
              >
                Run workflow
              </Button>
            </Box>
          </Box>
        ))}
      </Flex>
    </>
  );
};
