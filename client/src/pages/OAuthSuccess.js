import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { acceptToken, syncCurrentUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const finalizeAuth = async () => {
      const token = searchParams.get("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        acceptToken(token);
        await syncCurrentUser();
        showToast({
          title: "Signed in with Google",
          message: "Your MindMate account is ready.",
          variant: "success"
        });
        navigate("/dashboard", { replace: true });
      } catch (_error) {
        showToast({
          title: "Google sign-in failed",
          message: "Please try again.",
          variant: "error"
        });
        navigate("/login", { replace: true });
      }
    };

    finalizeAuth();
  }, [acceptToken, navigate, searchParams, showToast, syncCurrentUser]);

  return (
    <div className="page-loader auth-boot-loader">
      <span>Finalizing your Google sign-in...</span>
    </div>
  );
}

export default OAuthSuccess;
