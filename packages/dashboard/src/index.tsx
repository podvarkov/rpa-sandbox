import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./app";
import { AuthProvider, RequireAuth } from "./components/auth-provider";
import { SigninPage } from "./pages/sign-in";
import { SignupPage } from "./pages/sign-up";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <ChakraProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Outlet />}>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signin" element={<SigninPage />} />
              <Route
                path="/*"
                element={
                  <RequireAuth>
                    <App />
                  </RequireAuth>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </AuthProvider>
  </React.StrictMode>
);
