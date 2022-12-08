import { TokenUser } from "@openiap/openflow-api";
import Axios, { AxiosInstance } from "axios";
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
  startedAt?: Date;
  invokedAt?: Date;
  finishedAt?: Date;
  arguments: { [key: string]: unknown };
  output?: { [key: string]: unknown };
  error: string | null;
  robotId: string;
  workflowId: string;
  templateId: string;
};

type AuthStateChangedCb = (user: Session) => void;

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
    params?: {
      top: number;
      skip: number;
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

  upsertEvent(params: any) {
    return this.axios.post("schedule", params);
  }
}

export const api = new Api();
