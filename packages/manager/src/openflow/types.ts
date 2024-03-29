import { Frequency, Weekday } from "rrule";
import { Rolemember } from "@openiap/openflow-api";

type Entity<T> = T & {
  _id: string;
  _created: string;
  _modified: string;
  _createdby: string;
  _createdbyid: string;
  _type: string;
  collection: string;
};

export type Workflow = Entity<{
  projectandname?: string;
  projectid?: string;
  description?: string;
  name: string;
  Parameters?: { type: string; direction: string; name: string }[];
}>;

export type UserWorkflow = Entity<{
  description?: string;
  name: string;
  templateId: string;
  arguments?: { [key: string]: unknown };
}>;

export type EncryptedUserWorkflow = Omit<UserWorkflow, "arguments"> & {
  arguments: string;
};

export type Execution = Entity<{
  correlationId: string;
  status:
    | "timeout"
    | "invokefailed"
    | "error"
    | "invokecompleted"
    | "queued"
    | "invokesuccess";
  startedAt: Date;
  finishedAt: Date;
  arguments: { [key: string]: unknown };
  output?: { [key: string]: unknown };
  error: string | null;
  robotId: string;
  workflowId: string;
  templateId: string;
}>;

export type ScheduledEvent = Entity<{
  workflowId: string;
  name: string;
  rrule: {
    wkst: Weekday;
    until: Date;
    dtstart: Date;
    freq?: Frequency;
    interval: number;
    preset: string;
    byweekday?: number[];
  };
}>;

export type User = Entity<{
  surname: string;
  name: string;
  furiganaSurname: string;
  furiganaMay: string;
  /**
   *  username = equals email
   */
  username: string;
  phone?: string;
  salesManagerId: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripeLastSessionId?: string;
  stripeProductId?: string;
  roles: Rolemember[];
}>;

export type SalesManager = Entity<{
  phone: string;
  fax: string;
  email: string;
  name: string;
}>;
