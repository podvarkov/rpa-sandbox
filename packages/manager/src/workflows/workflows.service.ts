import { Injectable } from "@nestjs/common";
import { UpsertWorkflowDto } from "./upsert-workflow.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";
import { CryptService } from "../crypt/crypt.service";
import { EncryptedUserWorkflow } from "../openflow/types";
import { TemplatesService } from "../templates/templates.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Session } from "src/auth/auth.service";

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService,
    private readonly templatesService: TemplatesService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  decryptArguments(workflow: EncryptedUserWorkflow) {
    return {
      ...workflow,
      defaultArguments: JSON.parse(
        this.cryptService.decrypt(workflow.defaultArguments)
      ),
    };
  }

  upsert(jwt: string, workflow: UpsertWorkflowDto) {
    const workflowData = {
      ...workflow,
      defaultArguments: this.cryptService.encrypt(
        JSON.stringify(workflow.defaultArguments)
      ),
    };

    if (workflow._id) {
      return this.openflowService.updateOne(jwt, workflowData);
    } else {
      return this.openflowService.insertOne(jwt, workflowData);
    }
  }

  findAll(jwt: string, query?: { [key: string]: unknown }) {
    return this.openflowService
      .queryCollection<EncryptedUserWorkflow>(jwt, {
        query: { ...query, _type: "user_workflow" },
        collectionname: "entities",
      })
      .then((workflows) =>
        workflows.map((workflow) => this.decryptArguments(workflow))
      );
  }

  findOne(jwt: string, id: string) {
    return this.findAll(jwt, { _id: id }).then((workflows) => workflows[0]);
  }

  delete(jwt: string, id: string) {
    return this.openflowService.deleteOne(jwt, id);
  }

  async findOneWithTemplate(jwt: string, id: string) {
    const workflow = await this.findOne(jwt, id);
    if (workflow) {
      const template = await this.templatesService.findOne(
        jwt,
        workflow.templateId
      );
      return { ...workflow, template };
    }
    return null;
  }

  execute(session: Session, body: ExecuteWorkflowDto) {
    this.eventEmitter.emit("workflow.queued", session, body);
    return { status: "queued" };
  }
}
