import { Injectable } from "@nestjs/common";
import { CreateWorkflowDto } from "./create-workflow.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";
import * as crypto from "crypto";
import { ConfigProvider } from "../config/config.provider";

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly config: ConfigProvider
  ) {}

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

  upsert(jwt: string, workflow: CreateWorkflowDto) {
    const workflowData = {
      ...workflow,
      defaultArguments: this.encrypt(JSON.stringify(workflow.defaultArguments)),
    };

    if (workflow._id) {
      return this.openflowService.updateEntity(jwt, workflowData);
    } else {
      return this.openflowService.createEntity(jwt, workflowData);
    }
  }

  list(jwt: string) {
    return this.openflowService.listUserWorkflows(jwt).then((workflow) =>
      workflow.map((workflow) => ({
        ...workflow,
        defaultArguments: JSON.parse(this.decrypt(workflow.defaultArguments)),
      }))
    );
  }

  delete(jwt: string, id: string) {
    return this.openflowService.deleteUserWorkflow(jwt, id);
  }

  get(jwt: string, id: string) {
    return this.openflowService.getUserWorkflow(jwt, id).then((workflow) => ({
      ...workflow,
      defaultArguments: JSON.parse(this.decrypt(workflow.defaultArguments)),
    }));
  }

  async getWithTemplate(jwt: string, id: string) {
    const workflow = await this.get(jwt, id);
    const template = await this.openflowService.getRobotWorkflow(
      jwt,
      workflow.templateId
    );

    return { ...workflow, template };
  }

  execute(jwt: string, body: ExecuteWorkflowDto) {
    return this.openflowService.executeWorkflow(body);
  }
}
