import { ChakraProvider } from "@chakra-ui/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import App from "./app";
import { AuthProvider, RequireAuth } from "./components/auth-provider";
import { ProgressProvider } from "./components/progress-provider";
import "./i18n";
import { SigninPage } from "./pages/sign-in";
import { SignupPage } from "./pages/sign-up";
import { theme } from "./theme";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.buildSha = process.env.REACT_APP_BUILD_SHA;
console.log("build from image: %s", process.env.REACT_APP_BUILD_SHA);

const queryClient = new QueryClient();

const Component: React.FC = () => {
  return (
    <I18nProvider i18n={i18n}>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <ProgressProvider>
            <ChakraProvider theme={theme}>
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
