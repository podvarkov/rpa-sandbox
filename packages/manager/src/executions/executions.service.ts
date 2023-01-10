import { BadRequestException, Injectable } from "@nestjs/common";
import { OpenflowService } from "../openflow/openflow.service";
import { GetExecutionsQueryParamsDto } from "./get-executions-query-params.dto";
import { Execution } from "../openflow/types";
import { Session } from "../auth/auth.service";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";
import { TemplatesService } from "src/templates/templates.service";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class ExecutionsService {
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly templatesService: TemplatesService,
    private readonly eventEmitter: EventEmitter2
  ) {}

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
        "correlationId",
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

  upsertExecution(jwt: string, execution: Partial<Execution>) {
    if (execution._id) return this.openflowService.updateOne(jwt, execution);
    return this.openflowService.insertOne(jwt, execution);
  }

  async countExecutions(jwt: string): Promise<number> {
    const executions = await this.openflowService.queryCollection<Execution>(
      jwt,
      {
        collectionname: "entities",
        query: { _type: "user_execution", finishedAt: { $exists: false } },
        projection: { _id: 1, finishedAt: 1 },
      }
    );

    return executions.length;
  }

  async getRelatedRpaInstances(token: string, executionIds: string[]) {
    return this.openflowService.queryCollection<{
      isCompleted: boolean;
      hasError: boolean;
      errormessage: string;
      _created: Date;
      _modified: Date;
      correlationId: string;
    }>(token, {
      collectionname: "openrpa_instances",
      query: { correlationId: { $in: executionIds } },
    });
  }

  // todo naming
  async check(jwt: string, templateId: string) {
    if (!(await this.templatesService.findOne(jwt, templateId))) {
      throw new Error("Payment required");
    }

    if ((await this.countExecutions(jwt)) > 3) {
      throw new Error("Executions limit");
    }
  }

  async execute(session: Session, body: ExecuteWorkflowDto) {
    try {
      await this.check(session.jwt, body.templateId);
      this.eventEmitter.emit("workflow.queued", session, body);
      return { status: "queued" };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
