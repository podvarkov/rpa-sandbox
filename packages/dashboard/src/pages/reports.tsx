import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
import {
  Box,
  HStack,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { format } from "date-fns";
import { DeleteIcon, DownloadIcon } from "@chakra-ui/icons";
import { api } from "../api";
import { useAuth } from "../components/auth-provider";
import { ConfirmDialog } from "../components/confirm-dialog";
import { useToast } from "../components/use-toast";
import { Pagination, usePagination } from "../components/table";

// todo pagination here and scheduler
export const ReportsPage: React.FC = () => {
  const [total, setTotal] = useState(0);
  const { top, skip, prev, next } = usePagination({
    total,
  });

  const {
    error,
    data: reports,
    refetch,
  } = useQuery(
    ["reports", { top, skip }],
    ({ signal }) => api.getReports(signal, { top, skip }),
    { keepPreviousData: true }
  );

  useEffect(() => {
    setTotal(reports?.length || 0);
  }, [reports]);

  const { errorMessage, successMessage } = useToast();
  const auth = useAuth();

  const [deleteIntent, setDeleteIntent] = useState<string>();
  const mutation = useMutation(
    async () => {
      return deleteIntent ? api.deleteReport(deleteIntent) : undefined;
    },
    {
      onSuccess: () => {
        successMessage(t`Report deleted`);
        return refetch().then(() => setDeleteIntent(undefined));
      },
      onError: (e) => {
        console.error(e);
        errorMessage(t`Can not delete report`);
      },
    }
  );

  useEffect(() => {
    if (error) {
      errorMessage(t`There was an error while loading`);
      console.error(error);
    }
  }, [error]);

  return (
    <Box bg="white" px={6}>
      <ConfirmDialog
        isOpen={!!deleteIntent}
        loading={mutation.isLoading}
        onClose={() => setDeleteIntent(undefined)}
        onOk={() => mutation.mutate()}
        headerText={t`Delete report`}
      />

      <TableContainer bg="gray.50">
        <Table size="md">
          <Thead bg="#33B4DE">
            <Tr>
              <Th py={4} textColor="whitesmoke">
                <Trans>Name</Trans>
              </Th>
              <Th py={4} textColor="whitesmoke">
                <Trans>Created</Trans>
              </Th>
              <Th />
            </Tr>
          </Thead>
          <Tbody>
            {reports && reports.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <Trans>No data available</Trans>
                </Td>
              </Tr>
            ) : (
              reports?.map((file) => {
                return (
                  <Tr key={file._id}>
                    <Td>
                      <Trans>{file.metadata.name}</Trans>
                    </Td>
                    {/* eslint-disable-next-line string-to-lingui/missing-lingui-transformation */}
                    <Td>{format(new Date(file.uploadDate), "Pp")}</Td>
                    <Td>
                      <HStack spacing={2} justifyContent="end" w="100%">
                        <a
                          href={`/api/reports/download/${file._id}?token=${auth.session?.jwt}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <DownloadIcon
                            cursor="pointer"
                            fontSize="sm"
                            color="gray.500"
                            aria-label="download"
                          />
                        </a>

                        <IconButton
                          variant="ghost"
                          color="gray.500"
                          size="sm"
                          aria-label="delete"
                          icon={<DeleteIcon />}
                          onClick={() => setDeleteIntent(file._id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </TableContainer>
      <Pagination top={top} skip={skip} total={total} next={next} prev={prev} />
    </Box>
  );
};
