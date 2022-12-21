import {
  Box,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { defineMessage, t, Trans } from "@lingui/macro";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLingui } from "@lingui/react";
import { format } from "date-fns";
import { api } from "../api";
import { useToast } from "../components/use-toast";
import { Pagination, TSorter, usePagination } from "../components/table";

/* eslint-disable string-to-lingui/missing-lingui-transformation */
export const executionStatuses = {
  invokecompleted: defineMessage({ message: "Completed" }),
  error: defineMessage({ message: "Error" }),
  timeout: defineMessage({ message: "Timeout" }),
  queued: defineMessage({ message: "Queued" }),
  invokesuccess: defineMessage({ message: "In progress" }),
};
/* eslint-enable string-to-lingui/missing-lingui-transformation */

export const ExecutionsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [total, setTotal] = useState(0);
  const { top, skip, next, prev } = usePagination({
    total,
  });
  const workflowId = params.get("workflowId");
  const status = params.get("status");
  const orderBy = params.get("orderBy") || "startedAt";
  const direction = params.get("direction") || "desc";

  const navigate = useNavigate();

  useEffect(() => {
    setParams((state) => {
      state.set("top", top.toString());
      state.set("skip", skip.toString());
      state.set("direction", direction);
      state.set("orderBy", orderBy);
      return state;
    });
  }, [top, skip]);

  const { i18n } = useLingui();
  const { data: executions, error: executionsError } = useQuery(
    ["executions", { top, skip, status, workflowId, orderBy, direction }],
    ({ signal }) =>
      api.getExecutions(signal, {
        top,
        skip,
        workflowId,
        status,
        orderBy,
        direction,
      }),
    {
      keepPreviousData: true,
      refetchInterval: (data) => {
        const needRefetch = (data || []).find((execution) =>
          ["queued", "invoke", "invokesuccess", "invokeidle"].includes(
            execution.status
          )
        );
        return needRefetch ? 5000 : 0;
      },
    }
  );
  const { data: workflows, error: workflowsError } = useQuery(
    "workflows",
    ({ signal }) => api.getWorkflows(signal)
  );

  const { errorMessage } = useToast();

  const setOrder = (column: string, sortDirection: string) => {
    setParams((state) => {
      state.set("orderBy", column);
      state.set("direction", sortDirection);
      return state;
    });
  };

  useEffect(() => {
    if (executionsError || workflowsError) {
      errorMessage(t`There was an error while loading`);
      console.error(executionsError, workflowsError);
    }
  }, [executionsError, workflowsError]);

  useEffect(() => {
    setTotal(executions?.length || 0);
  }, [executions]);

  return (
    <Box px={6}>
      <Box bg="white" mb={2} py={2}>
        <Stack
          w={["100%", "100%", "50%", "100%", "30%"]}
          direction="row"
          alignItems="center"
          spacing={4}
        >
          <div>
            <Trans>Filters:</Trans>
          </div>
          <Select
            size="sm"
            value={workflowId ?? "null"}
            onChange={(e) => {
              setParams((state) => {
                if (skip > 0) state.delete("skip");

                if (e.target.value !== "null") {
                  state.set("workflowId", e.target.value);
                } else {
                  state.delete("workflowId");
                }

                return state;
              });
            }}
          >
            <option value={"null"}>
              <Trans>All workflows</Trans>
            </option>
            {(workflows || []).map((wf) => (
              <option key={wf._id} value={wf._id}>
                {wf.name}
              </option>
            ))}
          </Select>

          <Select
            size="sm"
            value={status ?? "null"}
            onChange={(e) => {
              setParams((state) => {
                if (skip > 0) state.delete("skip");

                if (e.target.value !== "null") {
                  state.set("status", e.target.value);
                } else {
                  state.delete("status");
                }

                return state;
              });
            }}
          >
            <option value="null">
              <Trans>Any status</Trans>
            </option>
            {Object.entries(executionStatuses).map(([value, statusMessage]) => (
              <option key={value} value={value}>
                {i18n._(statusMessage)}
              </option>
            ))}
          </Select>
        </Stack>
      </Box>

      <TableContainer bg="gray.50">
        <Table size="md">
          <Thead bg="#33B4DE">
            <Tr>
              <TSorter
                orderBy={orderBy}
                direction={direction}
                column={"workflowId"}
                title={t`Workflow`}
                onChange={setOrder}
              />
              <TSorter
                orderBy={orderBy}
                direction={direction}
                column={"startedAt"}
                title={t`Started`}
                onChange={setOrder}
              />
              <TSorter
                orderBy={orderBy}
                direction={direction}
                column={"finishedAt"}
                title={t`Finished`}
                onChange={setOrder}
              />
              <TSorter
                orderBy={orderBy}
                direction={direction}
                column={"status"}
                title={t`Status`}
                onChange={setOrder}
              />
            </Tr>
          </Thead>
          <Tbody>
            {executions && executions.length === 0 ? (
              <Tr>
                <Td colSpan={4} textAlign="center">
                  <Trans>No data available</Trans>
                </Td>
              </Tr>
            ) : (
              executions?.map((execution) => {
                return (
                  <Tr
                    key={execution._id}
                    _hover={{
                      bg: "var(--chakra-colors-chakra-border-color)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      navigate(execution._id);
                    }}
                  >
                    <Td>
                      {(workflows || []).find(
                        (workflow) => workflow._id === execution.workflowId
                      )?.name || execution.workflowId}
                    </Td>
                    <Td>
                      {execution.startedAt
                        ? // eslint-disable-next-line string-to-lingui/missing-lingui-transformation
                          format(new Date(execution.startedAt), "Pp")
                        : null}
                    </Td>
                    <Td>
                      {execution.finishedAt
                        ? // eslint-disable-next-line string-to-lingui/missing-lingui-transformation
                          format(new Date(execution.finishedAt), "Pp")
                        : null}
                    </Td>
                    <Td cursor={"default"}>
                      <Tooltip label={execution.error}>
                        {i18n._(
                          executionStatuses[
                            execution.status as keyof typeof executionStatuses
                          ]
                        )}
                      </Tooltip>
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
