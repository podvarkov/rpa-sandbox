import { Expose } from "class-transformer";
import { SalesManager } from "src/openflow/types";

export class UserProfileEntity {
  @Expose()
  username: string;

  @Expose()
  phone = "";

  @Expose()
  name: string;

  @Expose()
  surname = "";

  @Expose()
  furiganaSurname = "";

  @Expose()
  furiganaMay = "";

  @Expose()
  salesManagerId = "";

  @Expose({ groups: ["includeSales"] })
  salesManager?: unknown;

  constructor(
    partial: Partial<UserProfileEntity>,
    salesManager?: SalesManager
  ) {
    Object.assign(this, partial);
    this.salesManager = salesManager;
  }
}
