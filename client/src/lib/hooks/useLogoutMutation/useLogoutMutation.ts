import { useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { LOG_OUT } from "../../graphql/mutations";
import { LogOut as LogOutData } from "../../graphql/mutations/LogOut/__generated__/LogOut";
import { Viewer } from "../../types";
import { displayErrorMessage, displaySuccessNotification } from "../../utils";

interface useLogoutMutationProps {
  setViewer: (viewer: Viewer) => void;
}

const useLogoutMutation = ({ setViewer }: useLogoutMutationProps) => {
  const history = useHistory();
  const [logOut] = useMutation<LogOutData>(LOG_OUT, {
    onCompleted: (data) => {
      if (data && data.logOut) {
        setViewer(data.logOut);
        sessionStorage.removeItem("token");
        displaySuccessNotification("You've successfully logged out!");
        history.push("/login");
      }
    },
    onError: () =>
      displayErrorMessage("Sorry! We weren't able to log you out. Please try again later!"),
  });

  const handleLogout = () => {
    logOut();
  };

  return { handleLogout };
};

export { useLogoutMutation };
