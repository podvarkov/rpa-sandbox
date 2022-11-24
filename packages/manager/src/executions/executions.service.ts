import { Injectable } from "@nestjs/common";
import { OpenflowService } from "../openflow/openflow.service";
import { GetExecutionsQueryParamsDto } from "src/executions/get-executions-query-params.dto";

@Injectable()
export class ExecutionsService {
  constructor(private readonly openflowService: OpenflowService) {}

  findAll(jwt: string, queryParams: GetExecutionsQueryParamsDto) {
    console.log("QUERY PARAMS", queryParams);
    return this.openflowService.listExecutions(
      jwt,
      { workflowId: queryParams.workflowId, status: queryParams.status },
      { top: queryParams.top, skip: queryParams.skip },
      { [queryParams.orderBy]: queryParams.direction }
    );
  }

  findOne(jwt: string, id: string) {
    return this.openflowService.getExecution(jwt, id);
  }
}
