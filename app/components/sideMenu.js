"use client";
import React, { useEffect, useState } from "react";
import {
  CopyOutlined,
  DollarOutlined,
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
import { useRouter, usePathname } from "next/navigation";
import { useRouter as nextRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

const SideMenu = ({ setScreen, screen, user }) => {
  let pathName = usePathname();
  let router = useRouter();
  const [current, setCurrent] = useState(pathName.substring(1));
  const [items, setItems] = useState([]);
  const [itemsSet, setItemsSet] = useState(false);
  useEffect(() => {}, [screen]);

  let parts = pathName.split("/");
  if (parts.length >= 3) {
    pathName = `/${parts[1]}/${parts[2]}`;
  }
  useEffect(() => {
    setCurrent(pathName.substring(1));
  }, [pathName]);

  useEffect(() => {
    let _items = [];
    if (user?.userType !== "VENDOR") {
      _items = [];
      if (user?.permissions?.canViewDashboard) {
        _items.push({
          label: "Dashboard",
          key: "system/dashboard",
          icon: (
            <PieChartOutlined
              size={28}
              className={`text-[${
                current == `system/dashboard` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }

      if (user?.permissions?.canViewRequests) {
        _items.push({
          label: "Purchase Requests",
          key: "system/requests",
          icon: (
            <SolutionOutlined
              size={28}
              className={`text-[${
                current == `system/requests` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }

      if (user?.permissions?.canViewTenders) {
        _items.push({
          label: "Tenders",
          key: "system/tenders",
          icon: (
            <MessageOutlined
              size={28}
              className={`text-[${
                current == `system/tenders` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }

      if (user?.permissions?.canViewContracts) {
        _items.push({
          label: "Contracts",
          key: "system/contracts",
          icon: (
            <FileDoneOutlined
              size={28}
              className={`text-[${
                current == `system/contracts` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }

      if (user?.permissions?.canViewPurchaseOrders) {
        _items.push({
          label: "Purchase Orders",
          key: "system/purchase-orders",
          icon: (
            <OrderedListOutlined
              size={28}
              className={`text-[${
                current == `system/purchase-orders` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }

      _items.push({
        label: "Payment requests",
        key: "system/payment-requests",
        icon: (
          <DollarOutlined
            size={28}
            className={`text-[${
              current == `system/payment-requests` ? `#1677FF` : `#95A1B3`
            }]`}
          />
        ),
      });

      if (user?.permissions?.canViewPurchaseOrders) {
      }

      if (user?.permissions?.canViewVendors) {
        _items.push({
          label: "Vendors",
          key: "system/vendors",
          icon: (
            <UsergroupAddOutlined
              size={28}
              className={`text-[${
                current == `system/vendors` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }

      if (user?.permissions?.canViewUsers) {
        _items.push({
          type: "divider",
        });

        _items.push({
          label: "Internal Users",
          key: "system/users",
          icon: (
            <UserOutlined
              size={28}
              className={`text-[${
                current == `system/dashboard` ? `#1677FF` : `#95A1B3`
              }]`}
            />
          ),
        });
      }
    } else {
      _items = [
        {
          label: "Tenders",
          key: "system/tenders",
          icon: <MessageOutlined size={28}
          className={`text-[${
            current == `system/tenders` ? `#1677FF` : `#95A1B3`
          }]`} />,
        },
        {
          label: "My Contracts",
          key: "system/contracts",
          icon: <FileDoneOutlined size={28}
          className={`text-[${
            current == `system/contracts` ? `#1677FF` : `#95A1B3`
          }]`} />,
        },
        {
          label: "My Purchase Orders",
          key: "system/purchase-orders",
          icon: <OrderedListOutlined size={28}
          className={`text-[${
            current == `system/purchase-orders` ? `#1677FF` : `#95A1B3`
          }]`} />,
        },
        {
          label: "My Payment requests",
          key: "system/payment-requests",
          icon: <DollarOutlined size={28}
          className={`text-[${
            current == `system/payment-requests` ? `#1677FF` : `#95A1B3`
          }]`} />,
        },
        // {
        //   key: "logout",
        //   label:"Logout",
        //   danger: true,
        //   icon: <LogoutOutlined className="text-red-400" />,
        //   // style: { marginTop: "780px", color:"#F97B7B"},
        //   // onClick: logout,
        // },
      ];
    }

    setItems(_items);
  }, []);

  useEffect(() => {
    setItemsSet(true);
  }, [items]);

  const logout = () => {
    localStorage.removeItem("user");
    router.push("/auth");
  };
  const onClick = (e) => {
    if (e.key === "logout") {
      logout();
    } else {
      router.push(`${e.key}`);
      // setScreen(e.key);
    }
    setCurrent(e.key);
  };

  if (!user) return;

  return (
    <div className="flex flex-col gap-10">
      {itemsSet &&
        items?.map((item) => {
          return (
            item.label &&
            item.label != "Internal Users" && (
              <Link
                href={item.key}
                className="no-underline flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {/* <PieChartOutlined size={28} className="text-[#1677FF]" /> */}
                  <span
                    className={`text-[18px] ${
                      current == item.key ? `text-[#1677FF]` : `text-[#95A1B3]`
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
                <div
                  className={`w-1 h-6 rounded ${
                    current == item.key ? `bg-[#1677FF]` : `bg-transparent`
                  }`}
                ></div>
              </Link>
            )
          );
        })}
    </div>
    // <Menu
    //   onClick={onClick}
    //   className="h-full"
    //   style={{top: '63px',width: '100%',position: 'fixed'
    //   }}
    //   selectedKeys={[current]}
    //   mode="vertical"
    //   items={items}
    // />
  );
};

export default SideMenu;
