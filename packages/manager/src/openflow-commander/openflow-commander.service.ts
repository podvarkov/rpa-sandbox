import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import {
  InsertOneMessage,
  QueryMessage,
  SocketMessage,
  TokenUser,
} from "@openiap/openflow-api";
import { WebSocket } from "ws";

type Workflow = {
  _id: string;
  projectandname?: string;
  projectid?: string;
  name: string;
  _type: string;
  _modified: string;
  _created: string;
  _createdby: string;
};

@Injectable()
export class OpenflowCommanderService {
  private readonly logger = new Logger(OpenflowCommanderService.name);

  constructor(private readonly config: ConfigProvider) {}

  private parseMessageData<T>(data: string): T | null {
    if (data) return JSON.parse(data) as unknown as T;
    return null;
  }

  async listRobotWorkflows() {
    const [data] = QueryMessage.parse({
      top: 100,
      skip: 0,
      priority: 2,
      decrypt: true,
      collectionname: "openrpa",
      projection: {
        _type: 1,
        name: 1,
        _created: 1,
        _modified: 1,
        projectid: 1,
        _created_by: 1,
        description: 1,
      },
      query: { _type: "workflow" },
      jwt: this.config.OPENFLOW_ROOT_TOKEN,
    });
    const reply = await this.sendCommand<{
      data: { message?: string; result: Workflow[] };
      command: string;
    }>("query", data);

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return { data: reply.data.result };
  }

  async listFormWorkflows() {
    const [data] = QueryMessage.parse({
      top: 100,
      skip: 0,
      priority: 2,
      decrypt: true,
      collectionname: "workflow",
      projection: {
        _type: 1,
        name: 1,
        _created: 1,
        _modified: 1,
        _created_by: 1,
      },
      query: { _type: "workflow", web: true },
      jwt: this.config.OPENFLOW_ROOT_TOKEN,
    });
    const reply = await this.sendCommand<{
      data: { message?: string; result: Workflow[] };
      command: string;
    }>("query", data);

    if (reply.command === "error") {
      throw new BadRequestException(reply.data.message);
    }

    return { data: reply.data.result };
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
      jwt: this.config.OPENFLOW_ROOT_TOKEN,
    });

    const reply = await this.sendCommand<{
      data: { error?: string; result: TokenUser };
    }>("insertone", insertUserData);
    if (reply.data.error) throw new ConflictException(reply.data.error);
    return reply;
  }

  private sendCommand<T>(
    cmd: string,
    data: string | unknown = ""
  ): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.config.OPENFLOW_WS_HOST);

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
