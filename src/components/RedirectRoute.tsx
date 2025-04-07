import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedirectRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; 
  if (user) return <Navigate to="/" />; 

  return <>{children}</>; 
};

export default RedirectRoute;