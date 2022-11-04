import Axios, { AxiosInstance } from "axios";
import { TokenUser } from "@openiap/openflow-api";
import { WorkflowFormValues } from "./components/workflow-form";

export type SigninParams = { username: string; password: string };
export type Session = {
  user: Pick<
    TokenUser,
    "_id" | "_type" | "roles" | "name" | "username" | "dblocked"
  >;
  jwt: string;
} | null;

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
  Parameters?: { type: string; direction: string; name: string }[];
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

  getTemplate(type: string, id: string) {
    return this.axios
      .get<WorkflowTemplate>(`templates/${type}/${id}`)
      .then(({ data }) => data);
  }

  getWorkflows(signal?: AbortSignal) {
    return this.axios
      .get<Workflow[]>("workflows", { signal })
      .then(({ data }) => data);
  }

  upsertWorkflow(params: WorkflowFormValues) {
    return this.axios.post("workflows", params);
  }

  deleteWorkflow(id: string) {
    return this.axios.delete(`workflows/${id}`);
  }
}

export const api = new Api();
