"use client";
import { Button } from "@/components/shadcn-ui/button";
import { Input } from "@/components/shadcn-ui/input";
import { Checkbox } from "@/components/shadcn-ui/checkbox";
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
import SocialAuth from "@/services/social-auth/social-auth";
import { isGoogleAuthEnabled } from "@/services/social-auth/google/google-config";
import { isFacebookAuthEnabled } from "@/services/social-auth/facebook/facebook-config";
import { useState } from "react";
import { Separator } from "@/components/shadcn-ui/separator";

const IS_SIGN_IN_ENABLED = true;

type TPolicy = {
  id: string;
  name: string;
};

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="max-w-sm w-full mx-auto space-y-4 mt-10 p-4 border rounded-lg shadow-sm"
      >
        <h1 className="text-xl font-semibold">{t("sign-up:title")}</h1>

        <div className="space-y-2">
          <Label htmlFor="firstName">
            {t("sign-up:inputs.firstName.label")}
          </Label>
          <Input
            id="firstName"
            type="text"
            {...methods.register("firstName")}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">
              {errors.firstName.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t("sign-up:inputs.lastName.label")}</Label>
          <Input id="lastName" type="text" {...methods.register("lastName")} />
          {errors.lastName && (
            <p className="text-sm text-red-500">
              {errors.lastName.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("sign-up:inputs.email.label")}</Label>
          <Input
            id="email"
            type="email"
            {...methods.register("email")}
            autoFocus
          />
          {errors.email?.type === "required" && (
            <p className="text-sm text-red-500">
              {errors.email.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("sign-up:inputs.password.label")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...methods.register("password")}
            />
            <Button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-200"
            >
              {showPassword ? (
                <EyeOff className="text-gray-600 hover:text-gray-800" />
              ) : (
                <Eye className="text-gray-600 hover:text-gray-800" />
              )}
            </Button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password.message?.toString()}
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

        <div className="flex flex-row gap-2 items-center mt-4">
          <FormActions />

          {IS_SIGN_IN_ENABLED && (
            <div className="text-center">
              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  data-testid="sign-in"
                >
                  {t("sign-up:actions.accountAlreadyExists")}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {[isGoogleAuthEnabled, isFacebookAuthEnabled].some(Boolean) && (
          <>
            <Separator />
            <div className="text-center text-sm text-muted-foreground mb-2">
              {t("sign-up:or")}
            </div>
            <SocialAuth />
          </>
        )}
      </form>
    </FormProvider>
  );
}

function SignUp() {
  return <Form />;
}

export default withPageRequiredGuest(SignUp);
