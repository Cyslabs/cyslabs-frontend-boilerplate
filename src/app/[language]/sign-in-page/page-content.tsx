"use client";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthLoginService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import { useState } from "react";

import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
import { Eye, EyeOff } from "lucide-react";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import GoogleAuth from "@/services/social-auth/google/google-auth";

type SignInFormData = {
  email: string;
  password: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-in");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-in:inputs.email.validation.invalid"))
      .required(t("sign-in:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-in:inputs.password.validation.min"))
      .required(t("sign-in:inputs.password.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-in");
  const { isSubmitting } = useFormState();

  return (
    <Button
      variant="default"
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-in-submit"
      className="cursor-pointer"
    >
      {t("sign-in:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const { t } = useTranslation("sign-in");
  const validationSchema = useValidationSchema();

  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const methods = useForm<SignInFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    handleSubmit,
    setError,
    // eslint-disable-next-line no-restricted-syntax
    formState: { errors },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data, status } = await fetchAuthLogin(formData);

    if (status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(data.errors) as Array<keyof SignInFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-in:inputs.${key}.validation.server.${data.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user);
    }
  });

  return (
    <div className="flex justify-center p-4 mt-10">
      <FormProvider {...methods}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{t("sign-in:title")}</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {t("sign-in:inputs.email.label")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...methods.register("email")}
                    autoFocus
                  />
                  {errors.email?.message && (
                    <p className="text-sm text-red-500">
                      {errors.email.message.toString()}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      {t("sign-in:inputs.password.label")}
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      <span className="text-gray-700">
                        Forgot your password?
                      </span>
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      {...methods.register("password")}
                    />
                    <Button
                      type="button"
                      onClick={toggleShowPassword}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 p-2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-600" />
                      )}
                    </Button>
                  </div>
                  {errors.password?.message && (
                    <p className="text-sm text-red-500">
                      {errors.password.message.toString()}
                    </p>
                  )}
                </div>
                <FormActions />
                {[isGoogleAuthEnabled].some(Boolean) && (
                  <div className="w-full">
                    <GoogleAuth />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center text-sm">
                {IS_SIGN_UP_ENABLED && (
                  <div className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/sign-up"
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </FormProvider>
    </div>
  );
}

function SignIn() {
  return <Form />;
}

export default withPageRequiredGuest(SignIn);
