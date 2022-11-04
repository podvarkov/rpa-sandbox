import { Injectable } from "@nestjs/common";
import { CreateWorkflowDto } from "./create-workflow.dto";
import { OpenflowService } from "src/openflow-commander/openflow.service";

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
}
