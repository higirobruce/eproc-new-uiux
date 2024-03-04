"use client";
import {
  ApartmentOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  BarsOutlined,
  CompassOutlined,
  EditOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  GiftOutlined,
  GlobalOutlined,
  IdcardOutlined,
  LoadingOutlined,
  MailOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { EnvelopeIcon, UserIcon, UsersIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Checkbox,
  Empty,
  Form,
  Input,
  List,
  message,
  Modal,
  Popconfirm,
  Row,
  Segmented,
  Select,
  Spin,
  Switch,
  Tag,
  Typography,
} from "antd";
import moment from "moment-timezone";
import React, { useEffect, useState } from "react";
import { encode } from "base-64";
import PermissionsTable from "../../components/permissionsTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UploadRDCerts from "@/app/components/uploadRDBCerts";
import UploadVatCerts from "@/app/components/uploadVatCerts";
import { v4 } from "uuid";
import { LuUser } from "react-icons/lu";
import { MdOutlineAlternateEmail, MdPhoneAndroid } from "react-icons/md";
import { useUser } from "@/app/context/UserContext";

export default function page() {
  let router = useRouter();
  const { user, login, logout } = useUser();
  const [form] = Form.useForm();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let [dataset, setDataset] = useState([]);
  let [updatingId, setUpdatingId] = useState("");
  let [row, setRow] = useState(null);
  let [segment, setSegment] = useState("Permissions");
  let [usersRequests, setUsersRequests] = useState([]);

  let [rowData, setRowData] = useState(null);
  let [vendorsBids, setVendorsBids] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(false);
  const [attachmentId, setAttachmentId] = useState(null);
  const [editVendor, setEditVendor] = useState(false);
  let [servCategories, setServCategories] = useState([]);
  const regexPatternSpecialCh = "[!@#$%^&*()\\-_=+[\\]{};:'\"\\\\|,.<>/?]";

  let [submitting, setSubmitting] = useState(false);

  const [rdbCertId, setRdbCertId] = useState(
    user?.rdbCertId ? user?.rdbCertId : v4()
  );
  const [vatCertId, setVatCertId] = useState(
    user?.vatCertId ? user?.vatCertId : v4()
  );
  const [rdbSelected, setRDBSelected] = useState(false);
  const [vatSelected, setVatSelected] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState("");
  const [tab, setTab] = useState(0);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    if (rdbSelected) {
      updateRDBCert(rdbCertId);
    }
  }, [rdbSelected]);

  useEffect(() => {
    if (vatSelected) {
      updateVATCert(vatCertId);
    }
  }, [vatSelected]);

  function onFinish(values) {
    setSubmitting(true);
    fetch(`${url}/users/updatePassword/${user?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setSubmitting(false);
        form.resetFields();
        if (!res.error) {
          messageApi.open({
            type: "success",
            content: "Password successfully reset!",
          });
        } else {
          messageApi.open({
            type: "error",
            content: res.errorMessage,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/profile/&sessionExpired=true`);
      throw Error("Unauthorized");
    } else {
      return res.json();
    }
  }

  function buildUser() {
    return (
      <div className="request mr-6 bg-white rounded-lg h-[calc(100vh-160px)] mb-10 px-5 pb-2 overflow-y-auto">
        {contextHolder}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          <div className="flex flex-col space-y-5">
            <div className="bg-white rounded-lg shadow px-5 pb-7">
              <h5 className="text-[17px] text-[#263238]">
                General Information
              </h5>
              <div className="flex flex-col gap-y-4">
                <small className="text-[13px] text-[#ADB6BF]">ABOUT</small>
                <div className="flex items-center gap-x-5 my-2">
                  <LuUser className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">
                    {user?.firstName} {user?.lastName}
                  </h6>
                  <Tag color="cyan">
                    {user?.title ? user?.title : user?.number}
                  </Tag>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                  <MdOutlineAlternateEmail className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">
                    {user?.email}
                  </h6>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                  <MdPhoneAndroid className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">
                    {user?.telephone}
                  </h6>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                  <MdOutlineAlternateEmail className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">
                    {user?.department?.description}
                  </h6>
                </div>
              </div>
            </div>
          </div>
          {/* Data */}

          {/* Transactions */}
          {user?.userType !== "VENDOR" && (
            <div className="col-span-2 flex flex-col space-y-5 px-5">
              <div className="bg-white py-3 px-3 rounded my-1">
                <div className="flex items-center gap-x-14 px-7 bg-[#F5F5F5]">
                  <button
                    className={`bg-transparent py-3 my-3 ${
                      tab == 0
                        ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238]`
                        : `border-none text-[#8392AB]`
                    } text-[14px] cursor-pointer`}
                    onClick={() => setTab(0)}
                  >
                    Account Info
                  </button>
                  {/* <button
                    className={`bg-transparent py-3 my-3 ${
                      tab == 1
                        ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238]`
                        : `border-none text-[#8392AB]`
                    } text-[14px] cursor-pointer`}
                    onClick={() => setTab(1)}
                  >
                    Activities
                  </button> */}
                  <button
                    className={`bg-transparent py-3 my-3 ${
                      tab == 2
                        ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238]`
                        : `border-none text-[#8392AB]`
                    } text-[14px] cursor-pointer`}
                    onClick={() => setTab(2)}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
              {tab == 0 ? (
                <>
                  <PermissionsTable
                    canApproveRequests={user?.permissions?.canApproveRequests}
                    canCreateRequests={user?.permissions?.canCreateRequests}
                    canEditRequests={user?.permissions?.canEditRequests}
                    canViewRequests={user?.permissions?.canViewRequests}
                    canApprovePaymentRequests={
                      user?.permissions?.canApprovePaymentRequests
                    }
                    canCreatePaymentRequests={
                      user?.permissions?.canCreatePaymentRequests
                    }
                    canEditPaymentRequests={
                      user?.permissions?.canEditPaymentRequests
                    }
                    canViewPaymentRequests={
                      user?.permissions?.canViewPaymentRequests
                    }
                    canApproveTenders={user?.permissions?.canApproveTenders}
                    canCreateTenders={user?.permissions?.canCreateTenders}
                    canEditTenders={user?.permissions?.canEditTenders}
                    canViewTenders={user?.permissions?.canViewTenders}
                    canApproveBids={user?.permissions?.canApproveBids}
                    canCreateBids={user?.permissions?.canCreateBids}
                    canEditBids={user?.permissions?.canEditBids}
                    canViewBids={user?.permissions?.canViewBids}
                    canApproveContracts={user?.permissions?.canApproveContracts}
                    canCreateContracts={user?.permissions?.canCreateContracts}
                    canEditContracts={user?.permissions?.canEditContracts}
                    canViewContracts={user?.permissions?.canViewContracts}
                    canApprovePurchaseOrders={
                      user?.permissions?.canApprovePurchaseOrders
                    }
                    canCreatePurchaseOrders={
                      user?.permissions?.canCreatePurchaseOrders
                    }
                    canEditPurchaseOrders={
                      user?.permissions?.canEditPurchaseOrders
                    }
                    canViewPurchaseOrders={
                      user?.permissions?.canViewPurchaseOrders
                    }
                    canApproveVendors={user?.permissions?.canApproveVendors}
                    canCreateVendors={user?.permissions?.canCreateVendors}
                    canEditVendors={user?.permissions?.canEditVendors}
                    canViewVendors={user?.permissions?.canViewVendors}
                    canApproveUsers={user?.permissions?.canApproveUsers}
                    canCreateUsers={user?.permissions?.canCreateUsers}
                    canEditUsers={user?.permissions?.canEditUsers}
                    canViewUsers={user?.permissions?.canViewUsers}
                    canApproveDashboard={user?.permissions?.canApproveDashboard}
                    canCreateDashboard={user?.permissions?.canCreateDashboard}
                    canEditDashboard={user?.permissions?.canEditDashboard}
                    canViewDashboard={user?.permissions?.canViewDashboard}
                    handleSetCanView={() => {}}
                    handleSetCanCreated={() => {}}
                    handleSetCanEdit={() => {}}
                    handleSetCanApprove={() => {}}
                    canNotEdit={true}
                  />
                </>
              ) : (
                <>
                  <div className="flex flex-col space-y-5">
                    {/* Reset password */}
                    <div className="bg-white ring-1 ring-gray-100 rounded shadow px-5 pt-5">
                      <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                        <div className="pb-3 text-[13px] text-[#344767]">
                          Reset password
                        </div>
                      </div>
                      <Form
                        // {...formItemLayout}
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        scrollToFirstError
                        style={{ width: "100%" }}
                      >
                        <div>
                          <div className="text-[13px] text-[#344767]">
                            Current password
                          </div>
                          <Form.Item
                            name="currentPassword"
                            // label="Password"
                            rules={[
                              {
                                required: true,
                                message: "Please input your current password!",
                              },
                            ]}
                            hasFeedback
                          >
                            <Input.Password
                              placeholder="Current Password"
                              className="h-11 mt-3"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <div className="text-[13px] text-[#344767]">
                            New password
                          </div>
                          <Form.Item
                            name="newPassword"
                            // label="Password"
                            rules={[
                              {
                                required: true,
                                message: "Please input your new password!",
                              },
                              {
                                pattern: new RegExp("([0-9]\\d*)+"),
                                message: "Please input at least one digit",
                              },
                              {
                                pattern: new RegExp("([a-zA-Z]\\s*)+"),
                                message:
                                  "Password should have both small and capital letters",
                              },
                              {
                                pattern: new RegExp(regexPatternSpecialCh, "g"),
                                message:
                                  "Password should have a special character",
                              },
                              {
                                pattern: new RegExp("(.{8,})"),
                                message:
                                  "Password should have atleast 8 characters",
                              },
                            ]}
                            hasFeedback
                          >
                            <Input.Password
                              placeholder="Your New Password"
                              className="h-11 mt-3"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <div className="text-[13px] text-[#344767]">
                            Confirm new password
                          </div>
                          <Form.Item
                            name="confirmPassword"
                            // label="Password"
                            rules={[
                              {
                                required: true,
                                message: "Please confirm your password!",
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  if (
                                    !value ||
                                    getFieldValue("newPassword") === value
                                  ) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(
                                    new Error(
                                      "The two passwords that you entered do not match!"
                                    )
                                  );
                                },
                              }),
                            ]}
                            hasFeedback
                          >
                            <Input.Password
                              placeholder="Your Confirm Password"
                              className="h-11 mt-3"
                            />
                          </Form.Item>
                        </div>

                        <Form.Item className="m-0">
                          {submitting ? (
                            <Spin indicator={antIcon} />
                          ) : (
                            <div className="flex flex-row items-center justify-between mt-3">
                              <Button
                                type="primary"
                                size="large"
                                danger
                                htmlType="submit"
                              >
                                Update my password
                              </Button>
                            </div>
                          )}
                        </Form.Item>
                      </Form>
                    </div>
                  </div>
                </>
              )}

              {segment === "Requests History" && (
                <div className="p-3">
                  {usersRequests?.map((request) => {
                    return (
                      <div
                        key={request?._id}
                        className="grid grid-cols-4 ring-1 ring-gray-200 rounded my-3 p-3 text-gray-700"
                      >
                        <div>
                          <div className="flex-row  flex items-center">
                            <div>
                              <FileTextOutlined className="h-4 w-4" />
                            </div>{" "}
                            <div>{request?.number}</div>
                          </div>
                          <div>{request?.title}</div>
                          <div>{request?.description}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Status</div>
                          <div>
                            <Tag color="gold">{request.status}</Tag>
                          </div>
                        </div>
                        <div>{`Due ${moment(request?.dueDate).fromNow()}`}</div>
                        <div>
                          {request?.budgeted ? (
                            <div>
                              <Tag color="green">BUDGETED</Tag>
                            </div>
                          ) : (
                            <div>
                              <Tag color="magenta">NOT BUDGETED</Tag>
                            </div>
                          )}
                        </div>
                        <div></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  function buildVendor() {
    return (
      <div className="flex flex-col  transition-opacity ease-in-out duration-1000 px-10 py-5 flex-1 space-y-3 h-full mb-3">
        {contextHolder}
        <div className="flex flex-col space-y-5">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center space-x-2">
              {/* <div>
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="primary"
                  onClick={() => {
                    setRowData(null);
                    setSegment("Bids");
                  }}
                >
                  Back to vendors
                </Button>
              </div> */}

              {editVendor && (
                <div>
                  <Button
                    icon={<SaveOutlined />}
                    type="primary"
                    onClick={() => {
                      setEditVendor(false);
                      updateVendor();
                    }}
                  />
                </div>
              )}
            </div>
            {user?.permissions?.canEditVendors && (
              <div>
                <Switch
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren={<EyeOutlined />}
                  defaultChecked={editVendor}
                  checked={editVendor}
                  onChange={(checked) => {
                    setEditVendor(checked);
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

                  {updatingId !== user?._id && (
                    <div>
                      {user?.status === "pending-approval" && (
                        <span>
                          <Popconfirm
                            title="Approve vendor"
                            description="Are you sure to approve this vendor?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => approveUser(rowData._id)}
                          >
                            <div className="flex flex-row items-center justify-center text-sm ring-1 ring-green-400 rounded px-2 py-1 cursor-pointer bg-green-200">
                              Approve
                            </div>
                          </Popconfirm>
                        </span>
                      )}

                      {user?.status === "declined" && (
                        <span>
                          <Popconfirm
                            title="Activate vendor"
                            description="Are you sure to activate this vendor?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => activateVendor(rowData._id)}
                          >
                            <div className="flex flex-row items-center justify-center text-sm ring-1 ring-green-400 rounded px-2 py-1 cursor-pointer bg-green-200">
                              Activate
                            </div>
                          </Popconfirm>
                        </span>
                      )}

                      {user?.status === "approved" && (
                        <span>
                          <Popconfirm
                            title="Deactive vendor"
                            description="Are you sure to deactivate this vendor?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => banVendor(rowData._id)}
                          >
                            <div className="flex flex-row items-center justify-center text-sm ring-1 ring-red-400 rounded px-2 py-1 cursor-pointer bg-red-200">
                              Deactivate
                            </div>
                          </Popconfirm>
                        </span>
                      )}
                      {user?.status === "banned" && (
                        <span>
                          <Popconfirm
                            title="Acivate vendor"
                            description="Are you sure to activate this vendor?"
                            okText="Yes"
                            cancelText="No"
                            onConfirm={() => activateVendor(rowData._id)}
                          >
                            <div className="flex flex-row items-center justify-center text-sm ring-1 ring-green-400 rounded px-2 py-1 cursor-pointer bg-green-200">
                              Activate
                            </div>
                          </Popconfirm>
                        </span>
                      )}
                    </div>
                  )}
                  {updatingId === user?._id && (
                    <Spin
                      size="small"
                      indicator={
                        <LoadingOutlined style={{ fontSize: 12 }} spin />
                      }
                    />
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-10">
                    <UserOutlined className="text-gray-400" />
                    <div className="text-sm flex flex-row items-center space-x-2">
                      <Typography.Text
                        editable={
                          editVendor && {
                            onChange: (e) => {
                              let r = { ...rowData };
                              r.contactPersonNames = e;
                              setRowData(r);
                            },
                            text: user?.contactPersonNames,
                          }
                        }
                      >
                        {user?.contactPersonNames}
                      </Typography.Text>{" "}
                      {!editVendor && (
                        <div>
                          <Tag color="cyan">{user?.title}</Tag>
                        </div>
                      )}
                      {editVendor && (
                        <Typography.Text
                          editable={
                            editVendor && {
                              onChange: (e) => {
                                let r = { ...rowData };
                                r.title = e;
                                setRowData(r);
                              },
                              text: user?.title,
                            }
                          }
                        >
                          {user?.title}
                        </Typography.Text>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row items-center space-x-10">
                    <MailOutlined className="text-gray-400" />
                    <Typography.Text
                      editable={
                        editVendor && {
                          onChange: (e) => {
                            let r = { ...rowData };
                            r.email = e;
                            setRowData(r);
                          },
                          text: user?.email,
                        }
                      }
                      className="text-sm"
                    >
                      {user?.email}{" "}
                    </Typography.Text>
                  </div>

                  <div className="flex flex-row items-center space-x-10">
                    <BankOutlined className="text-gray-400" />
                    <Typography.Text
                      editable={
                        editVendor && {
                          onChange: (e) => {
                            let r = { ...rowData };
                            r.tin = e;
                            setRowData(r);
                          },
                          text: user?.tin,
                        }
                      }
                      className="text-sm "
                    >
                      {user?.tin}{" "}
                    </Typography.Text>
                  </div>

                  <div className="flex flex-row items-center space-x-10">
                    <PhoneOutlined className="text-gray-400" />
                    <Typography.Text
                      editable={
                        editVendor && {
                          onChange: (e) => {
                            let r = { ...rowData };
                            r.telephone = e;
                            setRowData(r);
                          },
                          text: user?.telephone,
                        }
                      }
                      className="text-sm "
                    >
                      {user?.telephone}{" "}
                    </Typography.Text>
                  </div>
                  <div className="flex flex-row items-center space-x-10">
                    <GlobalOutlined className="text-gray-400" />
                    <div className="text-sm ">
                      <Typography.Link
                        editable={
                          editVendor && {
                            onChange: (e) => {
                              let r = { ...rowData };
                              r.website = e;
                              setRowData(r);
                            },
                            text: user?.webSite,
                          }
                        }
                      >
                        {user?.webSite}{" "}
                      </Typography.Link>
                    </div>
                  </div>

                  <div className="flex flex-row items-center space-x-10">
                    <IdcardOutlined className="text-gray-400" />
                    <Typography.Text
                      editable={
                        editVendor && {
                          onChange: (e) => {
                            let r = { ...rowData };
                            r.passportNid = e;
                            setRowData(r);
                          },
                          text: user?.passportNid,
                        }
                      }
                      className="text-sm "
                    >
                      {user?.passportNid}
                    </Typography.Text>
                  </div>

                  <div className="flex flex-row items-center space-x-10">
                    <GiftOutlined className="text-gray-400" />
                    {!editVendor && (
                      <div className="grid grid-cols-1 gap-2">
                        {user?.services?.map((s) => {
                          return (
                            <div key={s}>
                              <Tag>{s}</Tag>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {editVendor && (
                      <Select
                        mode="multiple"
                        allowClear
                        defaultValue={user?.services?.map((s) => {
                          return s;
                        })}
                        style={{ width: "100%" }}
                        placeholder="Please select"
                        onChange={(value) => {
                          let r = { ...rowData };
                          r.services = value;
                          setRowData(r);
                        }}
                      >
                        {servCategories?.map((s) => {
                          return (
                            <Select.Option key={s._id} value={s.description}>
                              {s.description}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
                <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                  <div>Address Information</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-10">
                    <CompassOutlined className="text-gray-400" />
                    <div className="text-sm flex flex-row space-x-1">
                      <div>
                        <Typography.Text
                          editable={
                            editVendor && {
                              onChange: (e) => {
                                let r = { ...rowData };
                                r.hqAddress = e;
                                setRowData(r);
                              },
                              tooltip: "Edit Hq Address",
                              text: user?.hqAddress,
                            }
                          }
                        >
                          {user?.hqAddress}{" "}
                        </Typography.Text>
                      </div>
                      <div>
                        <Typography.Text
                          editable={
                            editVendor && {
                              onChange: (e) => {
                                let r = { ...rowData };
                                r.country = e;
                                setRowData(r);
                              },
                              text: user?.country,
                              tooltip: "Edit Country",
                            }
                          }
                        >
                          {user?.country}
                        </Typography.Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachements */}
              {/* <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
                <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                  <div>Attachements</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-10">
                    <PaperClipOutlined className="text-gray-400" />
                    {user?.rdbCertId && (
                      <Link
                        href={`${url}/file/rdbCerts/${user?.rdbCertId}.pdf`}
                        target="_blank"
                      >
                        <Typography.Link>
                          Full RDB registration{" "}
                        </Typography.Link>
                      </Link>
                    )}
                    {!user?.rdbCertId && (
                      <Typography.Link>
                        Full RDB registration not available
                      </Typography.Link>
                    )}
                  </div>

                  <div className="flex flex-row items-center space-x-10">
                    <PaperClipOutlined className="text-gray-400" />
                    {user?.vatCertId && (
                      <Link
                        href={`${url}/file/vatCerts/${user?.vatCertId}.pdf`}
                        target="_blank"
                      >
                        <Typography.Link>VAT certificate</Typography.Link>
                      </Link>
                    )}
                    {!user?.vatCertId && (
                      <Typography.Link>
                        VAT certificate not available
                      </Typography.Link>
                    )}
                  </div>
                </div>
              </div> */}

              {/* Attachements */}
              <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
                <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                  <div>Attachements</div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex flex-row items-center space-x-10">
                    <PaperClipOutlined className="text-gray-400" />
                    {user?.rdbCertId && (
                      <div className="flex flex-row items-center">
                        <Link
                          href={`${url}/file/rdbCerts/${user?.rdbCertId}.pdf`}
                          target="_blank"
                        >
                          <Typography.Link>
                            Incorporation Certificate
                          </Typography.Link>
                        </Link>

                        <div className="">
                          <UploadRDCerts
                            // label="Incorporation Certificate"
                            iconOnly={true}
                            setSelected={setRDBSelected}
                            setId={setRdbCertId}
                            uuid={rdbCertId}
                            setStatus={(status) => {}}
                            uploadingStatus={fileUploadStatus}
                          />
                        </div>
                      </div>
                    )}

                    {!user?.rdbCertId && (
                      <div className="flex flex-col">
                        {/* <div>
                        <Typography.Link>
                          Incorporation Certificate not found
                        </Typography.Link>
                      </div> */}
                        <div className="">
                          <UploadRDCerts
                            label="Incorporation Certificate (missing)"
                            iconOnly={true}
                            setSelected={setRDBSelected}
                            setId={setRdbCertId}
                            uuid={rdbCertId}
                            setStatus={(status) => {}}
                            uploadingStatus={fileUploadStatus}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-center space-x-10">
                    <PaperClipOutlined className="text-gray-400" />
                    {user?.vatCertId && (
                      <div className="flex flex-row items-center">
                        <Link
                          href={`${url}/file/vatCerts/${user?.vatCertId}.pdf`}
                          target="_blank"
                        >
                          <Typography.Link>VAT Certificate</Typography.Link>
                        </Link>

                        <div className="">
                          <UploadVatCerts
                            // label="Incorporation Certificate"
                            iconOnly={true}
                            setSelected={setVatSelected}
                            setId={setVatCertId}
                            uuid={vatCertId}
                            setStatus={(status) => {}}
                            uploadingStatus={fileUploadStatus}
                          />
                        </div>
                      </div>
                    )}

                    {!user?.vatCertId && (
                      <div className="flex flex-col">
                        {/* <div>
                        <Typography.Link>
                          Incorporation Certificate not found
                        </Typography.Link>
                      </div> */}
                        <div className="">
                          <UploadVatCerts
                            label="VAT Certificate (missing)"
                            iconOnly={true}
                            setSelected={setVatSelected}
                            setId={setVatCertId}
                            uuid={vatCertId}
                            setStatus={(status) => {}}
                            uploadingStatus={fileUploadStatus}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reset password */}
              <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
                <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                  <div>Reset password</div>
                </div>
                <Form
                  // {...formItemLayout}
                  form={form}
                  name="register"
                  onFinish={onFinish}
                  scrollToFirstError
                  style={{ width: "100%" }}
                >
                  <div>
                    <div>Current password</div>
                    <Form.Item
                      name="currentPassword"
                      // label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your current password!",
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password />
                    </Form.Item>
                  </div>

                  <div>
                    <div>New password</div>
                    <Form.Item
                      name="newPassword"
                      // label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Please input your new password!",
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password />
                    </Form.Item>
                  </div>

                  <div>
                    <div>Confirm new password</div>
                    <Form.Item
                      name="confirmPassword"
                      // label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The two passwords that you entered do not match!"
                              )
                            );
                          },
                        }),
                      ]}
                      hasFeedback
                    >
                      <Input.Password />
                    </Form.Item>
                  </div>

                  <Form.Item>
                    {submitting ? (
                      <Spin indicator={antIcon} />
                    ) : (
                      <div className="flex flex-row items-center justify-between">
                        <Button type="primary" danger htmlType="submit">
                          Update my password
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                </Form>
              </div>
            </div>

            {/* Transactions */}
            <div className="col-span-2 flex flex-col space-y-5 bg-white ring-1 ring-gray-100 rounded shadow p-10">
              <Segmented
                block
                size="large"
                options={["Bids", "Purchase orders"]}
                onChange={setSegment}
              />
              {segment === "Bids" &&
                vendorsBids?.length > 0 &&
                vendorsBids.map((bid) => {
                  return (
                    <div key={bid?.number}>
                      <List size="small">
                        <List.Item>
                          <List.Item.Meta
                            //   avatar={<Avatar src={item.picture.large} />}
                            // title={<a href="#">{bid.number}</a>}
                            description={
                              <div className="grid md:grid-cols-5 rounded ring-1 ring-gray-100 p-2 gap-4 shadow">
                                <div>
                                  <div className="text-md font-semibold text-gray-800">
                                    {bid?.number}
                                  </div>

                                  <div className="text-xs text-gray-600">
                                    {bid?.createdBy?.companyName}
                                  </div>

                                  <a href="#">
                                    <FileTextOutlined />{" "}
                                  </a>
                                </div>

                                <div className="">
                                  <div className="text-xs text-gray-400">
                                    Title
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {bid?.tender?.purchaseRequest?.title}
                                  </div>
                                </div>

                                <div className="">
                                  <div className="text-xs text-gray-400">
                                    Total Price
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {bid?.price.toLocaleString() +
                                      " " +
                                      bid?.currency}
                                  </div>
                                </div>

                                <div className="">
                                  <div className="text-xs text-gray-400">
                                    Discount
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {bid?.discount}%
                                  </div>
                                </div>

                                <div className="">
                                  <div className="text-xs text-gray-400">
                                    Delivery date
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {moment(bid?.deliveryDate).fromNow()}
                                  </div>
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      </List>
                    </div>
                  );
                })}

              {segment === "Bids" &&
                (!vendorsBids || vendorsBids?.length == 0) && <Empty />}
            </div>
          </div>
          {previewAttachmentModal()}
        </div>
      </div>
    );
  }

  function previewAttachmentModal() {
    // return (
    //   <Modal
    //     title="Attachment view"
    //     centered
    //     open={previewAttachment}
    //     onOk={() => setPreviewAttachment(false)}
    //     onCancel={() => setPreviewAttachment(false)}
    //     width={"80%"}
    //     // bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
    //   >
    //     <div>
    //       <MyPdfViewer fileUrl={`${url}/file/${attachmentId}`} />
    //     </div>
    //   </Modal>
    // );
  }

  function updateRDBCert(id) {
    user.rdbCertId = id;
    fetch(`${url}/users/${user?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newUser: user,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = user.avgRate;
        login(res);
        login(res);
        setRowData(res);
        // refresh();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateVATCert(id) {
    user.vatCertId = id;
    fetch(`${url}/users/${user?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newUser: user,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = user.avgRate;
        login(res);
        login(res);
        setRowData(res);
        // refresh();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  return (
    <div className="payment-request mr-6 rounded-lg h-[calc(100vh-115px)] pb-10 px-5 overflow-y-auto">
      {user?.userType === "VENDOR" ? buildVendor() : buildUser()}
    </div>
  );
}
