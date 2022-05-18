import { Alert } from "antd";

interface ErrorBannerProps {
  message?: string;
  description?: string;
}

const ErrorBanner = ({
  message = "Something went wrong",
  description = "Looks like something went wrong. Please check your internet connection and try again later",
}: ErrorBannerProps) => {
  return (
    <Alert
      banner
      closable
      message={message}
      description={description}
      type="error"
      className="error-banner"
    />
  );
};

export { ErrorBanner };
