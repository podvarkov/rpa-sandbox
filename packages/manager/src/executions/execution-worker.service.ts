import { Injectable, Logger } from "@nestjs/common";
import { WebSocket } from "ws";
import { QueueMessage, SocketMessage, TokenUser } from "@openiap/openflow-api";
import { OnEvent } from "@nestjs/event-emitter";
import { Cron, CronExpression } from "@nestjs/schedule";

import { ConfigProvider } from "../config/config.provider";
import { CryptService } from "../crypt/crypt.service";
import { ExecuteWorkflowDto } from "../executions/execute-workflow.dto";
import { Execution } from "../openflow/types";
import { OpenflowService } from "../openflow/openflow.service";
import { Session } from "../auth/auth.service";
import { ExecutionsService } from "../executions/executions.service";

@Injectable()
export class ExecutionWorkerService {
  private robotId: string | null;
  private ws: WebSocket;
  private readonly logger = new Logger(ExecutionWorkerService.name);
  private queue = "coreus.backend";
  constructor(
    private readonly config: ConfigProvider,
    private readonly cryptService: CryptService,
    private readonly openflowService: OpenflowService,
    private readonly executionsService: ExecutionsService
  ) {
    this.initSocketConnection();
  }

  private async getRobotId(username: string) {
    if (this.robotId) return this.robotId;

    const data = await this.openflowService.queryCollection<TokenUser>(
      this.cryptService.rootToken,
      {
        collectionname: "users",
        query: { username },
        projection: ["_id"],
      }
    );

    this.robotId = data[0]?._id;
    if (!this.robotId) {
      throw new Error(`Can not get robot with username: ${username}`);
    }

    return this.robotId;
  }

  initSocketConnection() {
    this.ws = new WebSocket(this.config.OPENFLOW_WS_URL);
    let pingInterval: NodeJS.Timer;

    const registerQueueMsg = SocketMessage.fromcommand("registerqueue");

    registerQueueMsg.data = JSON.stringify({
      queuename: this.queue,
      jwt: this.cryptService.rootToken,
    });

    this.ws.on("open", () => {
      setTimeout(() => {
        // register queue
        this.ws.send(JSON.stringify(registerQueueMsg));
      }, 50);
    });

    this.ws.once("message", (data) => {
      const socketMessage = SocketMessage.fromjson(data.toString());
      if (
        socketMessage.command === registerQueueMsg.command &&
        socketMessage.replyto === registerQueueMsg.id
      ) {
        // queue is registered
        this.logger.log("worker queue registered");
        // init ping command interval
        pingInterval = setInterval(() => {
          this.ws.send(JSON.stringify(SocketMessage.fromcommand("ping")));
        }, 3_000);
        this.logger.log("ping interval initialized");
        this.logger.log("listener initialized");
      }
    });

    this.ws.on("close", () => {
      this.logger.error("connection is closed, retry after 5...");
      clearInterval(pingInterval);
      // retry connection
      setTimeout(() => {
        this.initSocketConnection();
      }, 5000);
    });

    this.ws.on("error", (error) => {
      this.logger.error({ message: "connection is closed", error });
    });
  }

  @OnEvent("workflow.queued")
  async handleWorkflowQueuedEvent(
    session: Session,
    workflow: ExecuteWorkflowDto
  ) {
    const robotId = await this.getRobotId(this.config.OPENFLOW_ROBOT_USERNAME);
    const executionContext: Partial<Execution> = {
      robotId,
      arguments: workflow.arguments,
      _type: "user_execution",
      workflowId: workflow.workflowId,
      templateId: workflow.templateId,
    };

    const [queueMessageData] = QueueMessage.parse({
      jwt: this.cryptService.rootToken,
      priority: 2,
      queuename: robotId,
      replyto: this.queue,
      expiration: this.config.WORKFLOW_EXPIRATION,
      data: {
        command: "invoke",
        workflowid: workflow.templateId,
        data: {
          ...workflow.arguments,
          session_id: session.user._id,
          session_username: session.user.username,
        },
      },
    });
    const queueMsg = SocketMessage.fromcommand("queuemessage");
    queueMsg.data = JSON.stringify(queueMessageData);

    executionContext.startedAt = new Date();
    executionContext.correlationId = queueMessageData.correlationId;
    executionContext.status = "queued";

    try {
      await this.executionsService.check(session.jwt, workflow.templateId);
      await this.executionsService.upsertExecution(
        session.jwt,
        executionContext
      );
      this.ws.send(JSON.stringify(queueMsg));
    } catch (error) {
      executionContext.status = "error";
      executionContext.error = error.message;
      executionContext.finishedAt = new Date();
      await this.executionsService.upsertExecution(
        session.jwt,
        executionContext
      );
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async syncExecutions() {
    this.logger.debug({
      message: "Sync executions cron started",
    });

    const executions = await this.executionsService
      .findExecutions(this.cryptService.rootToken, {
        _type: "user_execution",
        finishedAt: { $exists: false },
      })
      .then((data) =>
        data.reduce(
          (acc, el) => ({ ...acc, [el.correlationId]: el }),
          {} as { [key: string]: Execution }
        )
      );

    if (Object.keys(executions).length === 0) return;

    const rpaInstances = await this.executionsService.getRelatedRpaInstances(
      this.cryptService.rootToken,
      Object.keys(executions)
    );

    for (const rpaInstance of rpaInstances) {
      const execution = executions[rpaInstance.correlationId];
      if (execution) {
        if (rpaInstance.isCompleted)
          execution.finishedAt = rpaInstance._modified;

        if (rpaInstance.hasError) {
          execution.status = "error";
        } else {
          execution.status = rpaInstance.isCompleted
            ? "invokecompleted"
            : "invokesuccess";
        }

        execution.error = rpaInstance.hasError
          ? rpaInstance.errormessage
          : null;

        await this.executionsService.upsertExecution(
          this.cryptService.rootToken,
          execution
        );

        delete executions[execution.correlationId];
      }
    }

    // check for expired
    for (const execution of Object.values(executions)) {
      const ts = new Date();
      if (
        ts.getTime() - new Date(execution.startedAt).getTime() >
        this.config.WORKFLOW_EXPIRATION
      ) {
        execution.finishedAt = new Date();
        execution.status = "timeout";
        await this.executionsService.upsertExecution(
          this.cryptService.rootToken,
          execution
        );
        this.logger.debug({
          message: "execution timeout",
          now: ts.getTime(),
          started: new Date(execution.startedAt).getTime(),
          expiration: this.config.WORKFLOW_EXPIRATION,
          execution,
        });
      }
    }
  }
}
