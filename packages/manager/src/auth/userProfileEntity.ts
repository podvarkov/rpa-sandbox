import { Expose } from "class-transformer";

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

  constructor(partial: Partial<UserProfileEntity>) {
    Object.assign(this, partial);
  }
}
