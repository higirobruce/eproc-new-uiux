"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import _ from "lodash";
import moment from "moment";
import {
  Typography,
  message,
  Button,
  Tag,
  Segmented,
  List,
  Table,
  Form,
  Checkbox,
  Select,
  Input,
  Spin,
  Modal,
  Row,
  Tooltip,
  Col,
  Switch,
} from "antd";
import UsersTable from "../../components/usersTable";
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  BarsOutlined,
  EditOutlined,
  EyeOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  GiftOutlined,
  GlobalOutlined,
  IdcardOutlined,
  LoadingOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  QuestionCircleFilled,
  QuestionCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  DocumentCheckIcon,
  EnvelopeIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import PermissionsTable from "../../components/permissionsTable";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useUser } from "@/app/context/UserContext";
import { useInternalContext } from "@/app/context/InternalContext";

export default function Users() {
  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let router = useRouter();
  const searchParams = useSearchParams()
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  
  const pagination = searchParams.get('page');
  const search = searchParams.get('search');
  const statusFilter = searchParams.get('filter');

  // Routing Context
  const {setPage, setFilter, filter} = useInternalContext();
  
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
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
  const [rdbCertId, setRdbCertId] = useState(null);
  const [vatCertId, setVatCertId] = useState(null);
  const [rdbSelected, setRDBSelected] = useState(false);

  let [searchStatus, setSearchStatus] = useState("all");
  let [searchText, setSearchText] = useState("");
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [editUser, setEditUser] = useState(false);
  const [basicPermissions, setBasicPermissions] = useState([
    "canViewRequests",
    "canCreateRequests",
  ]);

  useEffect(() => {
    setPage(pagination ? pagination : 1);
    setFilter(statusFilter ? statusFilter : 'all')
  }, [pagination, statusFilter])

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select size="large" style={{ width: 100 }}>
        <Select.Option value="+250">+250</Select.Option>
        <Select.Option value="+254">+254</Select.Option>
      </Select>
    </Form.Item>
  );

  const formItemLayout = {
    // labelCol: {
    //   xs: { span: 10 },
    //   sm: { span: 10 },
    // },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  };
  const tailFormItemLayout = {
    // wrapperCol: {
    //   xs: {
    //     span: 24,
    //     offset: 0,
    //   },
    //   sm: {
    //     span: 16,
    //     offset: 8,
    //   },
    // },
  };

  const onFinish = (values) => {};

  useEffect(() => {
    loadUsers();

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

  useEffect(() => {
    if (searchText === "") {
      refresh();
    } else {
      let _dataSet = [...dataset];
      let filtered = _dataSet.filter((d) => {
        return (
          d?.email?.toString().toLowerCase().indexOf(searchText.toLowerCase()) >
            -1 ||
          d?.firstName
            ?.toString()
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1 ||
          d?.lastName
            ?.toString()
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1
        );
      });
      setTempDataset(filtered);
      // else setTempDataset(dataset)
    }
  }, [searchText]);

  useEffect(() => {
    setDataLoaded(false);
    let requestUrl = `${url}/users/internal/byStatus/${filter ? filter : searchStatus}/`;
    fetch(requestUrl, {
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
  }, [searchStatus]);

  useEffect(() => {
    setUpdatingId("");
  }, [dataset]);

  useEffect(() => {
    if (row) loadUsersRequests();
  }, [row]);

  function refresh() {
    loadUsers();
  }

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
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/auth");
        } else {
          return res.json();
        }
      })
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

  function approveUser(id) {
    setUpdatingId(id);
    fetch(`${url}/users/approve/${id}`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        let _data = [...dataset];

        // Find item index using _.findIndex (thanks @AJ Richardson for comment)
        var index = _.findIndex(_data, { _id: id });
        let elindex = _data[index];
        elindex.status = "approved";

        // Replace item at index using native splice
        _data.splice(index, 1, elindex);

        setDataset(_data);
        setTempDataset(_data);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function declineUser(id) {
    setUpdatingId(id);
    fetch(`${url}/users/decline/${id}`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        let _data = [...dataset];

        // Find item index using _.findIndex (thanks @AJ Richardson for comment)
        var index = _.findIndex(_data, { _id: id });
        let elindex = _data[index];
        elindex.status = "rejected";

        // Replace item at index using native splice
        _data.splice(index, 1, elindex);

        setDataset(_data);
        setTempDataset(_data);
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
        loadUsers();
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
        loadUsers();
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
        loadUsers();
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
    newUser.permissions[editPermissionLable] = canCreate;
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
        refresh();
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
        refresh();
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

  return !row ? (
    <>
      {contextHolder}
      {buildCreateUserScreen()}
      {dataLoaded ? (
        <div className="flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-6 h-screen mt-6 pb-10">
          {/* <Row className="flex flex-row justify-between items-center">
            <Typography.Title level={4}>Users</Typography.Title>
            <Row className="flex flex-row space-x-5 items-center">
              <div>
                <Input.Search placeholder="Search users" />
              </div>
              <Tooltip title='Refresh'>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
              ></Button>
              </Tooltip>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOpenCreateUser(true)}
              >
                New user
              </Button>

             
            </Row>
          </Row> */}
          <div className="flex items-center justify-between mr-6">
            <Button
              className="bg-white h-9 px-5 text-[11px] font-semibold rounded text-[#0063CF]"
              icon={<PlusOutlined />}
              onClick={() => setOpenCreateUser(true)}
            >
              New user
            </Button>
            <div className="flex items-center gap-5">
              <Select
                // mode="tags"
                className="text-[9px] w-32 rounded-sm"
                placeholder="Select status"
                onChange={(value) => {
                  setPage(1);
                  setFilter(value); 
                  setSearchStatus(value)
                }}
                value={filter ? filter : searchStatus}
                options={[
                  { value: "all", label: "All" },
                  // {
                  //   value: "pending-approval",
                  //   label: "Pending approval",
                  // },
                  {
                    value: "approved",
                    label: "Approved",
                  },
                  {
                    value: "rejected",
                    label: "Rejected",
                  },
                ]}
              />
              <Button
                type="text"
                className="bg-white h-8 text-[#0063CF]"
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
              ></Button>
            </div>
          </div>
          <div className="request mr-6 bg-white rounded-lg h-[calc(100vh-160px)] mb-10 px-5 pb-2 overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-[19px] text-[#344767]">
                Internal Users List
              </h4>
              <div className="flex items-center rounded-lg bg-[#F5F7FA] p-1.5">
                <FiSearch size={18} className="text-[#E4E4E4] ml-2" />
                <Input
                  onChange={(e) => {
                    setSearchText(e?.target?.value);
                  }}
                  placeholder="Search Email, Names"
                  className="border-0 text-[#8392AB] bg-transparent text-[12px] hover:border-none hover:outline-none"
                />
                <div></div>
              </div>
            </div>
            <UsersTable
              dataSet={tempDataset}
              handleApproveUser={approveUser}
              handleDeclineUser={declineUser}
              updatingId={updatingId}
              handleSetRow={setRow}
            />
          </div>

          <div class="absolute -bottom-28 right-10 opacity-10">
            <Image src="/icons/blue icon.png" width={110} height={100} />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 h-screen">
          <Spin
            indicator={
              <LoadingOutlined
                className="text-gray-500"
                style={{ fontSize: 42 }}
                spin
              />
            }
          />
        </div>
      )}
    </>
  ) : (
    buildUser()
  );

  function buildUser() {
    return (
      <div className="flex flex-col  transition-opacity ease-in-out duration-1000 px-10 py-5 flex-1 space-y-3 overflow-x-scroll">
        {contextHolder}
        <div className="flex flex-col space-y-5">
          <div className="flex flex-row justify-between">
            <div className="flex flex-row items-center space-x-2">
              <div>
                <Button
                  icon={<ArrowLeftOutlined />}
                  type="primary"
                  onClick={() => {
                    setRow(null);
                    setSegment("Permissions");
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
                  <div className="text-lg font-semibold mb-5 flex flex-row justify-between items-center">
                    <div>Module access permissions</div>
                  </div>
                  <PermissionsTable
                    canApproveRequests={row?.permissions?.canApproveRequests}
                    canCreateRequests={row?.permissions?.canCreateRequests}
                    canEditRequests={row?.permissions?.canEditRequests}
                    canViewRequests={row?.permissions?.canViewRequests}
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

                  <div className="text-lg font-semibold my-5 flex flex-row justify-between items-center">
                    <div>Approval permissions</div>
                  </div>
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
                      label="Can approve as a Legal Officer"
                    >
                      <Checkbox
                        defaultChecked={row?.permissions?.canApproveAsLegal}
                        onChange={(e) => setCanApproveAsLegal(e.target.checked)}
                      />
                    </Form.Item>
                  </Form>
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
      </div>
    );
  }

  function buildCreateUserScreen() {
    return (
      <Modal
        centered
        open={openCreateUser}
        onOk={() => {
          form.validateFields().then(
            (value) => {
              createUser(value);
              setOpenCreateUser(false);
            },
            (reason) => {}
          );

          // setOpenCreateUser(false);
        }}
        okText={"Save"}
        onCancel={() => setOpenCreateUser(false)}
        width={"60%"}
        bodyStyle={{ maxHeight: "700px", overflow: "hidden" }}
      >
        <Form
          {...formItemLayout}
          form={form}
          name="newUser"
          onFinish={onFinish}
          initialValues={{
            firstName: "",
            prefix: "+250",
            email: "",
          }}
          scrollToFirstError
        >
          <div className="">
            {/* General Information */}
            <div>
              <Typography.Title className="" level={4}>
                General Information
              </Typography.Title>
              <div className="pt-6">
                {/* Grid 1 */}

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex flex-row spacex-3">
                      First Name
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="firstName"
                      // label="Contact Person's Names"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        className="h-11 mt-3"
                        placeholder="Enter First name"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex flex-row spacex-3">
                      Last Name
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="lastName"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        className="h-11 mt-3"
                        placeholder="Enter Last name"
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex flex-row spacex-3">
                      Phone number
                      {/* <div className="text-red-500">*</div> */}
                    </div>
                    <Form.Item
                      name="telephone"
                      // rules={[
                      //   {
                      //     required: true,
                      //     message: "Input required",
                      //   },
                      // ]}
                    >
                      <Input className="mt-3" addonBefore={prefixSelector} />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex flex-row spacex-3 mb-3">
                      Department
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="department"
                      required
                      rules={[{ required: true, message: "Input required" }]}
                    >
                      <Select
                        // mode="multiple"
                        // allowClear
                        // style={{width:'100%'}}
                        size="large"
                        placeholder="Please select"
                      >
                        {dpts?.map((dpt) => {
                          return (
                            <Select.Option key={dpt._id} value={dpt._id}>
                              {dpt.description}
                            </Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="flex flex-row spacex-3 mb-3">
                      Email
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="email"
                      // label="E-mail"
                      rules={[
                        {
                          type: "email",
                          message: "The input is not valid E-mail!",
                        },
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input className="h-10" placeholder="Enter email" />
                    </Form.Item>
                  </div>

                  <div>
                    <div className="flex flex-row space-x-1 mb-3">
                      <div className="flex flex-row">
                        Basic Permissions <div className="text-red-500">*</div>
                      </div>

                      <div>
                        <Tooltip title="For more advanced module access permissions, please refer to the user details page after creating this user account.">
                          <div>
                            <QuestionCircleOutlined />
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                    <Form.Item
                      name="permissions"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                      initialValue={[
                        {
                          value: "canViewRequests",
                          label: "View Purchase requests",
                        },
                        {
                          value: "canCreateRequests",
                          label: "Create Purchase requests",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        size="large"
                        // style={{width:'100%'}}
                        placeholder="Please select"
                        options={[
                          {
                            value: "canViewRequests",
                            label: "View Purchase requests",
                          },
                          {
                            value: "canCreateRequests",
                            label: "Create Purchase requests",
                          },
                          {
                            value: "canViewPurchaseOrders",
                            label: "View Purchase Orders",
                          },
                        ]}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </Modal>
    );
  }
}
