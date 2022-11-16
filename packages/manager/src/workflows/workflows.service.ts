import { Injectable } from "@nestjs/common";
import { CreateWorkflowDto } from "./create-workflow.dto";
import { OpenflowService } from "src/openflow/openflow.service";
import { ExecuteWorkflowDto } from "src/workflows/execute-workflow.dto";

@Injectable()
export class WorkflowsService {
  constructor(private readonly openflowService: OpenflowService) {}

  upsert(jwt: string, workflow: CreateWorkflowDto) {
    if (workflow._id) {
      return this.openflowService.updateEntity(jwt, { ...workflow });
    } else {
      return this.openflowService.createEntity(jwt, { ...workflow });
    }
  }

  list(jwt: string) {
    return this.openflowService.listUserWorkflows(jwt);
  }

  delete(jwt: string, id: string) {
    return this.openflowService.deleteUserWorkflow(jwt, id);
  }

  get(jwt: string, id: string) {
    return this.openflowService.getUserWorkflow(jwt, id);
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
