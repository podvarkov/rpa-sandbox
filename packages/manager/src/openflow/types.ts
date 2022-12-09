import { Frequency, Weekday } from "rrule";

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
  defaultArguments?: { [key: string]: unknown };
  expiration: number;
}>;

export type EncryptedUserWorkflow = Omit<UserWorkflow, "defaultArguments"> & {
  defaultArguments: string;
};

export type Execution = Entity<{
  expiration: number;
  correlationId: string;
  status:
    | "timeout"
    | "invokefailed"
    | "error"
    | "invokecompleted"
    | "queued"
    | "invokesuccess";
  startedAt: Date;
  invokedAt: Date;
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

export type Profile = Entity<{
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
}>;
