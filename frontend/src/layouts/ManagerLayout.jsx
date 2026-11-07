import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Manager Layout Shell
 * Child pages host their contextual workspace navigation and layout.
 */
const ManagerLayout = () => {
  return <Outlet />;
};

export default ManagerLayout;
