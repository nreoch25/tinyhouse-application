import { useEffect, useState } from "react";
import { Layout, Input } from "antd";
import { useHistory, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { MenuItems } from "./components";
import logo from "./assets/tinyhouse-logo.png";
import { Viewer } from "../../lib/types";
import { displayErrorMessage } from "../../lib/utils";

const { Header } = Layout;
const { Search } = Input;

interface AppHeaderProps {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const AppHeader = ({ viewer, setViewer }: AppHeaderProps) => {
  const [search, setSearch] = useState("");
  let history = useHistory();
  let location = useLocation();

  const onSearch = (value: string) => {
    const trimmedValue = value.trim();

    if (trimmedValue) {
      history.push(`/listings/${trimmedValue}`);
    } else {
      displayErrorMessage("Please enter a valid search!");
    }
  };

  useEffect(() => {
    const { pathname } = location;
    const pathnameSubStrings = pathname.split("/");

    if (!pathname.includes("/listings")) {
      setSearch("");
      return;
    }

    if (pathname.includes("/listings") && pathnameSubStrings.length === 3) {
      setSearch(pathnameSubStrings[2]);
    }
  }, [location]);

  return (
    <Header className="app-header">
      <div className="app-header__logo-search-section">
        <div className="app-header__logo">
          <Link to="/">
            <img src={logo} alt="App logo" />
          </Link>
        </div>
        <div className="app-header__search-input">
          <Search
            placeholder="Search 'San Fransisco'"
            enterButton
            onSearch={onSearch}
            onChange={(evt) => setSearch(evt.target.value)}
            value={search}
          />
        </div>
      </div>
      <div className="app-header__menu-section">
        <MenuItems viewer={viewer} setViewer={setViewer} />
      </div>
    </Header>
  );
};

export { AppHeader };
