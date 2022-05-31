import { Redirect } from "react-router-dom";
import { Card, Layout, Typography, Spin } from "antd";
import { ErrorBanner } from "../../lib/components/ErrorBanner";
import { Viewer } from "../../lib/types";
import googleLogo from "./assets/google_logo.jpg";
import linkedInLogo from "./assets/linkedIn_logo.jpg";
import { useGoogleLogin } from "../../lib/hooks/useGoogleLogin";
import { useLinkedInLogin } from "../../lib/hooks/useLinkedInLogin";
import { LogInGoogle as LogInGoogleData } from "../../lib/graphql/mutations/GoogleLogin/__generated__/LogInGoogle";
import { LogInLinkedIn as LogInLinkedInData } from "../../lib/graphql/mutations/LinkedInLogin/__generated__/LogInLinkedIn";
import { displaySuccessNotification } from "../../lib/utils";
import { useScrollTop } from "../../lib/hooks/useScrollTop";

interface LoginProps {
  setViewer: (viewer: Viewer) => void;
}

const { Content } = Layout;
const { Text, Title } = Typography;

const Login = ({ setViewer }: LoginProps) => {
  const onCompletedGoogle = (data: LogInGoogleData) => {
    if (data && data.logInGoogle && data.logInGoogle.token) {
      setViewer(data.logInGoogle);
      sessionStorage.setItem("token", data.logInGoogle.token);
      displaySuccessNotification("You've successfully logged in!");
      sessionStorage.removeItem("loginType");
    }
  };

  const onCompletedLinkedIn = (data: LogInLinkedInData) => {
    if (data && data.logInLinkedIn && data.logInLinkedIn.token) {
      setViewer(data.logInLinkedIn);
      sessionStorage.setItem("token", data.logInLinkedIn.token);
      displaySuccessNotification("You've successfully logged in!");
      sessionStorage.removeItem("loginType");
    }
  };

  const { loadGoogleAuthUrl, logInGoogleData, logInGoogleError, logInGoogleLoading } =
    useGoogleLogin({
      onCompleted: onCompletedGoogle,
    });

  const { loadLinkedInAuthUrl, logInLinkedInData, logInLinkedInError, logInLinkedInLoading } =
    useLinkedInLogin({
      onCompleted: onCompletedLinkedIn,
    });

  useScrollTop();

  if (logInGoogleLoading || logInLinkedInLoading) {
    return (
      <Content className="log-in">
        <Spin size="large" tip="Loggin you in..." />
      </Content>
    );
  }

  if (logInGoogleData?.logInGoogle) {
    const { id: viewerId } = logInGoogleData.logInGoogle;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  if (logInLinkedInData?.logInLinkedIn) {
    const { id: viewerId } = logInLinkedInData.logInLinkedIn;
    return <Redirect to={`/user/${viewerId}`} />;
  }

  const logInErrorBannerElement =
    logInGoogleError || logInLinkedInError ? (
      <ErrorBanner description="We weren't able to log you in." />
    ) : null;

  return (
    <Content className="log-in">
      {logInErrorBannerElement}
      <Card className="log-in-card">
        <div className="log-in-card__intro">
          <Title level={3} className="log-in-card__intro-title">
            <span role="img" aria-label="wave">
              👋
            </span>
          </Title>
          <Title level={3} className="log-in-card__intro-title">
            Login to NTRPDB!
          </Title>
        </div>
        <button
          className="log-in-card__button log-in-card__google"
          onClick={() => {
            sessionStorage.setItem("loginType", "google");
            loadGoogleAuthUrl();
          }}
        >
          <img src={googleLogo} alt="Google Logo" className="log-in-card__button-logo" />
          <span className="log-in-card__button-text">Sign in with Google</span>
        </button>
        <button
          className="log-in-card__button log-in-card__linkedin"
          onClick={() => {
            sessionStorage.setItem("loginType", "linkedIn");
            loadLinkedInAuthUrl();
          }}
        >
          <img src={linkedInLogo} alt="LinkedIn Logo" className="log-in-card__button-logo" />
          <span className="log-in-card__button-text">Sign in with LinkedIn</span>
        </button>
        <Text type="secondary">
          Note: By signing in, you'll be redirected to the consent form to sign in with your
          account.
        </Text>
      </Card>
    </Content>
  );
};

export { Login };
