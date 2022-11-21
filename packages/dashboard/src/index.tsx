import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { AuthProvider, RequireAuth } from "./components/auth-provider";
import { SigninPage } from "./pages/sign-in";
import { SignupPage } from "./pages/sign-up";
import { ProgressProvider } from "./components/progress-provider";
import App from "./app";
import "./i18n";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

const Component = () => {
  return (
    <I18nProvider i18n={i18n}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ProgressProvider>
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
          </ProgressProvider>
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Component />
);
