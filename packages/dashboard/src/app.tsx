import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout";
import "./datepicker.css";
import { ExecutionDetailsPage } from "./pages/execution-details";
import { ExecutionsPage } from "./pages/executions";
import { Home } from "./pages/home";
import { MallInfo } from "./pages/mall-info";
import { PricingPage } from "./pages/pricing";
import { ProfilePage } from "./pages/profile";
import { ReportsPage } from "./pages/reports";
import { BetaRpa } from "./pages/robot";
import { SchedulerPage } from "./pages/scheduler";
import { TemplatesPage } from "./pages/templates";
import { EditWorkflowPage } from "./pages/workflow-edit";
import { WorkflowsPage } from "./pages/workflows";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/robot/:id" element={<BetaRpa />} />
        <Route path="/workflows/:id" element={<EditWorkflowPage />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/executions/:id" element={<ExecutionDetailsPage />} />
        <Route path="/executions" element={<ExecutionsPage />} />
        <Route path="/schedule" element={<SchedulerPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/*" element={<Navigate to="/workflows" />} />
      </Route>

      <Route path="/mallinfo" element={<MallInfo />} />
    </Routes>
  );
};

export default App;
