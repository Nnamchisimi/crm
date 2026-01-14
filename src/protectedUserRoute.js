// ProtectedUserRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedUserRoute = ({ children }) => {
  // Get role from localStorage
  const role = localStorage.getItem("role")?.toLowerCase();

  // If role is not 'user', redirect to sign-in
  if (role !== "user") {
    return <Navigate to="/signin" replace />;
  }

  // If role is 'user', allow access
  return children;
};

export default ProtectedUserRoute;
