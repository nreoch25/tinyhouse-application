import { useEffect, useRef } from "react";
import { useLazyQuery, useMutation } from "@apollo/client";
import { LINKEDIN_AUTH_URL } from "../../graphql/queries";
import { LOG_IN_LINKEDIN } from "../../graphql/mutations";
import {
  LogInLinkedIn as LogInLinkedInData,
  LogInLinkedInVariables,
} from "../../graphql/mutations/LinkedInLogin/__generated__/LogInLinkedIn";
import { displayErrorMessage } from "../../utils";

interface useLinkedInLoginProps {
  onCompleted: (data: LogInLinkedInData) => void;
}

const useLinkedInLogin = ({ onCompleted }: useLinkedInLoginProps) => {
  const [loadLinkedInAuthUrl, { data: linkedInAuthUrlData, error: linkedInAuthUrlError }] =
    useLazyQuery(LINKEDIN_AUTH_URL);

  const [
    logInLinkedIn,
    { data: logInLinkedInData, loading: logInLinkedInLoading, error: logInLinkedInError },
  ] = useMutation<LogInLinkedInData, LogInLinkedInVariables>(LOG_IN_LINKEDIN, {
    onCompleted,
    onError: () => {
      displayErrorMessage("We weren't able to log you in.");
    },
  });

  const logInLinkedInRef = useRef(logInLinkedIn);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    const loginType = sessionStorage.getItem("loginType");
    if (code && loginType === "linkedIn") {
      logInLinkedInRef.current({
        variables: {
          input: { code },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (linkedInAuthUrlData?.linkedInAuthUrl) {
      return (window.location.href = linkedInAuthUrlData.linkedInAuthUrl);
    }
    if (linkedInAuthUrlError) {
      displayErrorMessage("We weren't able to log you in.");
    }
  }, [linkedInAuthUrlData, linkedInAuthUrlError]);

  return { loadLinkedInAuthUrl, logInLinkedInData, logInLinkedInLoading, logInLinkedInError };
};

export { useLinkedInLogin };
