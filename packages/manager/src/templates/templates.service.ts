import { Injectable } from "@nestjs/common";
import { OpenflowService } from "src/openflow/openflow.service";

@Injectable()
export class TemplatesService {
  constructor(private readonly openflowService: OpenflowService) {}

  listTemplates(jwt: string) {
    return Promise.all([
      this.openflowService.listFormWorkflows(jwt),
      this.openflowService.listRobotWorkflows(jwt),
    ]).then((results) => results.flatMap((data) => data));
  }

  getTemplate(jwt: string, id: string, type: string) {
    return type === "openrpa"
      ? this.openflowService.getRobotWorkflow(jwt, id)
      : this.openflowService.getFormWorkflow(jwt, id);
  }
}
