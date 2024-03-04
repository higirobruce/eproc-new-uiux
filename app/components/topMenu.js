'use client'
import React, { useEffect, useState } from "react";
import {
  CopyOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  MessageOutlined,
  OrderedListOutlined,
  PieChartOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import {useRouter} from "next/navigation";
import Image from "next/image";
import { useUser } from "../context/UserContext";

const TopMenu = ({ setScreen, screen, handleLogout }) => {
  const [current, setCurrent] = useState(screen);
  const [items, setItems] = useState([]);
  const { user, login, logout } = useUser();
  let router = useRouter()

  useEffect(() => {}, [screen]);

  useEffect(() => {

    // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
    let _items = [];
    _items = [
      {
        label: <Image alt="" src="/favicon.png" width={30} height={30} />,
        key: user?.userType === "VENDOR" ? "system/tenders" : "system/dashboard",
        // icon: <LogoutOutlined className="text-red-400" />,
        // style: { marginTop: "5px" },
        // onClick: logout,
      },
      {
        // key: "username",
        label: `Hi, ${
          user.userType === "VENDOR"
            ? user?.contactPersonNames
            : user?.firstName
        }`,
        icon: <UserOutlined />,
        style: { marginLeft: "auto" },
        children: [
          {
            label: "My Profile",
            key: "system/profile",
          },
        ],
        // onClick: logout,
      },
      {
        key: "logout",
        label: "Logout",
        danger: true,
        icon: <LogoutOutlined className="text-red-400" />,
        // style: { marginLeft: "auto" },
        // onClick: logout,
      },
    ];
    setItems(_items);
  }, []);

  const _logout = () => {
    handleLogout(true);
    localStorage.removeItem("user");
    router.push("/auth")
    // handleLogout(false)
  };
  const onClick = (e) => {
    if (e.key === "logout") {
      _logout();
    } else {
      router.push(`/${e.key}`)
      // setScreen(e.key);
    }
    setCurrent(e.key);
    
  };

  return (
    <Menu
      className="w-screen fixed top-0 left-0 right-0 py-2 z-50"
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      theme="light"
      items={items}
      style={{ position: "sticky", zIndex: 1, width: "100%" }}
    />
  );
};

export default TopMenu;
