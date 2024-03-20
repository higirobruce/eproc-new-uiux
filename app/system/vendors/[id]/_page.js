"use client";
import {
  Typography,
  Button,
  Tag,
  Segmented,
  List,
  Empty,
  Switch,
  Select,
  Spin,
  Popconfirm,
  Rate,
  Form,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import {
  ArrowLeftOutlined,
  CompassOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  GiftOutlined,
  GlobalOutlined,
  HomeFilled,
  IdcardOutlined,
  LoadingOutlined,
  MailOutlined,
  PaperClipOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import UploadRDCerts from "@/app/components/uploadRDBCerts";
import { v4 } from "uuid";
import UploadVatCerts from "@/app/components/uploadVatCerts";
import { useUser } from "@/app/context/UserContext";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getVendorDetails(id, router) {
  let token = localStorage.getItem("token");
  const res = await fetch(`${url}/users/vendors/byId/${id}`, {
    headers: {
      Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
      "Content-Type": "application/json",
      token: token,
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
  const { user, login, logout } = useUser();
  // let user = JSON.parse(localStorage.getItem("user"));
  let token = localStorage.getItem("token");
  let router = useRouter();
  const [passwordForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  let [dataset, setDataset] = useState([]);
  let [tempDataset, setTempDataset] = useState([]);
  let [updatingId, setUpdatingId] = useState("");
  let [rowData, setRowData] = useState(null);
  let [segment, setSegment] = useState("Bids");
  let [vendorsBids, setVendorsBids] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(false);
  const [attachmentId, setAttachmentId] = useState(null);
  const [editVendor, setEditVendor] = useState(false);
  let [servCategories, setServCategories] = useState([]);
  let [submitting, setSubmitting] = useState(false);
  const [rdbCertId, setRdbCertId] = useState(null);
  const [vatCertId, setVatCertId] = useState(null);
  const [rdbSelected, setRDBSelected] = useState(false);
  const [vatSelected, setVatSelected] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState("");

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    let uuid = v4();
    let vatUuid = v4();
    getVendorDetails(params?.id, router).then((res) => {
      setRowData(res[0]?.vendor);
      setRdbCertId(
        res[0]?.vendor?.rdbCertId ? res[0]?.vendor?.rdbCertId : uuid
      );
      setVatCertId(
        res[0]?.vendor?.vatCertId ? res[0]?.vendor?.vatCertId : vatUuid
      );
    });

    fetch(`${url}/serviceCategories`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setServCategories(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });
  }, [params]);

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

  function refresh() {
    let uuid = v4();
    let vatUuid = v4();
    getVendorDetails(params?.id, router).then((res) => {
      setRDBSelected(false);
      setVatSelected(false);
      setRowData(res[0]?.vendor);
      setRdbCertId(
        res[0]?.vendor?.rdbCertId ? res[0]?.vendor?.rdbCertId : uuid
      );
      setVatCertId(
        res[0]?.vendor?.vatCertId ? res[0]?.vendor?.vatCertId : vatUuid
      );
    });

    fetch(`${url}/serviceCategories`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setServCategories(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
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
        if (res.error) {
          setUpdatingId(null);
          messageApi.open({
            type: "error",
            content: res.message,
          });
        } else {
          res.avgRate = rowData.avgRate;
          res.status = "approved";
          setRowData(res);
          setUpdatingId(null);
          messageApi.open({
            type: "success",
            content: "Successfully approved!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
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
        res.avgRate = rowData.avgRate;
        setRowData(res);
        setUpdatingId(null);
      })
      .catch((err) => {
        setUpdatingId(null);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function banVendor(id) {
    setUpdatingId(id);
    fetch(`${url}/users/ban/${id}`, {
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
        elindex.status = res?.status;
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

  function activateVendor(id) {
    setUpdatingId(id);
    fetch(`${url}/users/activate/${id}`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = rowData.avgRate;
        setRowData(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateVendor() {
    fetch(`${url}/users/${rowData?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newUser: rowData,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = rowData.avgRate;
        setRowData(res);
        refresh();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateRDBCert(id) {
    rowData.rdbCertId = id;
    fetch(`${url}/users/${rowData?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newUser: rowData,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = rowData.avgRate;
        setRowData(res);
        refresh();
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateVATCert(id) {
    rowData.vatCertId = id;
    fetch(`${url}/users/${rowData?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newUser: rowData,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = rowData.avgRate;
        setRowData(res);
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

    fetch(`${url}/users/reset/${rowData?.email}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        res.avgRate = rowData.avgRate;
        messageApi.open({
          type: "info",
          content: "Vendor password was successfully reset",
        });
        setRowData(res);
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
        opacity: rowData ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        type: "tween",
        ease: "circOut",
      }}
      className="flex flex-col  transition-opacity ease-in-out duration-1000 px-10 py-5 flex-1 space-y-3 h-full"
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
                  router.push("/system/vendors");
                }}
              >
                Back to vendors
              </Button>
            </div>

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

                {updatingId !== rowData?._id && (
                  <div>
                    {rowData?.status === "pending-approval" && (
                      <span>
                        <Popconfirm
                          title="Approve vendor"
                          description="Are you sure?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={() => approveUser(rowData?._id)}
                        >
                          <div className="flex flex-row items-center justify-center text-sm ring-1 ring-green-400 rounded px-2 py-1 cursor-pointer bg-green-200">
                            Approve
                          </div>
                        </Popconfirm>
                      </span>
                    )}

                    {rowData?.status === "rejected" && (
                      <span>
                        <Popconfirm
                          title="Approve vendor"
                          description="Are you sure to activate this vendor?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={() => approveUser(rowData?._id)}
                        >
                          <div className="flex flex-row items-center justify-center text-sm ring-1 ring-green-400 rounded px-2 py-1 cursor-pointer bg-green-200">
                            Approve
                          </div>
                        </Popconfirm>
                      </span>
                    )}

                    {rowData?.status === "approved" && (
                      <span>
                        <Popconfirm
                          title="Reject vendor"
                          description="Are you sure?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={() => declineUser(rowData?._id)}
                        >
                          <div className="flex flex-row items-center justify-center text-sm ring-1 ring-red-400 rounded px-2 py-1 cursor-pointer bg-red-200">
                            Reject
                          </div>
                        </Popconfirm>
                      </span>
                    )}
                    {rowData?.status === "banned" && (
                      <span>
                        <Popconfirm
                          title="Acivate vendor"
                          description="Are you sure?"
                          okText="Yes"
                          cancelText="No"
                          onConfirm={() => activateVendor(rowData?._id)}
                        >
                          <div className="flex flex-row items-center justify-center text-sm ring-1 ring-green-400 rounded px-2 py-1 cursor-pointer bg-green-200">
                            Activate
                          </div>
                        </Popconfirm>
                      </span>
                    )}
                  </div>
                )}
                {updatingId === rowData?._id && (
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
                  <HomeFilled className="text-gray-400" />
                  <div className="text-sm flex flex-row items-center space-x-2">
                    <Typography.Text
                      editable={
                        editVendor && {
                          onChange: (e) => {
                            let r = { ...rowData };
                            r.companyName = e;
                            setRowData(r);
                          },
                          text: rowData?.companyName,
                        }
                      }
                    >
                      {rowData?.companyName}
                    </Typography.Text>{" "}
                    {/* {editVendor && (
                        <Typography.Text
                          editable={
                            editVendor && {
                              onChange: (e) => {
                                let r = { ...rowData };
                                r.title = e;
                                setRowData(r);
                              },
                              text: rowData?.title,
                            }
                          }
                        >
                          {rowData?.title}
                        </Typography.Text>
                      )} */}
                    {!editVendor && (
                      <Rate
                        tooltips={[
                          "Very bad",
                          "Bad",
                          "Good",
                          "Very good",
                          "Excellent",
                        ]}
                        count={5}
                        disabled
                        value={rowData?.avgRate}
                      />
                    )}
                  </div>
                </div>

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
                          text: rowData?.contactPersonNames,
                        }
                      }
                    >
                      {rowData?.contactPersonNames}
                    </Typography.Text>{" "}
                    {!editVendor && (
                      <div>
                        <Tag color="cyan">Position: {rowData?.title}</Tag>
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
                            text: rowData?.title,
                          }
                        }
                      >
                        {rowData?.title}
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
                        text: rowData?.email,
                      }
                    }
                    className="text-sm"
                  >
                    {rowData?.email}{" "}
                  </Typography.Text>
                </div>

                <div className="flex flex-row items-center space-x-10">
                  <IdcardOutlined className="text-gray-400" />
                  <Typography.Text
                    editable={
                      editVendor && {
                        onChange: (e) => {
                          let r = { ...rowData };
                          r.tin = e;
                          setRowData(r);
                        },
                        text: rowData?.tin,
                      }
                    }
                    className="text-sm "
                  >
                    TIN: {rowData?.tin}{" "}
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
                        text: rowData?.telephone,
                      }
                    }
                    className="text-sm "
                  >
                    {rowData?.telephone}{" "}
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
                          text: rowData?.webSite,
                        }
                      }
                    >
                      {rowData?.webSite}{" "}
                    </Typography.Link>
                  </div>
                </div>

                <div className="flex flex-row items-center space-x-10">
                  <GiftOutlined className="text-gray-400" />
                  {!editVendor && (
                    <div className="grid grid-cols-1 gap-2">
                      {rowData?.services?.map((s) => {
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
                      defaultValue={rowData?.services?.map((s) => {
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
                            text: rowData?.hqAddress,
                          }
                        }
                      >
                        {rowData?.hqAddress} ,
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
                            text: rowData?.country,
                            tooltip: "Edit Country",
                          }
                        }
                      >
                        {rowData?.country}
                      </Typography.Text>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white ring-1 ring-gray-100 rounded shadow p-5">
              <div className="text-xl font-semibold mb-5 flex flex-row justify-between items-center">
                <div>Attachements</div>
              </div>
              <div className="flex flex-col space-y-2">
                <div className="flex flex-row items-center space-x-10">
                  <PaperClipOutlined className="text-gray-400" />
                  

                  {!rowData?.rdbCertId && (
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
                  {rowData?.vatCertId && (
                    <div className="flex flex-row items-center">
                      <Link
                        href={`${url}/file/vatCerts/${rowData?.vatCertId}.pdf`}
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

                  {!rowData?.vatCertId && (
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
            {user?.permissions?.canEditVendors && (
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
                          Update vendor password
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                </Form>
              </div>
            )}
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
        {/* {previewAttachmentModal()} */}
      </div>
    </motion.div>
  );
}
