import Axios, { AxiosInstance } from "axios";
import { TokenUser } from "@openiap/openflow-api";

export type SigninParams = { username: string; password: string };
export type Session = {
  user: Pick<
    TokenUser,
    "_id" | "_type" | "roles" | "name" | "username" | "dblocked"
  >;
  jwt: string;
} | null;
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
}

export const api = new Api();
