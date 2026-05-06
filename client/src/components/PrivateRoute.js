import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FaSpinner } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="page-loader auth-boot-loader">
        <FaSpinner className="send-spinner" />
        <span>Securing your workspace...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default PrivateRoute;
