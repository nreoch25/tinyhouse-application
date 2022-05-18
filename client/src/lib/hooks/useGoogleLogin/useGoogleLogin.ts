import { useEffect, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GOOGLE_AUTH_URL } from "../../graphql/queries";
import { LOG_IN_GOOGLE } from "../../graphql/mutations";
import {
  LogInGoogle as LogInGoogleData,
  LogInGoogleVariables,
} from "../../graphql/mutations/GoogleLogin/__generated__/LogInGoogle";
import { displayErrorMessage } from "../../utils";

interface useGoogleLoginProps {
  onCompleted: (data: LogInGoogleData) => void;
}

const useGoogleLogin = ({ onCompleted }: useGoogleLoginProps) => {
  const [loadGoogleAuthUrl, { data: googleAuthUrlData, error: googleAuthUrlError }] =
    useLazyQuery(GOOGLE_AUTH_URL);

  const [
    logInGoogle,
    { data: logInGoogleData, loading: logInGoogleLoading, error: logInGoogleError },
  ] = useMutation<LogInGoogleData, LogInGoogleVariables>(LOG_IN_GOOGLE, {
    onCompleted,
    onError: () => {
      displayErrorMessage("We weren't able to log you in.");
    },
  });

  const logInGoogleRef = useRef(logInGoogle);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    const loginType = sessionStorage.getItem("loginType");
    if (code && loginType === "google") {
      logInGoogleRef.current({
        variables: {
          input: { code },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (googleAuthUrlData?.googleAuthUrl) {
      return (window.location.href = googleAuthUrlData.googleAuthUrl);
    }
    if (googleAuthUrlError) {
      displayErrorMessage("We weren't able to log you in.");
    }
  }, [googleAuthUrlData, googleAuthUrlError]);

  return { loadGoogleAuthUrl, logInGoogleData, logInGoogleLoading, logInGoogleError };
};

export { useGoogleLogin };
