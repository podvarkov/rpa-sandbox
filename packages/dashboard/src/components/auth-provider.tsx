import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { api, SigninParams, Session } from "../api";

interface AuthContextType {
  session: Session;
  signin: (data: SigninParams) => Promise<void>;
  signup: (data: SigninParams) => Promise<void>;
  signout: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AuthContext = createContext<AuthContextType>(null!);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState(api.restoreSession());

  useEffect(() => {
    api.onAuthStateChanged((newSession) => {
      console.log(newSession?.user.username);
      setSession(newSession);
    });
  }, []);

  const signin = (data: SigninParams) => {
    return api.signIn(data);
  };

  const signup = (data: SigninParams) => {
    return api.signUp(data);
  };

  const signout = () => {
    api.signOut();
  };

  const value = { session, signin, signout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }: { children: JSX.Element }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
