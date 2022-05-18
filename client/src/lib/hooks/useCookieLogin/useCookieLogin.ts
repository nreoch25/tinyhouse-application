import { useEffect, useRef } from "react";
import { useMutation } from "@apollo/client";
import { LOG_IN_COOKIE } from "../../graphql/mutations";
import { LogInCookie as LogInCookieData } from "../../graphql/mutations/CookieLogin/__generated__/LogInCookie";
import { displayErrorMessage } from "../../utils";

interface useCookieLoginProps {
  onCompleted: (data: LogInCookieData) => void;
}

const useCookieLogin = ({ onCompleted }: useCookieLoginProps) => {
  const [logInCookie, { error }] = useMutation<LogInCookieData>(LOG_IN_COOKIE, {
    onCompleted,
    onError: () => {
      displayErrorMessage("We weren't able to log you in.");
    },
  });

  const logInCookieRef = useRef(logInCookie);

  useEffect(() => {
    logInCookieRef.current();
  }, []);

  return { logInCookie, error };
};

export { useCookieLogin };
