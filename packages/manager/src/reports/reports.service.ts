import {
  Injectable,
  Logger,
  NotFoundException,
  StreamableFile,
} from "@nestjs/common";
import { OpenflowService } from "../openflow/openflow.service";
import { CryptService } from "../crypt/crypt.service";
import { ConfigProvider } from "../config/config.provider";
import { Session } from "../auth/auth.service";
import * as axios from "axios";
import { AxiosError } from "axios";

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService,
    private readonly config: ConfigProvider
  ) {}

  findAll(session: Session, query = {}) {
    return this.openflowService.queryCollection(this.cryptService.rootToken, {
      collectionname: "files",
      query: { "metadata.path": session.user._id, ...query },
    });
  }

  async checkExistence(session: Session, id: string) {
    const exists = await this.findAll(session, { _id: id }).then(
      (files) => files[0]
    );
    if (!exists) {
      throw new NotFoundException();
    }
  }

  async downloadFile(session: Session, id: string) {
    await this.checkExistence(session, id);

    return (
      axios
        // @ts-expect-error wrong types
        .get(`${this.config.OPENFLOW_URL}/download/${id}`, {
          headers: { Authorization: `${this.cryptService.rootToken}` },
          responseType: "stream",
        })
        .then((res) => {
          return new StreamableFile(res.data, {
            type: res.headers["content-type"],
            disposition: res.headers["content-disposition"],
            length: res.headers["content-length"],
          });
        })
        .catch((e: AxiosError) => {
          this.logger.error({
            message: "Can not get file",
            fileId: id,
            error: `${e.response.status}: ${e.response.statusText}`,
          });
          throw new NotFoundException("File not found");
        })
    );
  }

  async delete(session: Session, id: string) {
    await this.checkExistence(session, id);
    return this.openflowService.deleteOne(
      this.cryptService.rootToken,
      id,
      "files"
    );
  }
}
