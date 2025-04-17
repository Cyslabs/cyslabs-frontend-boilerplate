"use client";

import { useAuthGoogleLoginService } from "@/services/api/services/auth";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useEffect, useState } from "react";
import { FullPageLoader } from "@/components/material-ui/full-page-loader";
import useLanguage from "@/services/i18n/use-language";

const getGoogleWidth = () => {
  const width = window.innerWidth;
  if (width <= 415) return width - 82;
  if (width < 450) return 333; //415->333 414 -
  return 335;
};

export default function GoogleAuth() {
  const [googleWidth, setGoogleWidth] = useState(getGoogleWidth());
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const authGoogleLoginService = useAuthGoogleLoginService();
  const language = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <>
      <GoogleLogin
        onSuccess={onSuccess}
        locale={language}
        theme="outline"
        shape="rectangular"
        text="signin_with"
        width={googleWidth}
      />
      <FullPageLoader isLoading={isLoading} />
    </>
  );
}
