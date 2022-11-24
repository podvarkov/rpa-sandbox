export type Workflow = {
  _id: string;
  projectandname?: string;
  projectid?: string;
  description?: string;
  name: string;
  _type: string;
  _modified: string;
  _created: string;
  _createdby: string;
  Parameters?: { type: string; direction: string; name: string }[];
  collection: string;
};
export type UserWorkflow = {
  _id: string;
  collection: string;
  description?: string;
  name: string;
  templateId: string;
  defaultArguments?: { [key: string]: unknown };
  _created: string;
  _modified: string;
  _createdby: string;
  _createdbyid: string;
  _type: string;
  expiration: number;
};
export type EncryptedUserWorkflow = Omit<UserWorkflow, "defaultArguments"> & {
  defaultArguments: string;
};
export type Execution = {
  _id: string;
  collection: string;
  _created: string;
  _modified: string;
  _createdby: string;
  _createdbyid: string;
  _type: string;
  expiration: number;
  correlationId: string;
  status:
    | "timeout"
    | "invokefailed"
    | "error"
    | "invokecompleted"
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
};
