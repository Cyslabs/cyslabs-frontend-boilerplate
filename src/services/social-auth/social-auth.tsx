"use client";
import { isFacebookAuthEnabled } from "./facebook/facebook-config";
import { isGoogleAuthEnabled } from "./google/google-config";
import FacebookAuth from "./facebook/facebook-auth";
import GoogleAuth from "./google/google-auth";

export default function SocialAuth() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {isGoogleAuthEnabled && (
        <div className="w-full">
          <GoogleAuth />
        </div>
      )}
      {isFacebookAuthEnabled && (
        <div className="w-full">
          <FacebookAuth />
        </div>
      )}
    </div>
  );
}
