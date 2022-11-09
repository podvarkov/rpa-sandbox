import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import { TemplatesPage } from "./pages/templates";
import { WorkflowsPage } from "./pages/workflows";
import { WorkflowRunnerPage } from "./pages/workflow-runner";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/execute/:id" element={<WorkflowRunnerPage />} />
        <Route path="/executions" element={<div>Executions</div>} />
        <Route path="/*" element={<Navigate to="/templates" />} />
      </Route>
    </Routes>
  );
};

export default App;
