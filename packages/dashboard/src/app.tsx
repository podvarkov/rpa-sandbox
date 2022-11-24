import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { TemplatesPage } from "./pages/templates";
import { WorkflowsPage } from "./pages/workflows";
import { WorkflowRunnerPage } from "./pages/workflow-runner";
import { EditWorkflowPage } from "./pages/workflow-edit";
import { ExecutionsPage } from "./pages/executions";
import { ExecutionDetailsPage } from "./pages/execution-details";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/workflows/execute/:id" element={<WorkflowRunnerPage />} />
        <Route path="/workflows/:id" element={<EditWorkflowPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/executions/:id" element={<ExecutionDetailsPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
        <Route path="/*" element={<Navigate to="/workflows" />} />
      </Route>
    </Routes>
  );
};

export default App;
