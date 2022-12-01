import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import {
  DeleteOneMessage,
  InsertOneMessage,
  QueryMessage,
  QueryOptions,
  QueueMessage,
  SocketMessage,
  TokenUser,
  UpdateOneMessage,
} from "@openiap/openflow-api";
import { WebSocket } from "ws";
import { ExecuteWorkflowDto } from "../workflows/execute-workflow.dto";
import { CryptService } from "../crypt/crypt.service";
import { Execution } from "./types";

@Injectable()
export class OpenflowService {
  private readonly logger = new Logger(OpenflowService.name);
  private robotId: string | null;

  constructor(
    private readonly config: ConfigProvider,
    private readonly cryptService: CryptService
  ) {}

  private async getRobotId(username: string) {
    if (this.robotId) return this.robotId;

    const data = await this.queryCollection<TokenUser>(
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

  private parseMessageData<T>(data: string): T | null {
    if (data) {
      try {
        return JSON.parse(data) as unknown as T;
      } catch (e) {
        return { message: data } as unknown as T;
      }
    }
    return null;
  }

  async queryCollection<T>(jwt: string, options: QueryOptions) {
    const [data] = QueryMessage.parse({
      top: 100,
      skip: 0,
      priority: 2,
      decrypt: true,
      ...options,
      jwt,
    });

    const reply = await this.sendCommand<{
      data: { message?: string; result: T[]; collectionname: string };
      command: string;
    }>("query", data);

    if (reply.command === "error") {
      throw new Error(reply.data.message);
    }

    return reply.data.result.map((result) => ({
      ...result,
      collection: reply.data.collectionname,
    }));
  }

  async deleteOne(jwt: string, id: string, collectionname = "entities") {
    const [data] = DeleteOneMessage.parse({
      priority: 2,
      recursive: false,
      collectionname,
      id,
      jwt,
    });

    const reply = await this.sendCommand<{
      data: { message?: string; id: string; collectionname: string };
      command: string;
    }>("deleteone", data);

    if (reply.command === "error") {
      throw new Error(reply.data.message);
    }

    return { collection: reply.data.collectionname, id: reply.data.id };
  }

  async insertOne<T extends { [key: string]: unknown }>(
    jwt: string,
    item: T,
    collectionname = "entities"
  ) {
    const [insertEntityData] = InsertOneMessage.parse({
      priority: 2,
      w: 1,
      j: true,
      collectionname,
      item,
      jwt,
    });

    const reply = await this.sendCommand<{
      command: string;
      data: { message?: string; result: T };
    }>("insertone", insertEntityData);

    if (reply.command === "error") {
      throw new Error(reply.data.message);
    }

    return reply.data.result;
  }

  async updateOne<T extends { [key: string]: unknown }>(
    jwt: string,
    item: T,
    collectionname = "entities"
  ) {
    const [updateEntityData] = UpdateOneMessage.parse({
      priority: 2,
      w: 1,
      j: true,
      collectionname,
      item,
      jwt,
    });

    const reply = await this.sendCommand<{
      command: string;
      data: { message?: string; result: T };
    }>("updateone", updateEntityData);

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return reply.data.result;
  }

  async createUser(data: { username: string; password: string }) {
    const [insertUserData] = InsertOneMessage.parse({
      priority: 2,
      w: 1,
      j: true,
      collectionname: "users",
      item: {
        roles: [],
        dblocked: false,
        _type: "user",
        name: data.username,
        username: data.username,
        newpassword: data.password,
        sid: "",
        federationids: [],
        validated: true,
        emailvalidated: true,
        formvalidated: true,
      },
      jwt: this.cryptService.rootToken,
    });

    const reply = await this.sendCommand<{
      data: { error?: string; result: TokenUser };
    }>("insertone", insertUserData);
    if (reply.data.error) throw new ConflictException(reply.data.error);
    return reply.data.result;
  }

  async executeWorkflow(jwt: string, workflow: ExecuteWorkflowDto) {
    const robotId = await this.getRobotId(this.config.OPENFLOW_ROBOT_USERNAME);
    const executionContext: Partial<Execution> = {
      robotId,
      arguments: workflow.arguments,
      _type: "user_execution",
      workflowId: workflow.workflowId,
      templateId: workflow.templateId,
      expiration: workflow.expiration,
    };

    const ws = new WebSocket(this.config.OPENFLOW_WS_URL);
    return new Promise((resolve, reject) => {
      const registerQueueMsg = SocketMessage.fromcommand("registerqueue");
      registerQueueMsg.data = JSON.stringify({
        priority: 2,
        count: 1,
        index: 0,
        data: '{"priority":2}',
        jwt: this.cryptService.rootToken,
      });

      ws.on("open", () => {
        setTimeout(() => {
          ws.send(JSON.stringify(registerQueueMsg));
        }, 50);
      });

      ws.on("message", (data) => {
        const timestamp = new Date();
        const socketMessage = SocketMessage.fromjson(data.toString());

        if (socketMessage.command === "error") {
          reject(new BadRequestException(socketMessage));
        }

        if (
          socketMessage.command === "queuemessage" &&
          socketMessage.replyto == null
        ) {
          const socketData = this.parseMessageData<{
            data: {
              command: Execution["status"];
              workflowid: string;
              data: { [key: string]: unknown };
            };
          }>(socketMessage.data);

          executionContext.status = socketData.data.command;

          if (socketData.data.command === "invokesuccess") {
            executionContext.invokedAt = timestamp;
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

            this.insertOne(jwt, executionContext).then(() =>
              reject(
                new BadRequestException(
                  socketData.data.data.Message
                    ? `${socketData.data.command}: ${socketData.data.data.Message}`
                    : socketData.data.command
                )
              )
            );
          }

          if (socketData.data.command === "invokecompleted") {
            executionContext.finishedAt = timestamp;
            executionContext.output = socketData.data.data;
            this.insertOne(jwt, executionContext).then(() =>
              resolve(socketData.data.data)
            );
          }
        }

        if (socketMessage.replyto === registerQueueMsg.id) {
          const [queueMessageData] = QueueMessage.parse({
            jwt: this.cryptService.rootToken,
            priority: 2,
            queuename: robotId,
            replyto: this.parseMessageData<{ queuename: string }>(
              socketMessage.data
            ).queuename,
            data: {
              command: "invoke",
              workflowid: workflow.templateId,
              data: workflow.arguments,
            },
            expiration: workflow.expiration,
          });
          const queueMsg = SocketMessage.fromcommand("queuemessage");
          queueMsg.data = JSON.stringify(queueMessageData);

          executionContext.startedAt = new Date();
          executionContext.correlationId = queueMessageData.correlationId;

          ws.send(JSON.stringify(queueMsg));
        }
      });
    });
  }

  private sendCommand<T>(
    cmd: string,
    data: string | unknown = ""
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.config.OPENFLOW_WS_URL);

      const msg = SocketMessage.fromcommand(cmd);
      msg.data = typeof data === "string" ? data : JSON.stringify(data);

      ws.on("open", () => {
        setTimeout(() => {
          ws.send(JSON.stringify(msg));
          this.logger.debug({
            message: "ws opened, sending message",
            msg,
          });
        }, 50);
      });

      let messageBuffer = "";
      ws.on("message", (data) => {
        const reply = SocketMessage.fromjson(data.toString());
        this.logger.debug({ message: "reply received", reply });

        if (reply.replyto === msg.id) {
          messageBuffer += reply.data;
          if (reply.index === reply.count - 1) {
            ws.close();
            resolve({
              ...reply,
              data: this.parseMessageData<T>(messageBuffer),
            } as T);
          }
        }
      });

      ws.on("close", () => {
        this.logger.debug("ws closed");
        reject();
      });

      ws.on("error", (e) => {
        this.logger.error({ message: "ws error", e });
        reject(e);
      });
    });
  }
}
