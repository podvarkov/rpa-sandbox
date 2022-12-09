import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import { CookieJar } from "tough-cookie";
import * as axiosCookieJarSupport from "axios-cookiejar-support";
import * as axios from "axios";
import { TokenUser } from "@openiap/openflow-api";
import { OpenflowService } from "../openflow/openflow.service";
import { UpdateProfileDto } from "src/auth/update-profile.dto";
import { Profile, SalesManager } from "src/openflow/types";
import { CryptService } from "src/crypt/crypt.service";

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
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService
  ) {}

  async validateUser(username: string, password: string) {
    const jar = new CookieJar();
    this.logger.debug({ message: "validate user", username, password });
    // @ts-expect-error wrong types
    const http = axios.create({
      baseURL: this.config.OPENFLOW_URL,
      withCredentials: true,
      jar,
    });
    axiosCookieJarSupport.wrapper(http);
    await http.post("local", {
      user: username,
      username,
      password,
    });
    const cookies = jar.getCookiesSync(this.config.OPENFLOW_URL);
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
    const salesMembers = await this.getSalesMembers();
    if (!salesMembers.length)
      throw new BadRequestException("You likely forgot to add your sales team");

    return this.openflowService.createUser({
      username,
      password,
      salesManagerId:
        salesMembers[Math.floor(Math.random() * salesMembers.length)]._id,
    });
  }

  async updateUserProfile(session: Session, data: UpdateProfileDto) {
    const oldUser = await this.getUserProfile(session);
    if (!oldUser) throw new BadRequestException("User not found");

    return this.openflowService.updateOne(
      session.jwt,
      { ...oldUser, ...data },
      "users"
    );
  }

  async getSalesMember(id: string) {
    return this.getSalesMembers({ _id: id }).then((data) => data[0]);
  }

  async getSalesMembers(query = {}) {
    return this.openflowService.queryCollection<SalesManager>(
      this.cryptService.rootToken,
      {
        query: { _type: "sales", ...query },
        collectionname: "entities",
      }
    );
  }

  async getUserProfile(session: Session) {
    const userProfile = await this.openflowService
      .queryCollection<Profile>(session.jwt, {
        collectionname: "users",
        query: { _id: session.user._id },
        projection: [
          "username",
          "name",
          "surname",
          "phone",
          "furiganaSurname",
          "furiganaMay",
          "salesManagerId",
        ],
      })
      .then((data) => data[0]);

    if (!userProfile) throw new BadRequestException("User profile not found!");

    return userProfile;
  }
}
