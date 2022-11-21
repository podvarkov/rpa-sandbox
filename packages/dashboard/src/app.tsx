import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Trans } from "@lingui/macro";
import Layout from "./components/layout";
import { TemplatesPage } from "./pages/templates";
import { WorkflowsPage } from "./pages/workflows";
import { WorkflowRunnerPage } from "./pages/workflow-runner";
import { EditWorkflowPage } from "./pages/workflow-edit";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/workflows/execute/:id" element={<WorkflowRunnerPage />} />
        <Route path="/workflows/:id" element={<EditWorkflowPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route
          path="/executions"
          element={
            <div>
              <Trans>Executions</Trans>
            </div>
          }
        />
        <Route path="/*" element={<Navigate to="/templates" />} />
      </Route>
    </Routes>
  );
};

export default App;
