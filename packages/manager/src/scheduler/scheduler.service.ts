import { BadRequestException, Injectable } from "@nestjs/common";
import { RRule } from "rrule";
import { UpsertTaskDto } from "./upsert-task.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { ScheduledEvent } from "../openflow/types";

@Injectable()
export class SchedulerService {
  constructor(private readonly openflowService: OpenflowService) {}

  findEvents(jwt: string, query = {}) {
    return this.openflowService.queryCollection<ScheduledEvent>(jwt, {
      collectionname: "entities",
      query: { _type: "scheduled_event", ...query },
    });
  }

  findEvent(jwt: string, id: string) {
    return this.findEvents(jwt, { _id: id }).then((events) => events[0]);
  }

  async createEvent(jwt: string, params: UpsertTaskDto) {
    const rRule = new RRule(params.rrule.options);
    return await this.openflowService.insertOne<Partial<ScheduledEvent>>(jwt, {
      name: params.name,
      workflowId: params.name,
      rrule: rRule.options,
      _type: "scheduled_event",
    });
  }

  async updateEvent(jwt: string, params: UpsertTaskDto) {
    const rRule = new RRule(params.rrule.options);
    const event = await this.openflowService.updateOne<Partial<ScheduledEvent>>(
      jwt,
      {
        _id: params._id,
        name: params.name,
        workflowId: params.name,
        rrule: rRule.options,
        _type: "scheduled_event",
      }
    );
    if (!event?._id) {
      throw new BadRequestException();
    }

    return event;
  }

  async deleteEvent(jwt: string, id: string) {
    return this.openflowService.deleteOne(jwt, id);
  }
}
