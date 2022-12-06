import { Injectable } from "@nestjs/common";
import { OpenflowService } from "../openflow/openflow.service";
import { GetExecutionsQueryParamsDto } from "./get-executions-query-params.dto";
import { Execution } from "../openflow/types";

@Injectable()
export class ExecutionsService {
  constructor(private readonly openflowService: OpenflowService) {}

  findExecutions(
    jwt: string,
    query = {},
    pagination = { skip: 0, top: 50 },
    orderby: { [key: string]: number } = { startedAt: -1 }
  ) {
    return this.openflowService.queryCollection<Execution>(jwt, {
      query: { ...query, _type: "user_execution" },
      orderby,
      collectionname: "entities",
      projection: [
        "_id",
        "collection",
        "_createdby",
        "_createdbyid",
        "_type",
        "startedAt",
        "invokedAt",
        "finishedAt",
        "arguments",
        "output",
        "error",
        "workflowId",
        "templateId",
        "status",
        "expiration",
      ],
      ...pagination,
    });
  }

  findAll(jwt: string, queryParams: GetExecutionsQueryParamsDto) {
    return this.findExecutions(
      jwt,
      { workflowId: queryParams.workflowId, status: queryParams.status },
      { top: queryParams.top, skip: queryParams.skip },
      { [queryParams.orderBy]: queryParams.direction }
    );
  }

  findOne(jwt: string, id: string) {
    return this.findExecutions(jwt, { _id: id }).then(
      (execution) => execution[0]
    );
  }
}
