"use client";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Divider, Empty, Layout, Spin } from "antd";
import SideMenu from "../components/sideMenu";
import TopMenu from "../components/topMenu";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import {
  EnvelopeIcon,
  BellAlertIcon,
  ChevronDownIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import UserImage from "@/public/favicon.png";
import { Dropdown } from "antd";
import Logo from "@/public/icons/Blue Logo.png";
import { useUser } from "../context/UserContext";
import { RequestProvider } from "../context/RequestContext";
import { PaymentProvider } from "../context/PaymentContext";
import { VendorProvider } from "../context/VendorContext";
import { InternalProvider } from "../context/InternalContext";

export default function SystemLayout({ children }) {
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage?.getItem("user"));
  const { user, login, logout } = useUser();
  let [screen, setScreen] = useState("");
  let [loggedInUser, setLoggedInUser] = useState(null);
  let [loggingOut, setLoggingOut] = useState(false);
  let [token, setToken] = useState("");
  let [current, setCurrent] = useState("");
  let router = useRouter();
  let [noPermission, setNoPermissions] = useState(false);

  const items = [
    {
      key: "1",
      icon: <PencilSquareIcon className="w-4 h-4 text-gray-600" />,
      label: (
        <a rel="noopener noreferrer" href="/system/profile">
          Edit Profile
        </a>
      ),
    },

    {
      key: "4",
      danger: true,
      // icon: <ArrowLeftEndOnRectangleIcon className="w-4 h-4 text-red-700" />,
      label: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            logout();
            window.location.pathname = "/";
          }}
        >
          Log Out
        </a>
      ),
    },
  ];

  let pathName = usePathname();
  useEffect(() => {
    setLoggedInUser(user);
    // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
    setToken(localStorage.getItem("token"));
    if (user?.userType !== "VENDOR") setScreen("requests");
    else setScreen("tenders");

    if (user?.userType !== "VENDOR" && user) {
      const allFalse = Object.values(user?.permissions).every(
        (value) => value === false
      );
      setNoPermissions(allFalse);
    }
  }, []);

  // let parts = pathName.split('/')
  // if(parts.length>=3){
  //   pathName = `/${parts[1]}/${parts[2]}`
  // }
  // console.log(parts)
  useEffect(() => {
    setCurrent(pathName.substring(1));
  }, [pathName]);

  return (
    // <main>
    //   {(loggedInUser && token?.length>=1 ) && (
    //     <div className="flex flex-col">
    //       <TopMenu screen={screen} handleLogout={(v) => setLoggingOut(v)} />
    //       <Layout>
    //         <div className="hidden md:flex ">
    //           <Layout.Sider width={200}>
    //             <SideMenu
    //               user={loggedInUser}
    //               className="h-screen fixed top-0"
    //             />
    //           </Layout.Sider>
    //         </div>
    //         <Layout>
    //           <Layout.Content className="bg-gray-50 h-full z-0">
    //             <Spin
    //               spinning={loggingOut}
    //               indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
    //             >
    //               {children}
    //             </Spin>
    //           </Layout.Content>
    //         </Layout>
    //       </Layout>
    //     </div>
    //   )}

    //   {(!loggedInUser || !token) && (
    //     <div className="flex flex-col items-center justify-center h-screen w-full">
    //       {/* <Empty
    //         image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
    //         imageStyle={{
    //           height: 60,
    //         }}
    //         description={
    //           <span>Oups! You are not authorized to access the app!</span>
    //         }
    //       >
    //         <div>
    //           <Button type="link" onClick={() => router.push("/auth/signup")}>
    //             Sign up
    //           </Button>
    //           <Divider plain>Or</Divider>
    //           <Button type="link" onClick={() => router.push("/auth")}>
    //             Login
    //           </Button>
    //         </div>
    //       </Empty> */}
    //       <LockClosedIcon className="h-24 w-24 text-gray-300"/>
    //       <span className="cursor-pointer hover:underline text-blue-500 font-thin" onClick={()=>router.push(`/auth?goTo=${pathName}`)}>Sorry, you need to login first!</span>
    //     </div>
    //   )}
    // </main>
    <InternalProvider>
      <VendorProvider>
        <PaymentProvider>
          <RequestProvider>
            <main className="overflow-x-hidden bg-[#F1F3FF] w-full h-screen pb-20">
              {user && !noPermission && (
                <>
                  <div className="fixed bg-[#1677FF] w-full h-[260px]" />

                  <div className="fixed top-5 w-full h-screen flex gap-5">
                    <div
                      className={`relative bg-white w-[420px] min-h-fit mb-10 rounded-lg ml-4`}
                    >
                      <div className="payment-request flex flex-col justify-between h-full pl-8 pr-2 overflow-auto">
                        <div className="mt-12">
                          <div className="w-[152px]">
                            <Image
                              src={Logo}
                              alt=""
                              className="w-full h-auto"
                            />
                          </div>
                          <div className="mt-12">
                            {loggedInUser && (
                              <SideMenu
                                user={loggedInUser}
                                className="h-screen fixed top-0"
                              />
                            )}
                          </div>
                        </div>
                        {loggedInUser?.userType !== "VENDOR" &&
                          loggedInUser?.permissions?.canViewUsers && (
                            <div className="mb-10 mr-7">
                              <a
                                href="/system/users"
                                className="flex items-center bg-[#F2F4FD] w-[calc(100%-30px)] px-5 py-4 cursor-pointer rounded-lg border-0 gap-3 no-underline"
                              >
                                <UserGroupIcon className="w-5 h-5 text-[#1677FF]" />
                                <small className="font-medium text-[14.5px] text-[#1677FF]">
                                  User Management
                                </small>
                              </a>
                            </div>
                          )}
                      </div>
                    </div>
                    <div className="w-full h-screen">
                      <div className="flex justify-between items-center mr-5">
                        <div></div>
                        <div className="flex items-center gap-5">
                          {/* <div className="flex">
                  <EnvelopeIcon className="h-5 w-5 text-white" />
                  <div className="w-2.5 h-2.5 -ml-2 rounded-full bg-[#8CD0E8]" />
                </div>
                <div className="flex">
                  <BellAlertIcon className="h-5 w-5 text-white" />
                  <div className="w-2.5 h-2.5 -ml-2 rounded-full bg-[#FFD275]" />
                </div> */}
                          <div className="flex items-center gap-3 ml-3">
                            <div className="flex items-center gap-x-1">
                              <p className="text-[14px] font-medium text-white">
                                Hi,
                              </p>
                              <p className="text-[14px] font-medium text-white">
                                {user?.userType === "VENDOR"
                                  ? user?.contactPersonNames
                                  : user?.firstName}
                              </p>
                            </div>
                            {/* <Image src={UserImage} className="w-8 h-8 rounded-full" /> */}
                            <Dropdown
                              menu={{
                                items,
                              }}
                            >
                              <a onClick={(e) => e.preventDefault()}>
                                <ChevronDownIcon className="w-4 h-4 text-white" />
                              </a>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                      {!noPermission && children}
                    </div>
                  </div>
                </>
              )}

              {!user && (
                <div className="flex flex-col items-center justify-center h-screen w-full">
                  {/* <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{
                height: 60,
              }}
              description={
                <span>Oups! You are not authorized to access the app!</span>
              }
            >
              <div>
                <Button type="link" onClick={() => router.push("/auth/signup")}>
                  Sign up
                </Button>
                <Divider plain>Or</Divider>
                <Button type="link" onClick={() => router.push("/auth")}>
                  Login
                </Button>
              </div>
            </Empty> */}
                  <LockClosedIcon className="h-24 w-24 text-gray-300" />
                  <span
                    className="cursor-pointer hover:underline text-blue-500 font-thin"
                    onClick={() => router.push(`/auth?goTo=${pathName}`)}
                  >
                    Sorry, you need to login first!
                  </span>
                </div>
              )}

              {user && noPermission && (
                <div className="flex flex-col items-center justify-center h-screen w-full">
                  {/* <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              imageStyle={{
                height: 60,
              }}
              description={
                <span>Oups! You are not authorized to access the app!</span>
              }
            >
              <div>
                <Button type="link" onClick={() => router.push("/auth/signup")}>
                  Sign up
                </Button>
                <Divider plain>Or</Divider>
                <Button type="link" onClick={() => router.push("/auth")}>
                  Login
                </Button>
              </div>
            </Empty> */}
                  <LockClosedIcon className="h-24 w-24 text-gray-300" />
                  <span
                    className="cursor-pointer hover:underline text-blue-500 font-thin"
                    onClick={() => router.push(`/auth?goTo=${pathName}`)}
                  >
                    Sorry, you have no permission to use the system!
                  </span>
                </div>
              )}
            </main>
          </RequestProvider>
        </PaymentProvider>
      </VendorProvider>
    </InternalProvider>
  );
}
