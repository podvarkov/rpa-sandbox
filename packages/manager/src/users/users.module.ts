import { Module } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { OpenflowModule } from "src/openflow/openflow.module";
import { CryptModule } from "src/crypt/crypt.module";

@Module({
  imports: [OpenflowModule, CryptModule],
  exports: [UsersService],
  providers: [UsersService],
})
export class UsersModule {}
