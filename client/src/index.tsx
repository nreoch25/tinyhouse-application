import React, { useState } from "react";
import { render } from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { Layout, Affix, Spin } from "antd";
import {
  AppHeader,
  Home,
  Host,
  Listing,
  Listings,
  NotFound,
  User,
  Login,
  Stripe,
} from "./sections";
import { Viewer } from "./lib/types";
import { LogInCookie } from "./lib/graphql/mutations/CookieLogin/__generated__/LogInCookie";
import { useCookieLogin } from "./lib/hooks/useCookieLogin";
import "./styles/index.css";
import { AppHeaderSkeleton, ErrorBanner } from "./lib/components";

// TODO: move out apollo client
const httpLink = createHttpLink({
  uri: "/api",
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = sessionStorage.getItem("token") || "";
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      "X-CSRF-TOKEN": token,
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const initialViewer: Viewer = {
  id: null,
  token: null,
  avatar: null,
  hasWallet: null,
  didRequest: false,
};

const App = () => {
  const [viewer, setViewer] = useState<Viewer>(initialViewer);

  const onCompleted = (data: LogInCookie) => {
    if (data && data.logInCookie) {
      setViewer(data.logInCookie);
      if (data.logInCookie.token) {
        sessionStorage.setItem("token", data.logInCookie.token);
      } else {
        sessionStorage.removeItem("token");
      }
    }
  };

  const { error } = useCookieLogin({ onCompleted });

  if (!viewer.didRequest && !error) {
    return (
      <Layout className="app-skeleton">
        <AppHeaderSkeleton />
        <div className="app-skeleton__spin-section">
          <Spin size="large" tip="Launching Tinyhouse" />
        </div>
      </Layout>
    );
  }

  const logInErrorBannerElement = error ? (
    <ErrorBanner description="We weren't able to verify if you were logged in. Please try again later!" />
  ) : null;

  return (
    <Router>
      <Layout id="app">
        {logInErrorBannerElement}
        <Affix offsetTop={0} className="app__affix-header">
          <AppHeader viewer={viewer} setViewer={setViewer} />
        </Affix>
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route exact path="/host">
            <Host viewer={viewer} />
          </Route>
          <Route exact path="/listing/:id">
            <Listing viewer={viewer} />
          </Route>
          <Route exact path="/listings/:location?">
            <Listings />
          </Route>
          <Route exact path="/login">
            <Login setViewer={setViewer} />
          </Route>
          <Route exact path="/stripe">
            <Stripe viewer={viewer} setViewer={setViewer} />
          </Route>
          <Route exact path="/user/:id">
            <User viewer={viewer} setViewer={setViewer} />
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </Layout>
    </Router>
  );
};

render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
