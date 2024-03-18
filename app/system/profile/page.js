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
  QuestionCircleOutlined
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
  Tooltip
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
import {
  MdOutlineAlternateEmail,
  MdHomeWork,
  MdPhoneAndroid,
} from "react-icons/md";
import { PiBagSimpleBold } from "react-icons/pi";
import { FaFirefoxBrowser } from "react-icons/fa6";
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
      <div className="payment-request rounded-lg h-[calc(100vh-160px)] mb-10 pb-2 overflow-y-auto">
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
                <div className="flex items-center gap-x-5 my-2 ">
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
                    Module Access
                  </button>
                  <button
                    className={`bg-transparent py-3 my-3 ${
                      tab == 1
                        ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238]`
                        : `border-none text-[#8392AB]`
                    } text-[14px] cursor-pointer`}
                    onClick={() => setTab(1)}
                  >
                    Approval Permissions
                  </button>
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
              ) : tab == 1 ? (
                <div className="bg-white rounded-lg px-5 pb-10">
                  <h6 className="mb-3 pb-0 text-[15px] text-[#263238]">
                    Approval permissions
                  </h6>

                  <Form className="w-full">
                    <Form.Item name="canApproveAsHod">
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <h6 className="text-[13px] text-[#707C95] my-2">
                            Can approve as a Head of department
                          </h6>
                          <small className="text-[12px] text-[#95A1B3]">
                            Perfom more action on request on this user
                          </small>
                        </div>
                        <div className="permission">
                          <Switch
                            disabled
                            checked={user?.permissions?.canApproveAsHod}
                            onChange={(checked) => {
                              setCanApproveAsHod(checked);
                            }}
                          />
                        </div>
                      </div>
                    </Form.Item>
                    <Form.Item name="canApproveAsHof">
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <h6 className="text-[13px] text-[#707C95] my-2">
                            Can approve as a Head of finance
                          </h6>
                          <small className="text-[12px] text-[#95A1B3]">
                            Perfom more action on request on this user
                          </small>
                        </div>
                        <div className="permission">
                          <Switch
                            disabled
                            checked={user?.permissions?.canApproveAsHof}
                            onChange={(checked) => {
                              setCanApproveAsHof(checked);
                            }}
                          />
                        </div>
                      </div>
                    </Form.Item>
                    <Form.Item name="canApproveAsPM">
                      <div className="flex w-full items-center justify-between">
                        <div>
                          <h6 className="text-[13px] text-[#707C95] my-2">
                            Can approve as a Procurement manager
                          </h6>
                          <small className="text-[12px] text-[#95A1B3]">
                            Perfom more action on request on this user
                          </small>
                        </div>
                        <div className="permission">
                          <Switch
                            disabled
                            checked={user?.permissions?.canApproveAsPM}
                            onChange={(checked) => {
                              setCanApproveAsPM(checked);
                            }}
                          />
                        </div>
                      </div>
                    </Form.Item>

                    <Form.Item name="canApproveAsLegal">
                      <div className="permission flex w-full items-center justify-between">
                        <div>
                          <h6 className="text-[13px] text-[#707C95] my-2">
                            Can approve as a Legal officer
                          </h6>
                          <small className="text-[12px] text-[#95A1B3]">
                            Perfom more action on request on this user
                          </small>
                        </div>
                        <div className="permission">
                          <Switch
                            disabled
                            checked={user?.permissions?.canApproveAsLegal}
                            onChange={(checked) => {
                              setCanApproveAsLegal(checked);
                            }}
                          />
                        </div>
                      </div>
                    </Form.Item>
                  </Form>
                </div>
              ) : (
                <>
                  <div className="flex flex-col space-y-5">
                    {/* Reset password */}
                    <div className="bg-white rounded-lg shadow px-5 pb-5">
                      <div className="pb-5">
                        <h6 className="mb-3 pb-0 text-[15px] text-[#263238]">
                          Reset Password
                        </h6>
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
                            <div className="flex flex-row items-center justify-between my-3">
                              <Button
                                type="primary"
                                size="middle"
                                danger
                                htmlType="submit"
                              >
                                Update Password
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
      <div className="payment-request rounded-lg h-[calc(100vh-160px)] mb-10 pb-2 overflow-y-auto">
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
                    {user?.contactPersonNames}
                  </h6>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                  <MdHomeWork className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">
                    {user?.companyName}
                  </h6>
                </div>
                <div className="flex items-center gap-x-5 my-2">
                  <FaFirefoxBrowser className="text-[#ADB6BF]" />
                  <h6 className="text-[15px] font-medium text-[#344767] m-0 p-0">
                    {user?.webSite}
                  </h6>
                </div>
              </div>
              <div className="flex flex-col gap-y-4 mt-5">
                <small className="text-[13px] text-[#ADB6BF]">CONTACT</small>
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
              </div>
            </div>
            <div>
              {updatingId !== user?._id && (
                <div className="flex gap-x-3 px-1">
                  {user?.status === "pending-approval" && (
                    <span>
                      <Popconfirm
                        title="Approve vendor"
                        description="Are you sure?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => approveUser(user?._id)}
                      >
                        <div className="flex flex-row items-center justify-center text-sm shadow rounded px-7 py-2 cursor-pointer bg-[#28C762] text-white">
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
                  {updatingId === user?._id && (
                    <Spin
                      size="small"
                      indicator={
                        <LoadingOutlined style={{ fontSize: 12 }} spin />
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 flex flex-col space-y-3 pr-5">
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
            {tab == 0 && user ? (
              <>
                <div className="my-1 bg-white rounded-xl px-8 pt-1 pb-5">
                  <h5 className="text-[#263238] text-[18px]">Basic Info</h5>
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 items-center gap-x-5">
                    <div>
                      <div className="pb-3 text-[13px] text-[#344767]">
                        Title
                      </div>
                      <Form.Item initialValue={user?.title} name={"title"}>
                        <Input
                          value={user?.title}
                          defaultValue={user?.title}
                          placeholder="Your Title"
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.title = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-span-2">
                      <div className="pb-3 text-[13px] text-[#344767]">
                        Full Name
                      </div>
                      <Form.Item
                        initialValue={user?.contactPersonNames}
                        name={"contactPersonNames"}
                      >
                        <Input
                          defaultValue={user?.contactPersonNames}
                          value={user?.contactPersonNames}
                          placeholder="Your Full Name"
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.contactPersonNames = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <div className="pb-3 text-[13px] text-[#344767]">
                        Phone Number
                      </div>
                      <Form.Item initialValue={user?.telephone} name={"telephone"}>
                        <Input
                          placeholder="Your Phone Number"
                          defaultValue={user?.telephone}
                          value={user?.telephone}
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.telephone = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <div className="pb-3 text-[13px] text-[#344767]">
                        Email
                      </div>
                      <Form.Item initialValue={user?.email} name={"email"}>
                        <Input
                          placeholder="Your Email"
                          defaultValue={user?.email}
                          value={user?.email}
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.email = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="my-1 bg-white rounded-xl px-8 pt-1 pb-5">
                  <h5 className="text-[#263238] text-[18px]">Other Info</h5>
                  <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 items-center gap-x-5">
                    <div>
                      <label className="pb-3 text-[13px] text-[#344767]">TIN</label>
                      <Form.Item initialValue={user?.tin} name={"tin"}>
                        <Input
                          defaultValue={user?.tin}
                          value={user?.tin}
                          placeholder="Your TIN"
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.tin = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <label className="pb-3 text-[13px] text-[#344767]">
                        HQ Address
                      </label>
                      <Form.Item initialValue={user?.hqAddress} name={"hqAddress"}>
                        <Input
                          defaultValue={user?.hqAddress}
                          value={user?.hqAddress}
                          placeholder="Your HQ Adress"
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.hqAddress = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <label className="pb-3 text-[13px] text-[#344767]">
                        Years of Experience
                      </label>
                      <Form.Item initialValue={user?.experienceDurationInYears} name={"experienceDurationInYears"}>
                        <Input
                          defaultValue={user?.experienceDurationInYears}
                          value={user?.experienceDurationInYears}
                          placeholder="Your Experience"
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.experienceDurationInYears = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <label className="pb-3 text-[13px] text-[#344767]">
                        Country
                      </label>
                      <Form.Item initialValue={user?.passportNid} name={"passportNid"}>
                        <Input
                          defaultValue={user?.passportNid}
                          value={user?.passportNid}
                          placeholder="Your Country"
                          className="h-11 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.passportNid = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-x-5">
                    <div>
                      <label className="pb-3 text-[13px] text-[#344767]">
                        Website
                      </label>
                      <Form.Item initialValue={user?.webSite} name={"webSite"}>
                        <Input
                          defaultValue={user?.webSite}
                          value={user?.webSite}
                          placeholder="Your Website"
                          className="h-10 my-3"
                          onChange={(e) => {
                            let r = { ...rowData };
                            r.website = e.target.value;
                            setRowData(r);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div>
                      <label className="pb-3 text-[13px] text-[#344767]">
                        Area(s) of Experience
                      </label>
                      <Select
                        mode="multiple"
                        allowClear
                        size="large"
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
                        value={user?.services?._id}
                        className="mt-3"
                      >
                        {servCategories?.map((s) => {
                          return (
                            <Select.Option key={s._id} value={s.description}>
                              {s.description}
                            </Select.Option>
                          );
                        })}
                      </Select>
                      {/* <Form.Item name={""}>
                      <Input placeholder="Your Area(s)" className="h-11 my-3" />
                    </Form.Item> */}
                    </div>
                  </div>
                  <h5 className="text-[#263238] text-[18px]">Uploads</h5>
                  <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                    <div>
                      {user?.rdbCertId && (
                        <div>
                          <div className="flex gap-2">
                            <Link
                              href={`${url}/file/rdbCerts/${user?.rdbCertId}.pdf`}
                              target="_blank"
                            >
                              <label className="text-[#6A757B] mb-3">
                                Incorporation document
                              </label>
                            </Link>
                            
                            <div>
                              <Tooltip
                                placement="top"
                                title="Please attach your incorporation document. For businesses registered in Rwanda, please provide your RDB certificate."
                                arrow={false}
                              >
                                <QuestionCircleOutlined />
                              </Tooltip>
                            </div>
                          </div>
                          <Form.Item
                            name="rdbRegistraction"
                            rules={
                              [
                                // {
                                //   validator: (_, value) =>
                                //     rdbSelected
                                //       ? Promise.resolve()
                                //       : Promise.reject(
                                //           new Error(
                                //             "Please attach your incorporation document"
                                //           )
                                //         ),
                                // },
                              ]
                            }
                          >
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
                          </Form.Item>
                        </div>
                        
                      )}

                      {!user?.rdbCertId && (
                        <Form.Item
                          name="rdbRegistraction"
                          rules={
                            [
                              // {
                              //   validator: (_, value) =>
                              //     rdbSelected
                              //       ? Promise.resolve()
                              //       : Promise.reject(
                              //           new Error(
                              //             "Please attach your incorporation document"
                              //           )
                              //         ),
                              // },
                            ]
                          }
                        >
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
                        </Form.Item>
                      )}
                    </div>
                    <div>
                      {user?.vatCertId && (
                        <div>
                          <div className="flex gap-2">
                            <Link
                              href={`${url}/file/vatCerts/${user?.vatCertId}.pdf`}
                              target="_blank"
                            >
                              <label className="text-[#6A757B] mb-3">
                                VAT Certificate
                              </label>
                            </Link>
                            <div>
                              <Tooltip
                                placement="top"
                                title="Please attach your vat document. For businesses registered in Rwanda, please provide your RDB certificate."
                                arrow={false}
                              >
                                <QuestionCircleOutlined />
                              </Tooltip>
                            </div>
                          </div>
                          <Form.Item
                            name="vatRegistraction"
                            rules={
                              [
                                // {
                                //   validator: (_, value) =>
                                //     rdbSelected
                                //       ? Promise.resolve()
                                //       : Promise.reject(
                                //           new Error(
                                //             "Please attach your incorporation document"
                                //           )
                                //         ),
                                // },
                              ]
                            }
                          >
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
                          </Form.Item>
                        </div>
                      )}

                      {!user?.vatCertId && (
                        <Form.Item
                          name="vatRegistraction"
                          rules={
                            [
                              // {
                              //   validator: (_, value) =>
                              //     rdbSelected
                              //       ? Promise.resolve()
                              //       : Promise.reject(
                              //           new Error(
                              //             "Please attach your incorporation document"
                              //           )
                              //         ),
                              // },
                            ]
                          }
                        >
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
                        </Form.Item>
                      )}
                    </div>
                  </div>
                  {/* <div className="flex justify-end">
                    <Button
                      icon={<SaveOutlined />}
                      type="primary"
                      size="large"
                      onClick={() => {
                        setEditVendor(false);
                        updateVendor();
                      }}
                    >
                      Update Vendor
                    </Button>
                  </div> */}
                </div>
              </>
            ) : tab == 1 ? (
              <></>
            ) : (
              <div className="flex flex-col space-y-5">
                {/* Reset password */}
                <div className="bg-white rounded-lg shadow px-5 pb-5">
                  <div className="pb-5">
                    <h6 className="mb-3 pb-0 text-[15px] text-[#263238]">
                      Reset Password
                    </h6>
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
                        <div className="flex flex-row items-center justify-between my-3">
                          <Button
                            type="primary"
                            size="middle"
                            danger
                            htmlType="submit"
                          >
                            Update Password
                          </Button>
                        </div>
                      )}
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )}
          </div>
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
    <div className="payment-request rounded-lg h-[calc(100vh-115px)] mt-6 pb-10 overflow-y-auto">
      {!user ? <h5>Loading ...</h5> : user?.userType === "VENDOR" ? buildVendor() : buildUser()}
    </div>
  );
}
