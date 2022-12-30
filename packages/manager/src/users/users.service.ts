import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { UpdateProfileDto } from "src/auth/update-profile.dto";
import { SalesManager, User } from "src/openflow/types";
import { Session } from "src/auth/auth.service";
import { ConfigProvider } from "src/config/config.provider";
import { OpenflowService } from "src/openflow/openflow.service";
import { CryptService } from "src/crypt/crypt.service";
import { Rolemember } from "@openiap/openflow-api";

@Injectable()
export class UsersService {
  constructor(
    private readonly config: ConfigProvider,
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService
  ) {}

  async createUser(username: string, password: string) {
    // todo trial period
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
    const oldUser = await this.getUser(session.jwt, {
      _id: session.user._id,
    });
    if (!oldUser) throw new BadRequestException("User not found");
    if (oldUser.username !== data.username) {
      const exists = await this.getUser(this.cryptService.rootToken, {
        username: data.username,
      });
      if (exists) throw new ConflictException();
      // todo update stripe customer email
    }

    return this.updateUser({ ...oldUser, ...data });
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

  async getUser(jwt: string, query: { [key: string]: string } = {}) {
    return await this.openflowService
      .queryCollection<User>(jwt, {
        collectionname: "users",
        query,
      })
      .then((data) => data[0]);
  }

  async updateUser(data: Partial<User>) {
    return this.openflowService.updateOne(
      this.cryptService.rootToken,
      data,
      "users"
    );
  }

  private async getRole(query = {}) {
    return await this.openflowService
      .queryCollection<{
        members: Rolemember[];
      }>(this.cryptService.rootToken, {
        collectionname: "users",
        query: { ...query, _type: "role" },
      })
      .then((data) => data[0]);
  }

  private async updateRole(role: { [key: string]: unknown }) {
    return this.openflowService.updateOne(
      this.cryptService.rootToken,
      role,
      "users"
    );
  }
  async removeRoleMember(stripeProductId: string, user: User) {
    const role = await this.getRole({ stripe_reference_id: stripeProductId });

    if (!role)
      throw new Error(
        `Role with stripe_reference_id:${stripeProductId} not found!`
      );

    role.members = role.members.filter((member) => member._id !== user._id);

    return this.updateRole(role);
  }
  async addRoleMember(stripeProductId: string, user: User) {
    const role = await this.getRole({ stripe_reference_id: stripeProductId });

    if (!role)
      throw new Error(
        `Role with stripe_reference_id:${stripeProductId} not found!`
      );

    role.members.push(new Rolemember(user.name, user._id));

    return this.updateRole(role);
  }
}
