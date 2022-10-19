import { ConflictException, Injectable, Logger } from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import {
  InsertOneMessage,
  SocketMessage,
  TokenUser,
} from "@openiap/openflow-api";
import { WebSocket } from "ws";

@Injectable()
export class OpenflowCommanderService {
  private readonly logger = new Logger(OpenflowCommanderService.name);

  constructor(private readonly config: ConfigProvider) {}

  private parseMessageData<T>(data: string): T | null {
    if (data) return JSON.parse(data) as unknown as T;
    return null;
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

    const reply = await this.sendCommand<{ error?: string; result: TokenUser }>(
      "insertone",
      insertUserData
    );
    if (reply.error) throw new ConflictException(reply.error);
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
          resolve(this.parseMessageData<T>(reply.data));
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
