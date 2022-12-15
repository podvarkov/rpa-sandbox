import { Injectable, Logger } from "@nestjs/common";
import { ConfigProvider } from "src/config/config.provider";
import { WebSocket } from "ws";
import { QueueMessage, SocketMessage, TokenUser } from "@openiap/openflow-api";
import { CryptService } from "src/crypt/crypt.service";
import { OnEvent } from "@nestjs/event-emitter";
import { ExecuteWorkflowDto } from "src/workflows/execute-workflow.dto";
import { Execution } from "./types";
import { OpenflowService } from "src/openflow/openflow.service";
import { Session } from "src/auth/auth.service";

@Injectable()
export class ExecutionWorkerService {
  private contexts: { [key: string]: Partial<Execution> } = {};
  private robotId: string | null;
  private ws: WebSocket;
  private readonly logger = new Logger(ExecutionWorkerService.name);
  private queue = "coreus.backend.executions";
  public queueInitialized = false;
  constructor(
    private readonly config: ConfigProvider,
    private readonly cryptService: CryptService,
    private readonly openflowService: OpenflowService
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

  private updateExecution(context: Partial<Execution>) {
    this.openflowService
      .updateOne(this.cryptService.rootToken, {
        ...context,
      })
      .catch((error) => {
        this.logger.error({ message: "can not update execution", error });
      });
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
        this.queueInitialized = true;
        this.logger.log("worker queue registered");
        // init ping command interval
        pingInterval = setInterval(() => {
          this.ws.send(JSON.stringify(SocketMessage.fromcommand("ping")));
        }, 10_000);
        this.logger.log("ping interval initialized");
        this.listenQueue(this.ws);
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

  listenQueue(ws: WebSocket) {
    ws.on("message", async (data) => {
      try {
        const socketMessage = SocketMessage.fromjson(data.toString());
        this.logger.debug({
          message: "message received",
          socketMessage,
        });
        if (socketMessage.command === "error") {
          this.logger.error({
            message: "error message received",
            socketMessage,
          });
        }

        if (socketMessage.command === "queuemessage") {
          const timestamp = new Date();

          const socketData = this.openflowService.parseMessageData<{
            correlationId: string;
            error?: string;
            data: {
              command: Execution["status"];
              workflowid: string;
              data: { [key: string]: unknown };
            };
          }>(socketMessage.data);

          const executionContext =
            this.contexts[socketData.correlationId] ||
            (await this.openflowService
              .queryCollection<Execution>(this.cryptService.rootToken, {
                query: { _id: socketData.correlationId },
                collectionname: "entities",
              })
              .then((executions) => executions[0]));

          executionContext.status = socketData.data.command;

          if (socketData.data.command === "invokesuccess") {
            executionContext.invokedAt = timestamp;
          }

          if (socketData.error) {
            executionContext.error = socketData.error;
            executionContext.status = "error";
          }

          if (
            ["timeout", "invokefailed", "error"].includes(
              socketData.data.command
            )
          ) {
            executionContext.finishedAt = timestamp;
            executionContext.error =
              (socketData.data.data.Message as string) ||
              socketData.data.command;
          }

          if (socketData.data.command === "invokecompleted") {
            executionContext.finishedAt = timestamp;
            executionContext.output = socketData.data.data;
          }

          this.updateExecution(executionContext);
        }
      } catch (error) {
        this.logger.error({ message: "can not process ws message", error });
      }
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
      expiration: workflow.expiration,
    };

    const [queueMessageData] = QueueMessage.parse({
      jwt: this.cryptService.rootToken,
      priority: 2,
      queuename: robotId,
      replyto: "coreus.backend.executions",
      data: {
        command: "invoke",
        workflowid: workflow.templateId,
        data: {
          ...workflow.arguments,
          session_id: session.user._id,
          session_username: session.user.username,
        },
      },
      expiration: workflow.expiration,
    });
    const queueMsg = SocketMessage.fromcommand("queuemessage");
    queueMsg.data = JSON.stringify(queueMessageData);

    executionContext.startedAt = new Date();
    executionContext.correlationId = queueMessageData.correlationId;
    executionContext.status = "queued";
    executionContext._id = queueMessageData.correlationId;
    this.contexts[executionContext._id] = await this.openflowService.insertOne(
      session.jwt,
      executionContext
    );
    this.ws.send(JSON.stringify(queueMsg));
  }
}
