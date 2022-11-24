import { Injectable } from "@nestjs/common";
import { UpsertWorkflowDto } from "src/workflows/upsert-workflow.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { ExecuteWorkflowDto } from "./execute-workflow.dto";
import { CryptService } from "src/crypt/crypt.service";

@Injectable()
export class WorkflowsService {
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly cryptService: CryptService
  ) {}

  upsert(jwt: string, workflow: UpsertWorkflowDto) {
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

  findAll(jwt: string) {
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

  findOne(jwt: string, id: string) {
    return this.openflowService.getUserWorkflow(jwt, id).then((workflow) => {
      return workflow
        ? {
            ...workflow,
            defaultArguments: JSON.parse(
              this.cryptService.decrypt(workflow.defaultArguments)
            ),
          }
        : null;
    });
  }

  async findOneWithTemplate(jwt: string, id: string) {
    const workflow = await this.findOne(jwt, id);
    if (workflow) {
      const template = await this.openflowService.getRobotWorkflow(
        jwt,
        workflow.templateId
      );
      return { ...workflow, template };
    }
    return null;
  }

  execute(jwt: string, body: ExecuteWorkflowDto) {
    return this.openflowService.executeWorkflow(jwt, body);
  }
}
