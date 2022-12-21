import { TokenUser } from "@openiap/openflow-api";
import Axios, { AxiosInstance } from "axios";
import { EventFormValues } from "./components/scheduler-form";
import { WorkflowFormValues } from "./components/workflow-form";

export type SigninParams = { username: string; password: string };
export type Session = {
  user: Pick<
    TokenUser,
    "_id" | "_type" | "roles" | "name" | "username" | "dblocked"
  >;
  jwt: string;
} | null;

export enum ParametersType {
  "BOOLEAN" = "System.Boolean",
  "ARRAY<BOOLEAN>" = "System.Boolean[]",
  "NUMBER" = "System.Int32",
  "ARRAY<NUMBER>" = "System.Int32[]",
  "OBJECT" = "System.Object",
  "ARRAY<OBJECT>" = "System.Object[]",
  "STRING" = "System.String",
  "ARRAY<STRING>" = "System.String[]",
}

export type WorkflowTemplate = {
  _id: string;
  projectandname?: string;
  projectid?: string;
  description?: string;
  logoSrc?: string;
  humanReadableName?: string;
  name: string;
  _type: string;
  _modified: string;
  _created: string;
  _createdby: string;
  Parameters?: {
    type: ParametersType;
    direction: string;
    name: string;
  }[];
  collection: string;
};

export type Workflow = {
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
  startedAt?: string;
  invokedAt?: string;
  finishedAt?: string;
  arguments: { [key: string]: unknown };
  output?: { [key: string]: unknown };
  error: string | null;
  robotId: string;
  workflowId: string;
  templateId: string;
};

export type ScheduledEvent = {
  _id: string;
  collection: string;
  _created: string;
  _modified: string;
  _createdby: string;
  _createdbyid: string;
  _type: string;
  workflowId: string;
  name: string;
  rrule: {
    until?: string;
    dtstart: string;
    freq: number | undefined;
    interval: number;
    preset: string;
    byweekday?: number[];
  };
};

export type Profile = {
  _id: string;
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
  salesManager?: {
    _id: string;
    phone: string;
    fax: string;
    email: string;
    name: string;
  };
};

export type UpdatableProfile = Omit<Profile, "_id" | "salesManagerId">;

export type File = {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
  contentType: string;
  metadata: {
    filename: string;
    path: string;
    name: string;
  };
};

type AuthStateChangedCb = (user: Session) => void;
type PaginationParams = { top: number; skip: number };

export type SendInquiry = {
  surname: string;
  name: string;
  furiganaSurname: string;
  furiganaMay: string;
  phone: string;
  username: string;
  inquiry: string;
};

class Api {
  private axios: AxiosInstance;
  private session: Session = null;
  private authStateChangedCb?: AuthStateChangedCb;

  constructor() {
    this.axios = Axios.create({ baseURL: "/api" });
    this.applySession(this.restoreSession());
  }

  restoreSession() {
    if (this.session) return this.session;
    const session = localStorage.getItem("session");
    if (session) {
      return JSON.parse(session) as Session;
    }
    return null;
  }

  applySession(session: Session) {
    localStorage.setItem("session", JSON.stringify(session));
    this.session = session;
    // eslint-disable-next-line string-to-lingui/missing-lingui-transformation
    this.axios.defaults.headers.Authorization = `Bearer ${this.session?.jwt}`;
    if (this.authStateChangedCb) this.authStateChangedCb(session);
  }

  public signIn(params: SigninParams) {
    return this.axios.post<Session>("auth/signin", params).then(({ data }) => {
      this.applySession(data);
    });
  }

  public signOut() {
    this.applySession(null);
  }

  public signUp(params: SigninParams) {
    return this.axios
      .post("auth/signup", params)
      .then(() => this.signIn(params));
  }

  onAuthStateChanged(cb: AuthStateChangedCb) {
    this.authStateChangedCb = cb;
  }

  getTemplates(signal?: AbortSignal) {
    return this.axios
      .get<WorkflowTemplate[]>("templates", { signal })
      .then(({ data }) => data);
  }

  getTemplate(type: string, id: string, signal?: AbortSignal) {
    return this.axios
      .get<WorkflowTemplate>(`templates/${type}/${id}`, { signal })
      .then(({ data }) => data);
  }

  getWorkflows(signal?: AbortSignal) {
    return this.axios
      .get<Workflow[]>("workflows", { signal })
      .then(({ data }) => data);
  }

  getWorkflow(id: string, signal?: AbortSignal) {
    return this.axios
      .get<Workflow>(`workflows/${id}`, { signal })
      .then(({ data }) => data);
  }

  getWorkflowWithTemplate(id: string, signal?: AbortSignal) {
    return this.axios
      .get<Workflow & { template: WorkflowTemplate }>(
        `workflows/${id}?withTemplate=true`,
        { signal }
      )
      .then(({ data }) => data);
  }

  upsertWorkflow(params: WorkflowFormValues) {
    return this.axios
      .post<Workflow>("workflows", params)
      .then(({ data }) => data);
  }

  deleteWorkflow(id: string) {
    return this.axios
      .delete<{ id: string }>(`workflows/${id}`)
      .then(({ data }) => data);
  }

  executeWorkflow(data: {
    expiration: number;
    workflowId: string;
    templateId: string;
    arguments: { [key: string]: unknown };
  }) {
    return this.axios.post("workflows/execute", data);
  }

  getExecutions(
    signal?: AbortSignal,
    params?: PaginationParams & {
      workflowId: string | null;
      status: string | null;
      orderBy: string | null;
      direction: string | null;
    }
  ) {
    return this.axios
      .get<Execution[]>("executions", { signal, params })
      .then(({ data }) => data);
  }

  getExecution(id: string, signal?: AbortSignal) {
    return this.axios
      .get<Execution>(`executions/${id}`, { signal })
      .then(({ data }) => data);
  }

  getEvents(signal?: AbortSignal, params?: PaginationParams) {
    return this.axios
      .get<ScheduledEvent[]>("schedule/events", { signal, params })
      .then(({ data }) => data);
  }
  upsertEvent(params: EventFormValues) {
    return this.axios.post("schedule", params);
  }

  deleteEvent(id: string) {
    return this.axios
      .delete<{ id: string }>(`schedule/${id}`)
      .then(({ data }) => data);
  }

  getProfile(signal?: AbortSignal) {
    return this.axios
      .get<Profile>("auth/profile", { signal })
      .then(({ data }) => data);
  }

  updateProfile(profile: UpdatableProfile) {
    return this.axios
      .post<Profile>("auth/profile", profile)
      .then(({ data }) => data);
  }

  getReports(signal?: AbortSignal, params?: PaginationParams) {
    return this.axios
      .get<File[]>("reports", { signal, params })
      .then(({ data }) => data);
  }

  deleteReport(id: string) {
    return this.axios
      .delete<{ id: string }>(`reports/${id}`)
      .then(({ data }) => data);
  }
  SendInquiryToManager(profileInfoAndMsg: SendInquiry) {
    console.log(profileInfoAndMsg);
    return this.axios
      .post(
        "https://coreus-rpa.dev.app.thezeroone.io/api/wf/webhook/240d7e1e-2382-49f0-a314-5554c89496b9",
        profileInfoAndMsg
      )
      .then(({ data }) => data);
  }
}

export const api = new Api();
