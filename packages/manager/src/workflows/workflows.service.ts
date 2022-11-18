import { Injectable } from "@nestjs/common";
import { CreateWorkflowDto } from "./create-workflow.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";
import { CryptService } from "src/crypt/crypt.service";

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService
  ) {}

  upsert(jwt: string, workflow: CreateWorkflowDto) {
    const workflowData = {
      ...workflow,
      defaultArguments: this.cryptService.encrypt(
        JSON.stringify(workflow.defaultArguments)
      ),
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
        defaultArguments: JSON.parse(
          this.cryptService.decrypt(workflow.defaultArguments)
        ),
      }))
    );
  }

  delete(jwt: string, id: string) {
    return this.openflowService.deleteUserWorkflow(jwt, id);
  }

  get(jwt: string, id: string) {
    return this.openflowService.getUserWorkflow(jwt, id).then((workflow) => ({
      ...workflow,
      defaultArguments: JSON.parse(
        this.cryptService.decrypt(workflow.defaultArguments)
      ),
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
