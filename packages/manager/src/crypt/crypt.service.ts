import { Injectable } from "@nestjs/common";
import { ConfigProvider } from "../config/config.provider";
import * as crypto from "crypto";
import {
  Rolemember,
  TokenUser,
  User,
  WellknownIds,
} from "@openiap/openflow-api";
import * as jwt from "jsonwebtoken";

@Injectable()
export class CryptService {
  private _rootToken: string | null;

  constructor(private readonly config: ConfigProvider) {}

  encrypt(text: string) {
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.config.OPENFLOW_AES_SECRET),
      this.config.OPENFLOW_AES_SECRET.slice(0, 16)
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  }

  decrypt(text: string) {
    const encryptedText = Buffer.from(text, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.config.OPENFLOW_AES_SECRET),
      this.config.OPENFLOW_AES_SECRET.slice(0, 16)
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  private createRootUser(): TokenUser {
    const user: User = new User();
    user._type = "user";
    user.name = "root";
    user.username = "root";
    user._id = WellknownIds.root;
    user.roles = [];
    user.roles.push(new Rolemember("admins", WellknownIds.admins));

    const tokenUser: TokenUser = new TokenUser();
    tokenUser._type = user._type;
    tokenUser._id = user._id;
    tokenUser.name = user.name;
    tokenUser.username = user.username;
    tokenUser.roles = user.roles;
    tokenUser.customerid = user.customerid;
    tokenUser.selectedcustomerid = user.selectedcustomerid;
    tokenUser.dblocked = user.dblocked;

    return tokenUser;
  }
  private createRootToken(): string {
    const tokenUser = this.createRootUser();

    return jwt.sign({ data: tokenUser }, this.config.OPENFLOW_AES_SECRET, {
      expiresIn: "365d",
    });
  }

  get rootToken(): string {
    if (this._rootToken) return this._rootToken;
    this._rootToken = this.createRootToken();
    return this._rootToken;
  }

  generateToken(params: { _id: string; username: string }) {
    const tokenUser: TokenUser = new TokenUser();
    tokenUser._type = "user";
    tokenUser._id = params._id;
    tokenUser.name = params.username;
    tokenUser.username = params.username;
    tokenUser.roles = [new Rolemember("users", WellknownIds.users)];

    return jwt.sign({ data: tokenUser }, this.config.OPENFLOW_AES_SECRET, {
      expiresIn: "365d",
    });
  }
}
