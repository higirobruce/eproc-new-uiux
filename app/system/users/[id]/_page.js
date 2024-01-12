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
  let user = JSON.parse(localStorage.getItem("user"));
  let token = localStorage.getItem('token');
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: row ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        type: "tween",
        ease: "circOut",
      }}
      className="flex flex-col  transition-opacity ease-in-out duration-1000 px-10 py-5 flex-1 space-y-3 overflow-x-scroll"
    >
      {contextHolder}
      <div className="flex flex-col space-y-5">
        <div className="flex flex-row justify-between">
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
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Data */}
          <div className="flex flex-col space-y-5">
            <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
              <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                <div>General Information</div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-10">
                  <UserIcon className="text-gray-400 h-4 w-4" />
                  <div className="text-sm flex flex-row items-center space-x-2">
                    {!editUser && (
                      <div>
                        {row?.firstName} {row?.lastName}
                      </div>
                    )}

                    {editUser && (
                      <div className="flex flex-row items-center">
                        <Typography.Text
                          editable={
                            editUser && {
                              onChange: (e) => {
                                let r = { ...row };
                                r.firstName = e;
                                setRow(r);
                              },
                              text: row?.firstName,
                            }
                          }
                        >
                          {row?.firstName}
                        </Typography.Text>

                        <Typography.Text
                          editable={
                            editUser && {
                              onChange: (e) => {
                                let r = { ...row };
                                r.lastName = e;
                                setRow(r);
                              },
                              text: row?.lastName,
                            }
                          }
                        >
                          {row?.lastName}
                        </Typography.Text>
                      </div>
                    )}

                    {/* {!editUser &&  <div>
                        <Tag color="cyan">
                          Position: {row?.title ? row?.title : row?.number}
                        </Tag>
                      </div>} */}
                  </div>
                </div>
                <div className="flex flex-row items-center space-x-10">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                  {!editUser && <div className="text-sm ">{row?.email} </div>}
                  {editUser && (
                    <Typography.Text
                      editable={
                        editUser && {
                          onChange: (e) => {
                            let r = { ...row };
                            r.email = e;
                            setRow(r);
                          },
                          text: row?.email,
                        }
                      }
                    >
                      {row?.email}
                    </Typography.Text>
                  )}
                </div>

                <div className="flex flex-row items-center space-x-10">
                  <PhoneOutlined className="text-gray-400" />
                  {!editUser && (
                    <div className="text-sm ">{row?.telephone} </div>
                  )}
                  {editUser && (
                    <Typography.Text
                      editable={
                        editUser && {
                          onChange: (e) => {
                            let r = { ...row };
                            r.telephone = e;
                            setRow(r);
                          },
                          text: row?.telephone,
                        }
                      }
                    >
                      {row?.telephone}
                    </Typography.Text>
                  )}
                </div>
                <div className="flex flex-row items-center space-x-10">
                  <UsersIcon className="h-4 w-4 text-gray-400" />
                  {!editUser && (
                    <div className="text-sm ">
                      <Typography.Link>
                        {row?.department?.description}{" "}
                      </Typography.Link>
                    </div>
                  )}

                  {editUser && (
                    <Select
                      // mode="multiple"
                      // allowClear
                      style={{ width: "100%" }}
                      defaultValue={row?.department?._id}
                      placeholder="Please select"
                      onChange={(value) => {
                        let newDep = dpts?.filter((d) => d?._id === value);

                        let r = { ...row };
                        r.department = newDep[0];
                        setRow(r);
                      }}
                    >
                      {dpts?.map((dpt) => {
                        return (
                          <Select.Option key={dpt._id} value={dpt._id}>
                            {dpt.description}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </div>
              </div>
            </div>

            {/* Reset password */}
            {user?.permissions?.canEditUsers && (
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
            )}
          </div>

          {/* Transactions */}
          <div className="col-span-2 flex flex-col space-y-5 bg-white ring-1 ring-gray-100 rounded shadow p-10 ">
            <Segmented
              block
              size="large"
              options={[
                {
                  label: "Permissions",
                  value: "Permissions",
                  icon: <BarsOutlined />,
                },
                {
                  label: "Requests History",
                  value: "Requests History",
                  icon: <FieldTimeOutlined />,
                },
              ]}
              onChange={setSegment}
            />
            {segment === "Permissions" && (
              <div className="p-3 overflow-y-scroll h-[560px]">
                <div className="text-md font-semibold mb-5 flex flex-row justify-between items-center">
                  <div>Module access permissions</div>
                </div>
                {row && (
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
                )}

                <div className="text-md font-semibold my-5 flex flex-row justify-between items-center">
                  <div>Approval permissions</div>
                </div>
                {row && (
                  <Form>
                    <Form.Item
                      name="canApproveAsHod"
                      label="Can approve as a Head of department"
                    >
                      <Checkbox
                        defaultChecked={row?.permissions?.canApproveAsHod}
                        onChange={(e) => setCanApproveAsHod(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item
                      name="canApproveAsHof"
                      label="Can approve as a Head of finance"
                    >
                      <Checkbox
                        defaultChecked={row?.permissions?.canApproveAsHof}
                        onChange={(e) => setCanApproveAsHof(e.target.checked)}
                      />
                    </Form.Item>
                    <Form.Item
                      name="canApproveAsPM"
                      label="Can approve as a Procurement manager"
                    >
                      <Checkbox
                        defaultChecked={row?.permissions?.canApproveAsPM}
                        onChange={(e) => setCanApproveAsPM(e.target.checked)}
                      />
                    </Form.Item>

                    <Form.Item
                      name="canApproveAsLegal"
                      label="Can approve as a Legal officer"
                    >
                      <Checkbox
                        defaultChecked={row?.permissions?.canApproveAsLegal}
                        onChange={(e) => setCanApproveAsLegal(e.target.checked)}
                      />
                    </Form.Item>
                  </Form>
                )}
              </div>
            )}
            {segment === "Requests History" && (
              <div className="p-3 overflow-y-scroll h-[560px]">
                {usersRequests?.map((request) => {
                  return (
                    <div
                      key={request?._id}
                      className="grid grid-cols-3 ring-1 ring-gray-200 rounded my-3 p-3 text-gray-700"
                    >
                      <div>
                        <div className="text-gray-500 font-semibold mb-2">
                          Request #
                        </div>
                        <div className="flex-row  flex items-center">
                          <div>
                            <FileTextOutlined className="h-4 w-4" />
                          </div>{" "}
                          <div>{request?.number}</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-semibold mb-2">
                          Title
                        </div>
                        <div>{request?.title}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 font-semibold mb-2">
                          Status
                        </div>
                        <div>
                          <Tag color="gold">{request.status}</Tag>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
