import { Link } from "react-router-dom";
import { Avatar, Button, Menu } from "antd";
import { HomeOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Viewer } from "../../../../lib/types";
import { useLogoutMutation } from "../../../../lib/hooks/useLogoutMutation";

const { Item, SubMenu } = Menu;

interface MenuItemsProps {
  viewer: Viewer;
  setViewer: (viewer: Viewer) => void;
}

const MenuItems = ({ viewer, setViewer }: MenuItemsProps) => {
  const { handleLogout } = useLogoutMutation({ setViewer });

  const subMenuLogin =
    viewer.id && viewer.avatar ? (
      <Item>
        <SubMenu title={<Avatar src={viewer.avatar} />}>
          <Item key="/user">
            <Link to={`/user/${viewer.id}`}>
              <UserOutlined style={{ marginRight: "5px" }} />
              Profile
            </Link>
          </Item>

          <Item key="/logout">
            <div onClick={handleLogout}>
              <LogoutOutlined style={{ marginRight: "5px" }} />
              Log out
            </div>
          </Item>
        </SubMenu>
      </Item>
    ) : (
      <Item>
        <Link to="/login">
          <Button type="primary">Sign In</Button>
        </Link>
      </Item>
    );

  return (
    <Menu mode="horizontal" selectable={false} className="menu">
      <Item key="/host">
        <Link to="/host">
          <HomeOutlined style={{ marginRight: "5px" }} />
          Host
        </Link>
      </Item>
      {subMenuLogin}
    </Menu>
  );
};

export { MenuItems };
