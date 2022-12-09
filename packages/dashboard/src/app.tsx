import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
// import Layout from "./components/layout";
import SidebarWithHeader from "./components/sidebar";
import { BetaRpa } from "./pages/beta-rpa";
import { ExecutionDetailsPage } from "./pages/execution-details";
import { ExecutionsPage } from "./pages/executions";
import { Home } from "./pages/home";
import { MallInfo } from "./pages/mall-info";
import { ProfilePage } from "./pages/profile";
import { TemplatesPage } from "./pages/templates";
import { EditWorkflowPage } from "./pages/workflow-edit";
import { WorkflowRunnerPage } from "./pages/workflow-runner";
import { WorkflowsPage } from "./pages/workflows";
import { SchedulerPage } from "./pages/scheduler";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<SidebarWithHeader />}>
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/workflows/execute/:id" element={<WorkflowRunnerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/beta-rpa" element={<BetaRpa />} />
        <Route path="/workflows/:id" element={<EditWorkflowPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/executions/:id" element={<ExecutionDetailsPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
        <Route path="/schedule" element={<SchedulerPage />} />
        <Route path="/*" element={<Navigate to="/workflows" />} />
      </Route>

      <Route path="/mallinfo" element={<MallInfo />} />
    </Routes>
  );
};

export default App;
