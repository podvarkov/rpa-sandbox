import {
  Box,
  IconButton,
  Select,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useQuery } from "react-query";
import { api } from "../api";
import { defineMessage, t, Trans } from "@lingui/macro";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLingui } from "@lingui/react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";

/* eslint-disable string-to-lingui/missing-lingui-transformation */
export const executionStatuses = {
  invokefailed: defineMessage({ message: "Invoke failed" }),
  invokecompleted: defineMessage({ message: "Completed" }),
  error: defineMessage({ message: "Error" }),
  timeout: defineMessage({ message: "Timeout" }),
};
/* eslint-enable string-to-lingui/missing-lingui-transformation */

const TSorter: React.FC<{
  orderBy: string;
  direction: string;
  column: string;
  title: string;
  onChange: (key: string, direction: string) => void;
}> = ({ orderBy, direction, column, onChange, title }) => {
  return (
    <Th
      textColor="whitesmoke"
      py={4}
      cursor="pointer"
      onClick={() => {
        onChange(
          column,
          orderBy === column ? (direction === "asc" ? "desc" : "asc") : "asc"
        );
      }}
    >
      <span>{title}</span>
      {orderBy === column ? (
        direction === "asc" ? (
          <ChevronDownIcon />
        ) : (
          <ChevronUpIcon />
        )
      ) : null}
    </Th>
  );
};

export const ExecutionsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const top = Number.parseInt(params.get("top") || "20");
  const skip = Number.parseInt(params.get("skip") || "0");
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
  }, [top, skip, params.get("top"), params.get("skip")]);

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
    { keepPreviousData: true }
  );
  const { data: workflows, error: workflowsError } = useQuery(
    "workflows",
    ({ signal }) => api.getWorkflows(signal)
  );

  const toast = useToast();

  const setOrder = (column: string, sortDirection: string) => {
    setParams((state) => {
      state.set("orderBy", column);
      state.set("direction", sortDirection);
      return state;
    });
  };

  useEffect(() => {
    if (executionsError || workflowsError) {
      toast({
        title: t`There was an error while loading`,
        status: "error",
        position: "top-right",
        duration: 1000,
      });
      console.error(executionsError, workflowsError);
    }
  }, [executionsError, workflowsError]);

  return (
    <>
      <Box bg="white" mb={2} px={6} py={2}>
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

      <TableContainer bg="white">
        <Table size="md">
          <Thead bg="#384c5b">
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
            {(executions || []).map((execution) => {
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
                  <Td>{dayjs(execution.startedAt).format("ll HH:mm:ss")}</Td>
                  <Td>{dayjs(execution.finishedAt).format("ll HH:mm:ss")}</Td>
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
            })}
          </Tbody>
        </Table>
      </TableContainer>
      <Stack bg="white" p={2} w="100%" direction="row" justifyContent="end">
        <IconButton
          variant="ghost"
          aria-label="prev"
          disabled={skip - top < 0}
          onClick={() => {
            setParams((state) => {
              state.set("skip", (skip - top).toString());
              return state;
            });
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          variant="ghost"
          aria-label="next"
          disabled={
            !executions || executions.length < top || executions.length === 0
          }
          onClick={() => {
            setParams((state) => {
              state.set("skip", (skip + top).toString());
              return state;
            });
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>
    </>
  );
};
