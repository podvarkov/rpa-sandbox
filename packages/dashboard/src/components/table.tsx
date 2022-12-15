import React, { useCallback, useEffect, useState } from "react";
import { IconButton, Stack, Th } from "@chakra-ui/react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import { useSearchParams } from "react-router-dom";

export const TSorter: React.FC<{
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
type PaginationProps = {
  top?: number;
  skip?: number;
  total: number;
};
type PaginationHookResult = {
  top: number;
  skip: number;
  next: () => void;
  prev: () => void;
};

export function usePagination(props: PaginationProps): PaginationHookResult {
  const [params, setParams] = useSearchParams();
  const [top, setTop] = useState(
    Number.parseInt(params.get("top") ?? (props.top?.toString() || "50"))
  );
  const [skip, setSkip] = useState(
    Number.parseInt(params.get("skip") ?? (props.skip?.toString() || "0"))
  );

  useEffect(() => {
    if (!params.get("top")) {
      setTop(props.top || 50);
    }

    if (!params.get("skip")) {
      setSkip(props.skip || 0);
    }
  }, [skip, top, params]);

  useEffect(() => {
    setParams((state) => {
      state.set("skip", skip.toString());
      state.set("top", top.toString());
      return state;
    });
  }, [top, skip]);

  const next = useCallback(() => {
    setSkip(skip + top);
  }, [skip, top]);

  const prev = useCallback(() => {
    setSkip(skip - top);
  }, [skip, top]);

  return {
    top,
    skip,
    next,
    prev,
  };
}

export const Pagination: React.FC<PaginationHookResult & { total: number }> = ({
  top,
  skip,
  prev,
  total,
  next,
}) => {
  const prevDisabled = skip - top < 0;
  const nextDisabled = total < top || total === 0;

  return prevDisabled && nextDisabled ? null : (
    <Stack bg="white" p={2} w="100%" direction="row" justifyContent="end">
      <IconButton
        variant="ghost"
        aria-label="prev"
        disabled={prevDisabled}
        onClick={() => {
          prev();
        }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        variant="ghost"
        aria-label="next"
        disabled={nextDisabled}
        onClick={() => {
          next();
        }}
      >
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  );
};
