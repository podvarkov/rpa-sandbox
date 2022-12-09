import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import {
  DeleteManyMessage,
  DeleteOneMessage,
  InsertManyMessage,
  InsertOneMessage,
  QueryMessage,
  QueryOptions,
  SocketMessage,
  TokenUser,
  UpdateOneMessage,
} from "@openiap/openflow-api";
import { WebSocket } from "ws";
import { CryptService } from "../crypt/crypt.service";

@Injectable()
export class OpenflowService {
  private readonly logger = new Logger(OpenflowService.name);

  constructor(
    private readonly config: ConfigProvider,
    private readonly cryptService: CryptService
  ) {}

  public parseMessageData<T>(data: string): T | null {
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

  async deleteMany(jwt: string, query = {}, collectionname = "entities") {
    const [data] = DeleteManyMessage.parse({
      priority: 2,
      recursive: false,
      collectionname,
      query,
      jwt,
    });

    const reply = await this.sendCommand<{
      data: { message?: string; affectedrows: number; collectionname: string };
      command: string;
    }>("deletemany", data);

    if (reply.command === "error") {
      throw new Error(reply.data.message);
    }

    return {
      collection: reply.data.collectionname,
      rows: reply.data.affectedrows,
    };
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

  async insertMany<T extends { [key: string]: unknown }>(
    jwt: string,
    items: T[],
    collectionname = "entities"
  ) {
    const [insertManyData] = InsertManyMessage.parse({
      priority: 2,
      w: 1,
      j: true,
      collectionname,
      items,
      skipresults: true,
      jwt,
    });

    const reply = await this.sendCommand<{
      command: string;
      data: { message?: string; result: T };
    }>("insertmany", insertManyData);

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
      data: { message?: string; error?: string; result: T };
    }>("updateone", updateEntityData);

    if (reply.command === "error" || reply.data.error) {
      throw new BadRequestException(reply.data.message || reply.data.error);
    }

    return reply.data.result;
  }

  async createUser(data: {
    username: string;
    password: string;
    salesManagerId: string;
  }) {
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
        salesManagerId: data.salesManagerId,
      },
      jwt: this.cryptService.rootToken,
    });

    const reply = await this.sendCommand<{
      data: { error?: string; result: TokenUser };
    }>("insertone", insertUserData);
    if (reply.data.error) throw new ConflictException(reply.data.error);
    return reply.data.result;
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
