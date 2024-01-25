"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import _ from "lodash";
import {
  Typography,
  Button,
  Tag,
  Segmented,
  Form,
  Checkbox,
  Select,
  Spin,
  Switch,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  BarsOutlined,
  EditOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PhoneOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { EnvelopeIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import PermissionsTable from "../../../components/permissionsTable";
import { useRouter } from "next/navigation";
import { encode } from "base-64";
import { motion } from "framer-motion";
import { LuUser } from "react-icons/lu";
import { PiBagSimpleBold } from "react-icons/pi";
import { MdOutlineAlternateEmail, MdPhoneAndroid } from "react-icons/md";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getUserDetails(id, router) {
  const res = await fetch(`${url}/users/internalUserById/${id}`, {
    headers: {
      Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth");
    } 
    // This will activate the closest `error.js` Error Boundary
    // console.log(id);
    return null;
    // throw new Error("Failed to fetch data");
  }
  // console.log(res.json())
  return res.json();
}

export default function page({ params }) {
  let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== 'undefined' && localStorage.getItem('token');
  let router = useRouter();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  let [dataset, setDataset] = useState([]);
  let [tempDataset, setTempDataset] = useState([]);
  let [updatingId, setUpdatingId] = useState("");
  let [row, setRow] = useState(null);
  let [segment, setSegment] = useState("Permissions");
  let [usersRequests, setUsersRequests] = useState([]);

  let [submitting, setSubmitting] = useState(false);
  let [type, setType] = useState("VENDOR");
  let [dpts, setDpts] = useState([]);
  let [servCategories, setServCategories] = useState([]);

  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const [editUser, setEditUser] = useState(false);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    getUserDetails(params?.id, router).then((res) => {
      setRow(res);
    });

    fetch(`${url}/dpts`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,

        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setDpts(res);
        
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });
  }, []);

  function loadUsersRequests() {
    fetch(`${url}/requests/byCreator/${row?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setUsersRequests(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function loadUsers() {
    setDataLoaded(false);
    fetch(`${url}/users/internal`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setDataLoaded(true);
        setDataset(res);
        setTempDataset(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function setCanView(canView, module) {
    let newUser = { ...row };
    let permissionLable = "canView" + module;
    if (!newUser.permissions) newUser.permissions = {};
    newUser.permissions[permissionLable] = canView;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        setRow(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });

    fetch(`${url}/dpts`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setDpts(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });
  }

  function setCanApproveAsHod(can) {
    let newUser = { ...row };
    let permissionLable = "canApproveAsHod";
    newUser.permissions[permissionLable] = can;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        setRow(res);
      })
      .catch((err) => {
        // messageApi.open({
        //   type: "error",
        //   content: "Something happened! Please try again.",
        // });
      });
  }

  function setCanApproveAsHof(can) {
    let newUser = { ...row };
    let permissionLable = "canApproveAsHof";
    newUser.permissions[permissionLable] = can;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        setRow(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function setCanApproveAsPM(can) {
    let newUser = { ...row };
    let permissionLable = "canApproveAsPM";
    newUser.permissions[permissionLable] = can;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        loadUsers();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function setCanApproveAsLegal(can) {
    let newUser = { ...row };
    let permissionLable = "canApproveAsLegal";
    newUser.permissions[permissionLable] = can;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        loadUsers();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function setCanApprove(canApprove, module) {
    let newUser = { ...row };
    let permissionLable = "canApprove" + module;
    newUser.permissions[permissionLable] = canApprove;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        loadUsers();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function setCanCreated(canCreate, module) {
    let newUser = { ...row };
    let permissionLable = "canCreate" + module;
    let editPermissionLable = "canEdit" + module;
    let viewPermissionLable = "canView" + module;

    newUser.permissions[permissionLable] = canCreate;
    if(module!=='PaymentRequests') newUser.permissions[editPermissionLable] = canCreate;
    newUser.permissions[viewPermissionLable] = canCreate;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        loadUsers();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function setCanEdit(canEdit, module) {
    let newUser = { ...row };
    let permissionLable = "canEdit" + module;
    newUser.permissions[permissionLable] = canEdit;

    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newUser }),
    })
      .then((res) => res.json())
      .then((res) => {
        loadUsers();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function createUser(newUser) {
    let permissions = {};
    newUser?.permissions?.map((p) => {
      permissions[p] = true;
    });

    newUser.permissions = permissions;
    newUser.password = "password";
    newUser.tempPassword = "p";
    newUser.createdBy = user?._id;
    newUser.userType = "DPT-USER";
    newUser.status = "approved";
    newUser.companyName = newUser?.firstName + " " + newUser?.lastName;
    fetch(`${url}/users`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((res) => {
        loadUsers();
        form.resetFields();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateUser() {
    fetch(`${url}/users/${row?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newUser: {
          firstName: row?.firstName,
          lastName: row?.lastName,
          email: row?.email,
          telephone: row?.telephone,
          department: row?.department?._id,
        },
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setRow(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updatePassword() {
    setSubmitting(true);
    fetch(`${url}/users/reset/${row?.email}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        messageApi.open({
          type: "info",
          content: "User password was successfully reset.",
        });
        setRow(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <div
      className="payment-request flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-6 mt-6 h-screen pb-1 mb-32 overflow-y-auto"
    >
      {contextHolder}
      <div className="flex flex-col space-y-5">
        {/* <div className="flex flex-row justify-between">
          <div className="flex flex-row items-center space-x-2">
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                type="primary"
                onClick={() => {
                  router.push("/system/users");
                }}
              >
                Back to users
              </Button>
            </div>
            {editUser && (
              <div>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={() => {
                    setEditUser(false);
                    updateUser();
                  }}
                />
              </div>
            )}
          </div>

          {user?.permissions?.canEditUsers && (
            <div>
              <Switch
                checkedChildren={<EditOutlined />}
                unCheckedChildren={<EyeOutlined />}
                defaultChecked={editUser}
                checked={editUser}
                onChange={(checked) => {
                  setEditUser(checked);
                }}
              />
            </div>
          )}
        </div> */}

        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {/* Data */}
          <div className="flex flex-col space-y-5">
            <div className="bg-white rounded-lg shadow px-5 pb-7">
              <h5 className="text-[17px] text-[#263238]">General Information</h5>
              <div className="flex flex-col gap-y-4">
                <small className="text-[13px] text-[#ADB6BF]">ABOUT</small>
                <div className="flex items-center gap-x-5 my-2">
                  <LuUser  className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">{row?.firstName} {row?.lastName}</h6>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                  <PiBagSimpleBold  className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">{row?.department?.description}</h6>
                </div>
                <div className="flex items-center gap-x-5">
                  
                  {/* <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">{row?.firstName} {row?.lastName}</h6> */}
                </div>
              </div>
              <div className="flex flex-col gap-y-4 mt-5">
                <small className="text-[13px] text-[#ADB6BF]">CONTACT</small>
                <div className="flex items-center gap-x-5 my-2">
                  <MdOutlineAlternateEmail  className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">{row?.email}</h6>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                <MdPhoneAndroid className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">{row?.telephone}</h6>
                </div>
                
              </div>
            </div>

            {/* Reset password */}
            {/* {user?.permissions?.canEditUsers && (
              <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
                <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                  <div>Reset password</div>
                </div>
                <Form
                  // {...formItemLayout}
                  form={passwordForm}
                  name="resetPassword"
                  onFinish={updatePassword}
                  scrollToFirstError
                  style={{ width: "100%" }}
                >
                  <Form.Item>
                    {submitting ? (
                      <Spin indicator={antIcon} />
                    ) : (
                      <div className="flex flex-row items-center justify-between">
                        <Button type="primary" danger htmlType="submit">
                          Update user password
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                </Form>
              </div>
            )} */}
          </div>

          {/* Transactions */}
          <div className="col-span-2 flex flex-col space-y-5 p-5">
            <PermissionsTable
              canApproveRequests={row?.permissions?.canApproveRequests}
              canCreateRequests={row?.permissions?.canCreateRequests}
              canEditRequests={row?.permissions?.canEditRequests}
              canViewRequests={row?.permissions?.canViewRequests}
              canApprovePaymentRequests={row?.permissions?.canApprovePaymentRequests}
              canCreatePaymentRequests={row?.permissions?.canCreatePaymentRequests}
              canEditPaymentRequests={row?.permissions?.canEditPaymentRequests}
              canViewPaymentRequests={row?.permissions?.canViewPaymentRequests}
              canApproveTenders={row?.permissions?.canApproveTenders}
              canCreateTenders={row?.permissions?.canCreateTenders}
              canEditTenders={row?.permissions?.canEditTenders}
              canViewTenders={row?.permissions?.canViewTenders}
              canApproveBids={row?.permissions?.canApproveBids}
              canCreateBids={row?.permissions?.canCreateBids}
              canEditBids={row?.permissions?.canEditBids}
              canViewBids={row?.permissions?.canViewBids}
              canApproveContracts={row?.permissions?.canApproveContracts}
              canCreateContracts={row?.permissions?.canCreateContracts}
              canEditContracts={row?.permissions?.canEditContracts}
              canViewContracts={row?.permissions?.canViewContracts}
              canApprovePurchaseOrders={
                row?.permissions?.canApprovePurchaseOrders
              }
              canCreatePurchaseOrders={
                row?.permissions?.canCreatePurchaseOrders
              }
              canEditPurchaseOrders={
                row?.permissions?.canEditPurchaseOrders
              }
              canViewPurchaseOrders={
                row?.permissions?.canViewPurchaseOrders
              }
              canApproveVendors={row?.permissions?.canApproveVendors}
              canCreateVendors={row?.permissions?.canCreateVendors}
              canEditVendors={row?.permissions?.canEditVendors}
              canViewVendors={row?.permissions?.canViewVendors}
              canApproveUsers={row?.permissions?.canApproveUsers}
              canCreateUsers={row?.permissions?.canCreateUsers}
              canEditUsers={row?.permissions?.canEditUsers}
              canViewUsers={row?.permissions?.canViewUsers}
              canApproveDashboard={row?.permissions?.canApproveDashboard}
              canCreateDashboard={row?.permissions?.canCreateDashboard}
              canEditDashboard={row?.permissions?.canEditDashboard}
              canViewDashboard={row?.permissions?.canViewDashboard}
              handleSetCanView={setCanView}
              handleSetCanCreated={setCanCreated}
              handleSetCanEdit={setCanEdit}
              handleSetCanApprove={setCanApprove}
            />
            <div className="bg-white rounded-3xl px-5 pb-10">
              <div className="text-md font-semibold my-5 flex flex-row justify-between items-center">
                <div>Approval permissions</div>
              </div>
              {(row && row?.permissions) && (
                <Form className="w-full">
                  <Form.Item
                    name="canApproveAsHod"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <h6 className="text-[13px] text-[#707C95] my-2">Can approve as a Head of department</h6>
                        <small className="text-[12px] text-[#95A1B3]">Perfom more action on request on this user</small>
                      </div>
                      <div className="permission">
                        <Switch checked={row?.permissions?.canApproveAsHod} onChange={(checked) => {setCanApproveAsHod(checked)}} />
                      </div>
                      
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="canApproveAsHof"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <h6 className="text-[13px] text-[#707C95] my-2">Can approve as a Head of finance</h6>
                        <small className="text-[12px] text-[#95A1B3]">Perfom more action on request on this user</small>
                      </div>
                      <div className="permission">
                        <Switch checked={row?.permissions?.canApproveAsHof} onChange={(checked) => {setCanApproveAsHof(checked)}} />
                      </div>
                    </div>
                  </Form.Item>
                  <Form.Item
                    name="canApproveAsPM"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div>
                        <h6 className="text-[13px] text-[#707C95] my-2">Can approve as a Procurement manager</h6>
                        <small className="text-[12px] text-[#95A1B3]">Perfom more action on request on this user</small>
                      </div>
                      <div className="permission">
                        <Switch checked={row?.permissions?.canApproveAsPM} onChange={(checked) => {setCanApproveAsPM(checked)}} />
                      </div>
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="canApproveAsLegal"
                  >
                    <div className="permission flex w-full items-center justify-between">
                      <div>
                        <h6 className="text-[13px] text-[#707C95] my-2">Can approve as a Legal officer</h6>
                        <small className="text-[12px] text-[#95A1B3]">Perfom more action on request on this user</small>
                      </div>
                      <div className="permission">
                        <Switch checked={row?.permissions?.canApproveAsLegal} onChange={(checked) => {setCanApproveAsLegal(checked)}} />
                      </div>
                    </div>
                  </Form.Item>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
