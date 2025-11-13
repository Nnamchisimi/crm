import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Homepage } from "./homepage";
import { SignIn } from "./signin";
import { AdminSignIn } from "./adminsignin";
import { SignUp } from "./signup";
import Dashboard from "./dashboard";
import { Admin } from "./admin";
import Header from "./Header";
import AddVehicle from "./addVehicle"
import Newsletter from "./newsletter";
import ProtectedAdminRoute from "./protectedAdminRoute"; // import the protected route

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSignOut = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    alert("Signed out successfully!");
  };

  return (
    <BrowserRouter>
      <AppContent
        isLoggedIn={isLoggedIn}
        onSignOut={handleSignOut}
        setIsLoggedIn={setIsLoggedIn}
      />
    </BrowserRouter>
  );
}

function AppContent({ isLoggedIn, onSignOut, setIsLoggedIn }) {
  const location = useLocation();

  // pages where the Header SHOULD appear
  const showHeaderPaths = ["/", "/newsletter", "/admin"];

  const showHeader = showHeaderPaths.includes(location.pathname);

  return (
    <>
      {showHeader && <Header isLoggedIn={isLoggedIn} onSignOut={onSignOut} />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/adminsignin" element={<AdminSignIn setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/signup" element={<SignUp setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/addVehicle"element={<AddVehicle setIsLoggedIn={setIsLoggedIn}/>}/>
        <Route path ="/newsletter"element={<Newsletter setIsLoggedIn={setIsLoggedIn}/>}/>

        {/* Protected admin-only routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <Admin />
            </ProtectedAdminRoute>
          }
        />

   
      </Routes>
    </>
  );
}

export default AppWrapper;
