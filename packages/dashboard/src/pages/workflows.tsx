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
import { api, Workflow, WorkflowTemplate } from "../api";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { WorkflowForm } from "../components/workflow-form";
import { useNavigate } from "react-router-dom";
import { t, Trans } from "@lingui/macro";
import { useProgress } from "../components/progress-provider";

export const WorkflowsPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    data: workflows,
    error,
    fetch,
  } = useFetch(api.getWorkflows.bind(api), true);
  const [deleteIntent, setDeleteIntent] = useState<string>();
  const [editIntent, setEditIntent] = useState<
    Workflow & { template: WorkflowTemplate }
  >();
  const cancelRef = useRef(null);
  const { setVisible } = useProgress();

  useEffect(() => {
    if (error) {
      toast({
        title: t`There was an error while loading`,
        status: "error",
        position: "top-right",
        duration: 1000,
      });
    }
  }, [error]);

  return workflows && workflows.length === 0 ? (
    <Center>
      <Heading size="sm">
        <Trans>Your workflows will be listed here</Trans>
      </Heading>
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
                  <Trans>New workflow</Trans>
                </Heading>
              </HStack>
            </ModalHeader>
            <ModalBody fontFamily="roboto">
              <WorkflowForm
                templateParameters={editIntent.template.Parameters || []}
                initialValues={editIntent}
                onSubmit={(values) => {
                  return api
                    .upsertWorkflow(values)
                    .then(() => {
                      toast({
                        title: t`Workflow updated`,
                        status: "success",
                        position: "top-right",
                        duration: 1000,
                      });
                      setEditIntent(undefined);
                      void fetch();
                    })
                    .catch((e) => {
                      console.error(e);
                      toast({
                        title: t`Can not edit workflow`,
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
              <Trans>Delete workflow</Trans>
            </AlertDialogHeader>

            <AlertDialogBody>
              <Trans>
                Are you sure? You can not undo this action afterwards.
              </Trans>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setDeleteIntent(undefined);
                }}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={() => {
                  if (deleteIntent) {
                    api
                      .deleteWorkflow(deleteIntent)
                      .then(() => {
                        toast({
                          title: t`Workflow deleted`,
                          status: "success",
                          position: "top-right",
                          duration: 1000,
                        });
                        setDeleteIntent(undefined);
                        void fetch();
                      })
                      .catch((e) => {
                        console.error(e);
                        toast({
                          title: t`Can not delete workflow`,
                          status: "error",
                          position: "top-right",
                          duration: 1000,
                        });
                      });
                  }
                }}
              >
                <Trans>Delete</Trans>
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
                aria-label={
                  /* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */
                  "Edit"
                }
                onClick={() => {
                  setVisible(true);
                  api
                    .getWorkflow(wf._id)
                    .then((data) => setEditIntent(data))
                    .catch((e) => {
                      console.error(e);
                      toast({
                        title: t`There was an error while loading`,
                        status: "error",
                        position: "top-right",
                        duration: 1000,
                      });
                    })
                    .finally(() => setVisible(false));
                }}
                icon={<EditIcon />}
              />
              <IconButton
                size="xs"
                variant="outline"
                aria-label={
                  /* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */
                  "Delete"
                }
                onClick={() => setDeleteIntent(wf._id)}
                icon={<DeleteIcon />}
              />
            </HStack>
            <Divider />
            <Box p={4} fontFamily={"roboto"}>
              <Text mb={4}>{wf.description || t`No description`}</Text>
            </Box>
            <Box textAlign="right" px={4} pb={4}>
              <Button
                size="sm"
                variant="outline"
                rounded="sm"
                colorScheme="teal"
                onClick={() => {
                  navigate(`/execute/${wf._id}`);
                }}
              >
                <Trans>Run workflow</Trans>
              </Button>
            </Box>
          </Box>
        ))}
      </Flex>
    </>
  );
};
