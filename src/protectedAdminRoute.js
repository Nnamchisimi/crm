import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children, setSnackbar }) => {
  const role = localStorage.getItem("userRole"); // read role from localStorage

  if (role !== "admin") {
    if (setSnackbar) {
      setSnackbar({
        open: true,
        message: "Access denied. Admins only.",
        severity: "error",
      });
    } else {
      alert("Access denied. Admins only.");
    }
    return <Navigate to="/adminsignin" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
