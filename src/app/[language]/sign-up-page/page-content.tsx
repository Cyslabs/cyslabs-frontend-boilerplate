"use client";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Label } from "@/components/shadcn-ui/label";
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";

import { Eye, EyeOff } from "lucide-react";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import {
  useAuthLoginService,
  useAuthSignUpService,
} from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn-ui/card";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import GoogleAuth from "@/services/social-auth/google/google-auth";
import { Checkbox } from "@/components/shadcn-ui/checkbox";

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  policy: TPolicy[];
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-up");

  return yup.object().shape({
    firstName: yup
      .string()
      .required(t("sign-up:inputs.firstName.validation.required")),
    lastName: yup
      .string()
      .required(t("sign-up:inputs.lastName.validation.required")),
    email: yup
      .string()
      .email(t("sign-up:inputs.email.validation.invalid"))
      .required(t("sign-up:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-up:inputs.password.validation.min"))
      .required(t("sign-up:inputs.password.validation.required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Please confirm your password"),
    policy: yup
      .array()
      .min(1, t("sign-up:inputs.policy.validation.required"))
      .required(),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-up");
  const { isSubmitting } = useFormState();

  return (
    <Button
      variant="default"
      color="primary"
      type="submit"
      size={"lg"}
      className="cursor-pointer"
      disabled={isSubmitting}
      data-testid="sign-up-submit"
    >
      {t("sign-up:actions.submit")}
    </Button>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const fetchAuthSignUp = useAuthSignUpService();
  const { t } = useTranslation("sign-up");
  const validationSchema = useValidationSchema();
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const policyOptions = [
    { id: "policy", name: t("sign-up:inputs.policy.agreement") },
  ];

  const methods = useForm<SignUpFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      policy: [],
    },
  });

  const {
    handleSubmit,
    setError,
    // eslint-disable-next-line no-restricted-syntax
    formState: { errors },
  } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { data: dataSignUp, status: statusSignUp } =
      await fetchAuthSignUp(formData);

    if (statusSignUp === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY) {
      (Object.keys(dataSignUp.errors) as Array<keyof SignUpFormData>).forEach(
        (key) => {
          setError(key, {
            type: "manual",
            message: t(
              `sign-up:inputs.${key}.validation.server.${dataSignUp.errors[key]}`
            ),
          });
        }
      );

      return;
    }

    const { data: dataSignIn, status: statusSignIn } = await fetchAuthLogin({
      email: formData.email,
      password: formData.password,
    });

    if (statusSignIn === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: dataSignIn.token,
        refreshToken: dataSignIn.refreshToken,
        tokenExpires: dataSignIn.tokenExpires,
      });
      setUser(dataSignIn.user);
    }
  });

  return (
    <div className="flex justify-center p-4 mt-10">
      <FormProvider {...methods}>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">{t("sign-up:title")}</CardTitle>
            <CardDescription>
              Enter your email below to sign up for an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex flex-col gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Full Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Type your name"
                    {...methods.register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message?.toString()}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">
                    {t("sign-up:inputs.email.label")}
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
                      {t("sign-up:inputs.password.label")}
                    </Label>
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
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      {...methods.register("confirmPassword")}
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
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword.message?.toString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="policy"
                      onCheckedChange={(checked) => {
                        if (checked) {
                          methods.setValue("policy", policyOptions);
                        } else {
                          methods.setValue("policy", []);
                        }
                      }}
                    />
                    <Label htmlFor="policy">
                      {t("sign-up:inputs.policy.agreement")}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {t("sign-up:inputs.policy.label")}
                      </Link>
                    </Label>
                  </div>
                  {errors.policy && (
                    <p className="text-sm text-red-500">
                      {t("sign-up:inputs.policy.validation.required")}
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
                    Already have an account{" "}
                    <Link
                      href="/sign-in"
                      className="underline underline-offset-4"
                    >
                      Sign in
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

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);
