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
import { ExecuteWorkflowDto } from "src/workflows/execute-workflow.dto";
import { CryptService } from "src/crypt/crypt.service";

type Workflow = {
  _id: string;
  projectandname?: string;
  projectid?: string;
  description?: string;
  name: string;
  _type: string;
  _modified: string;
  _created: string;
  _createdby: string;
  Parameters?: { type: string; direction: string; name: string }[];
  collection: string;
};

type UserWorkflow = {
  _id: string;
  collection: string;
  description?: string;
  name: string;
  templateId: string;
  defaultArguments?: { [key: string]: unknown };
  _created: string;
  _modified: string;
  _createdby: string;
  _createdbyid: string;
  _type: string;
  expiration: number;
};

type EncryptedUserWorkflow = Omit<UserWorkflow, "defaultArguments"> & {
  defaultArguments: string;
};

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
    const reply = await this.queryCollection<{
      data?: { result?: TokenUser[] };
    }>(this.cryptService.rootToken, {
      collectionname: "users",
      query: { username },
      projection: ["_id"],
    });

    this.robotId = reply?.data?.result[0]?._id;
    if (!this.robotId)
      throw new Error(`Can not get robot with username: ${username}`);
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

  private async queryCollection<T>(jwt: string, options: QueryOptions) {
    const [data] = QueryMessage.parse({
      top: 100,
      skip: 0,
      priority: 2,
      decrypt: true,
      ...options,
      jwt,
    });

    return this.sendCommand<T>("query", data);
  }

  async listRobotWorkflows(
    jwt: string,
    query: { [key: string]: unknown } = {}
  ) {
    const reply = await this.queryCollection<{
      data: { message?: string; result: Workflow[]; collectionname: string };
      command: string;
    }>(jwt, {
      query: { _type: "workflow", ...query },
      projection: {
        _type: 1,
        name: 1,
        _created: 1,
        _modified: 1,
        projectid: 1,
        _created_by: 1,
        description: 1,
        Parameters: 1,
      },
      collectionname: "openrpa",
    });

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return reply.data.result.map((wf) => ({
      ...wf,
      collection: reply.data.collectionname,
    }));
  }

  async listFormWorkflows(jwt: string, query: { [key: string]: unknown } = {}) {
    const reply = await this.queryCollection<{
      data: { message?: string; result: Workflow[]; collectionname: string };
      command: string;
    }>(jwt, {
      query: { _type: "workflow", web: true, ...query },
      projection: {
        _type: 1,
        name: 1,
        _created: 1,
        _modified: 1,
        projectid: 1,
        _created_by: 1,
        description: 1,
        Parameters: 1,
      },
      collectionname: "workflow",
    });

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return reply.data.result.map((wf) => ({
      ...wf,
      collection: reply.data.collectionname,
    }));
  }

  async listUserWorkflows(jwt: string, query = {}) {
    const reply = await this.queryCollection<{
      data: {
        message?: string;
        result: Array<EncryptedUserWorkflow>;
        collectionname: string;
      };
      command: string;
    }>(jwt, {
      query: { ...query, _type: "user_workflow" },
      collectionname: "entities",
    });

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return reply.data.result.map((wf) => ({
      ...wf,
      collection: reply.data.collectionname,
    }));
  }

  async getUserWorkflow(
    jwt: string,
    id: string
  ): Promise<EncryptedUserWorkflow | null> {
    const data = await this.listUserWorkflows(jwt, { _id: id });
    return data.length > 0 ? data[0] : null;
  }

  async deleteUserWorkflow(jwt: string, id: string) {
    const [data] = DeleteOneMessage.parse({
      priority: 2,
      recursive: false,
      collectionname: "entities",
      id,
      jwt,
    });

    const reply = await this.sendCommand<{
      data: { message?: string; id: string; collectionname: string };
      command: string;
    }>("deleteone", data);

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return { collection: reply.data.collectionname, id: reply.data.id };
  }

  async getRobotWorkflow(jwt: string, id: string): Promise<Workflow> {
    const results = await this.listRobotWorkflows(jwt, { _id: id });
    return results[0];
  }

  async getFormWorkflow(jwt: string, id: string): Promise<Workflow> {
    const results = await this.listFormWorkflows(jwt, { _id: id });
    return results[0];
  }

  async createEntity(jwt: string, item: { [key: string]: unknown }) {
    const [insertEntityData] = InsertOneMessage.parse({
      priority: 2,
      w: 1,
      j: true,
      collectionname: "entities",
      item,
      jwt,
    });

    const reply = await this.sendCommand<{
      command: string;
      data: { message?: string; result: UserWorkflow };
    }>("insertone", insertEntityData);

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return reply.data.result;
  }

  async updateEntity(jwt: string, item: { [key: string]: unknown }) {
    const [updateEntityData] = UpdateOneMessage.parse({
      priority: 2,
      w: 1,
      j: true,
      collectionname: "entities",
      item,
      jwt,
    });

    const reply = await this.sendCommand<{
      command: string;
      data: { message?: string; result: UserWorkflow };
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

  async executeWorkflow(workflow: ExecuteWorkflowDto) {
    const robotId = await this.getRobotId(this.config.OPENFLOW_ROBOT_USERNAME);

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
              command: string;
              workflowid: string;
              data: { [key: string]: unknown };
            };
          }>(socketMessage.data);

          if (
            ["timeout", "invokefailed", "error"].includes(
              socketData.data.command
            )
          ) {
            reject(
              new BadRequestException(
                socketData.data.data.Message
                  ? `${socketData.data.command}: ${socketData.data.data.Message}`
                  : socketData.data.command
              )
            );
          }

          if (socketData.data.command === "invokecompleted") {
            resolve(socketData.data.data);
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
              workflowid: workflow.workflowid,
              data: workflow.arguments,
            },
            expiration: workflow.expiration,
          });
          const queueMsg = SocketMessage.fromcommand("queuemessage");
          queueMsg.data = JSON.stringify(queueMessageData);
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

      ws.once("message", (data) => {
        const reply = SocketMessage.fromjson(data.toString());
        this.logger.debug({ message: "reply received", reply });

        if (reply.replyto === msg.id) {
          ws.close();
          resolve({
            ...reply,
            data: this.parseMessageData<T>(reply.data),
          } as T);
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
