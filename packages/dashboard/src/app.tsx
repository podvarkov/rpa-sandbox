import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";

const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/templates" element={<div>Templates</div>} />
        <Route path="/workflows" element={<div>Workflows</div>} />
        <Route path="/executions" element={<div>Executions</div>} />
        <Route path="/*" element={<Navigate to="/templates" />} />
      </Route>
    </Routes>
  );
};

export default App;
