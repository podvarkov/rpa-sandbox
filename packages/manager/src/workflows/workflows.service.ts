import { Injectable } from "@nestjs/common";
import { UpsertWorkflowDto } from "./upsert-workflow.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { CryptService } from "../crypt/crypt.service";
import { EncryptedUserWorkflow } from "../openflow/types";
import { TemplatesService } from "../templates/templates.service";

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService,
    private readonly templatesService: TemplatesService
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

  async findAll(jwt: string, query?: { [key: string]: unknown }) {
    const workflows = await this.openflowService
      .queryCollection<EncryptedUserWorkflow>(jwt, {
        query: { ...query, _type: "user_workflow" },
        collectionname: "entities",
      })
      .then((workflows) =>
        workflows.map((workflow) => this.decryptArguments(workflow))
      );

    // check for availability by user role(subscription plan)
    const templateIds = await this.templatesService
      .findAll(jwt, {
        _id: { $in: workflows.map(({ templateId }) => templateId) },
      })
      .then((templates) => new Set(templates.map(({ _id }) => _id)));

    return workflows.map((workflow) => ({
      ...workflow,
      disabled: !templateIds.has(workflow.templateId),
    }));
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
}
