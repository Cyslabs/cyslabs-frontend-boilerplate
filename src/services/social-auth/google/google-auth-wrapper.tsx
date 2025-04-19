"use client";

import { useAuthGoogleLoginService } from "@/services/api/services/auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useEffect, useState, useRef } from "react";
import { FullPageLoader } from "@/components/material-ui/full-page-loader";
import useLanguage from "@/services/i18n/use-language";
type GoogleAuthWrapperProps = {
  type?: string; // nếu không bắt buộc truyền
};
const getGoogleWidth = () => {
  const width = window.innerWidth;
  if (width <= 415) return width - 82;
  if (width < 450) return 333;
  return 335;
};

export default function GoogleAuthWrapper({ type }: GoogleAuthWrapperProps) {
  const [googleWidth, setGoogleWidth] = useState(getGoogleWidth());
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const authGoogleLoginService = useAuthGoogleLoginService();
  const language = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const onSuccess = async (tokenResponse: CredentialResponse) => {
    if (!tokenResponse.credential) return;

    setIsLoading(true);

    const { status, data } = await authGoogleLoginService({
      idToken: tokenResponse.credential,
    });

    if (status === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const handleResize = () => setGoogleWidth(getGoogleWidth());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to programmatically click the Google button
  const triggerGoogleLogin = () => {
    if (googleButtonRef.current) {
      const googleDiv = googleButtonRef.current.querySelector(
        "div.nsm7Bb-HzV7m-LgbsSe-bN97Pc-sM5MNb"
      );
      if (googleDiv) {
        (googleDiv as HTMLDivElement).click();
      }
    }
  };

  return (
    <>
      {/* Custom button that matches your design */}
      <button
        type="button"
        onClick={triggerGoogleLogin}
        className="w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-black font-normal text-center hover:bg-gray-50 transition-all"
      >
        {type}
      </button>

      {/* Hidden original Google button */}
      <div ref={googleButtonRef} className="hidden">
        <GoogleLogin
          onSuccess={onSuccess}
          locale={language}
          theme="outline"
          shape="rectangular"
          text="continue_with" // Changed from "signin_with" to "continue_with"
          width={googleWidth}
        />
      </div>

      <FullPageLoader isLoading={isLoading} />
    </>
  );
}
