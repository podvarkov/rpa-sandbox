import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { RRule } from "rrule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UpsertTaskDto } from "./upsert-task.dto";
import { OpenflowService } from "../openflow/openflow.service";
import { ScheduledEvent } from "../openflow/types";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CryptService } from "../crypt/crypt.service";
import { WorkflowsService } from "../workflows/workflows.service";
import { ExecuteWorkflowDto } from "../workflows/execute-workflow.dto";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  constructor(
    private readonly openflowService: OpenflowService,
    private readonly workflowsService: WorkflowsService,
    private readonly cryptService: CryptService,
    private readonly eventEmitter: EventEmitter2
  ) {}

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
    return await this.openflowService.insertOne<Partial<ScheduledEvent>>(jwt, {
      name: params.name,
      workflowId: params.workflowId,
      rrule: params.rrule.options,
      _type: "scheduled_event",
    });
  }

  async updateEvent(jwt: string, params: UpsertTaskDto) {
    const event = await this.openflowService.updateOne<Partial<ScheduledEvent>>(
      jwt,
      {
        _id: params._id,
        name: params.name,
        workflowId: params.workflowId,
        rrule: params.rrule.options,
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

  @Cron(CronExpression.EVERY_MINUTE)
  async executeScheduledWorkflows() {
    this.logger.log({
      message: "Scheduled workflows cron started",
      ts: new Date(),
    });

    const ts = new Date();
    ts.setSeconds(0);
    ts.setMilliseconds(0);

    const events = await this.findEvents(this.cryptService.rootToken, {
      _type: "scheduled_event",
      $or: [
        { "rrule.until": { $gte: `ISODate("${ts.toISOString()}")` } },
        { "rrule.until": false },
      ],
    });

    for (const event of events) {
      const rule = new RRule({
        wkst: event.rrule.wkst,
        dtstart: new Date(event.rrule.dtstart),
        until: event.rrule.until ? new Date(event.rrule.until) : undefined,
        freq: event.rrule.freq,
        interval: event.rrule.interval,
        count: undefined,
      });
      const nextRunAt = rule.after(ts, true);
      if (nextRunAt && nextRunAt.getTime() === ts.getTime()) {
        const jwt = this.cryptService.generateToken({
          username: event._createdby,
          id: event._createdbyid,
        });
        const workflow = await this.workflowsService
          .findOne(jwt, event.workflowId)
          .then((wf) => {
            const entity = new ExecuteWorkflowDto();
            entity.workflowId = wf._id;
            entity.templateId = wf.templateId;
            entity.arguments = wf.defaultArguments;
            entity.expiration = wf.expiration;
            return entity;
          });
        this.eventEmitter.emit("workflow.queued", jwt, workflow);
        this.logger.log(`Workflow with id:${workflow.workflowId} queued`);
      }
    }
  }
}
