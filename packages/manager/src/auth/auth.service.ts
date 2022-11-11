import { Injectable, Logger } from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import { CookieJar } from "tough-cookie";
import * as axiosCookieJarSupport from "axios-cookiejar-support";
import * as axios from "axios";
import { TokenUser } from "@openiap/openflow-api";
import { OpenflowService } from "src/openflow/openflow.service";

export type Session = {
  user: Pick<
    TokenUser,
    "_id" | "_type" | "roles" | "name" | "username" | "dblocked"
  >;
  jwt: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly config: ConfigProvider,
    private readonly commander: OpenflowService
  ) {}

  async validateUser(username: string, password: string) {
    const jar = new CookieJar();
    this.logger.debug({ message: "validate user", username, password });
    // @ts-expect-error wrong types
    const http = axios.create({
      baseURL: this.config.OPENFLOW_API_HOST,
      withCredentials: true,
      jar,
    });
    axiosCookieJarSupport.wrapper(http);
    await http.post("local", {
      user: username,
      username,
      password,
    });
    const cookies = jar.getCookiesSync(this.config.OPENFLOW_API_HOST);
    this.logger.debug({ message: "cookies received, getting user", cookies });
    return await http.get<Session>("/jwtlong").then(({ data }) => {
      this.logger.debug({ message: "user received", data });
      if (!data.jwt) {
        return null;
      } else {
        return data;
      }
    });
  }

  async createUser(username: string, password: string) {
    return this.commander.createUser({ username, password });
  }
}
