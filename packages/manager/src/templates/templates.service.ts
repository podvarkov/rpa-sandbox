import { Injectable } from "@nestjs/common";
import { OpenflowService } from "../openflow/openflow.service";
import { Workflow } from "../openflow/types";

@Injectable()
export class TemplatesService {
  constructor(private readonly openflowService: OpenflowService) {}

  private filterSessionParams(workflow: Workflow): Workflow {
    return {
      ...workflow,
      Parameters: workflow.Parameters.filter(
        (param) => !param.name.startsWith("session_")
      ),
    };
  }

  findAll(jwt: string, query?: { [key: string]: unknown }) {
    return this.openflowService
      .queryCollection<Workflow>(jwt, {
        query: { _type: "workflow", ...query },
        projection: {
          _type: 1,
          name: 1,
          _created: 1,
          _modified: 1,
          projectid: 1,
          _created_by: 1,
          description: 1,
          Parameters: 1,
        },
        collectionname: "openrpa",
      })
      .then((data) => data.map((wf) => this.filterSessionParams(wf)));
  }

  findOne(jwt: string, id: string) {
    return this.findAll(jwt, { _id: id }).then((data) => data[0]);
  }
}
