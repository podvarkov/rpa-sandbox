import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { RRule } from "rrule";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UpsertEventDto } from "src/scheduler/upsert-event.dto";
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
      query: {
        _type: "scheduled_event",
        ...query,
      },
    });
  }

  findEvent(jwt: string, id: string) {
    return this.findEvents(jwt, { _id: id }).then((events) => events[0]);
  }

  async createEvent(jwt: string, params: UpsertEventDto) {
    return await this.openflowService.insertOne<Partial<ScheduledEvent>>(jwt, {
      name: params.name,
      workflowId: params.workflowId,
      rrule: params.rrule.options,
      _type: "scheduled_event",
    });
  }

  async updateEvent(jwt: string, params: UpsertEventDto) {
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

  private parseDate(dateLike: string | Date | undefined): Date | undefined {
    if (!dateLike) return undefined;
    const date = new Date(dateLike);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  }

  async deleteEvent(jwt: string, id: string) {
    return this.openflowService.deleteOne(jwt, id);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async executeScheduledWorkflows() {
    const ts = this.parseDate(Date());
    this.logger.log({
      ts,
      message: "Scheduled workflows cron started",
    });

    const events = await this.findEvents(this.cryptService.rootToken, {
      _type: "scheduled_event",
      $or: [
        { "rrule.until": { $gte: ts.toISOString() } },
        { "rrule.until": false },
      ],
    });

    for (const event of events) {
      const rule = new RRule({
        wkst: event.rrule.wkst,
        dtstart: this.parseDate(event.rrule.dtstart),
        until: event.rrule.until
          ? this.parseDate(event.rrule.until)
          : undefined,
        freq: event.rrule.freq,
        interval: event.rrule.interval,
        count: undefined,
        byweekday: event.rrule.byweekday,
      });

      const nextRunAt = this.parseDate(rule.after(ts, true));

      if (nextRunAt && nextRunAt.getTime() === ts.getTime()) {
        const sessionUser = {
          username: event._createdby,
          _id: event._createdbyid,
        };
        const jwt = this.cryptService.generateToken(sessionUser);
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
        this.eventEmitter.emit(
          "workflow.queued",
          { jwt, user: sessionUser },
          workflow
        );
        this.logger.log({
          message: `Workflow with id:${workflow.workflowId} queued`,
          eventId: event._id,
        });
      }
    }
  }
}
