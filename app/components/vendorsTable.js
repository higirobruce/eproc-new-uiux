"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Badge, Form, Rate, Spin, Table } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useVendorContext } from "../context/VendorContext";

const VendorsTable = ({
  dataSet,
  handleApproveUser,
  handleDeclineUser,
  updatingId,
  handleBanUser,
  handleSetRow,
  handleActivateUser,
}) => {
  const [form] = Form.useForm();
  let router = useRouter();
  const [data, setData] = useState(dataSet);
  const {page, setPage, filter} = useVendorContext()
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let token = typeof window !== 'undefined' && localStorage.getItem('token');

  useEffect(() => {
    setData(dataSet);
  }, [dataSet]);

  async function getVendorRate(id) {
    return fetch(`${url}/users/vendors/rate/${id}`, {
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        return 2;
      });
  }

  const getTagColor = (status) => {
    if (status === "Pending-approval" || status === "Reviewed") return "yellow";
    else if (status === "pending-approval") return "yellow";
    else if (status === "approved") return "green";
    else if (status === "rejected" || status =='declined') return "red";
  };

  const columns = [
    {
      title: "Company Name",
      // dataIndex: "vendor.number",
      sorter: (a, b) =>
      b.vendor?.companyName.localeCompare(a.vendor?.companyName),
      render: (_, record) => (
        <>
          <div
            className="cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
            onClick={() => {
              // handleSetRow(record)
              router.push(`/system/vendors/${record?._id}?page=${page}&filter=${filter}`);
            }}
          >
            {/* <div>
              <UserOutlined className="text-xs" />
            </div> */}
            <div className="capitalize text-[14px]">{record?.vendor?.companyName.toLowerCase()}</div>
          </div>
        </>
      ),
    },
    {
      title: "TIN",
      // dataIndex: "tin",
      sorter: (a, b) => b.vendor?.tin - a.vendor?.tin,
      render: (_, record) => (
        <>
          <div className="cursor-pointer space-x-1 flex flex-row items-center">
            {/* <div>
              <UserOutlined className="text-xs" />
            </div> */}
            <div className="text-[14px] text-[#8392AB]">{record?.vendor?.tin}</div>
          </div>
        </>
      ),
    },
    {
      title: "Contact person email",
      dataIndex: "email",
      sorter: (a, b) => b.vendor?.email - a.vendor?.email,
      render: (_, record) => (
        <>
          <div className="cursor-pointer space-x-1 flex flex-row items-center">
            {/* <div>
              <UserOutlined className="text-xs" />
            </div> */}
            <div className="text-[14px] text-[#8392AB]">{record?.vendor?.email}</div>
          </div>
        </>
      ),
    },
    {
      title: "Phone",
      dataIndex: "telephone",
      sorter: (a, b) => b.vendor?.telephone - a.vendor?.telephone,
      render: (_, record) => (
        <>
          <div className="cursor-pointer space-x-1 flex flex-row items-center">
            {/* <div>
              <UserOutlined className="text-xs" />
            </div> */}
            <div className="text-[14px] text-[#8392AB]">{record?.vendor?.telephone}</div>
          </div>
        </>
      ),
    },
    {
      title: "Status",
      key: "action",
      sorter: (a, b) => b.vendor?.status - a.vendor?.status,
      render: (_, record) => (
        <>
          <div className={`rounded`}>
            <span className={`bg-${getTagColor(record?.vendor?.status)}-500/20 text-${getTagColor(record?.vendor?.status)}-500 capitalize text-[14px]`}>
              {(record?.vendor?.status).toString()}
            </span>
          </div>
        </>
        // <>
        //   {record?.vendor?.status === "pending-approval" && (
        //     <Badge color="yellow" text={record?.vendor?.status} />
        //   )}

        //   {record?.vendor?.status === "approved" && (
        //     <Badge color="green" text={record?.vendor?.status} />
        //   )}

        //   {record?.vendor?.status === "declined" && (
        //     <Badge color="red" text={record?.vendor?.status} />
        //   )}

        //   {record?.vendor?.status === "rejected" && (
        //     <Badge color="red" text={record?.vendor?.status} />
        //   )}
        // </>
      ),
    },
    {
      title: "Rating",
      // dataIndex: "vendor.telephone",
      render: (_, record) => {
        return (
          <Rate
            tooltips={["Very bad", "Bad", "Good", "Very good", "Excellent"]}
            count={5}
            disabled
            value={record?.avgRate}
          />
        );
      },
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       {updatingId !== record?.vendor?._id && (
    //         <>
    //           {record?.vendor?.status === "created" && (
    //             <Popover content="Approve">
    //               <span><Popconfirm
    //                 title="Approve vendor"
    //                 description="Are you sure to approve this vendor?"
    //                 okText="Yes"
    //                 cancelText="No"
    //                 onConfirm={() => approve(record?.vendor?._id)}
    //               >
    //                 <CheckOutlined className="text-green-400 cursor-pointer" />
    //               </Popconfirm></span>
    //             </Popover>
    //           )}
    //           {record?.vendor?.status === "declined" && (
    //             <Popover content="Activate">
    //              <span> <Popconfirm
    //                 title="Activate vendor"
    //                 description="Are you sure to activate this vendor?"
    //                 okText="Yes"
    //                 cancelText="No"
    //                 onConfirm={() => activate(record?.vendor?._id)}
    //               >
    //                 <SafetyCertificateOutlined className="text-green-400 cursor-pointer" />
    //               </Popconfirm></span>
    //             </Popover>
    //           )}
    //           {record?.vendor?.status === "approved" && (
    //             <Popover content="Ban">
    //               <span><Popconfirm
    //                 title="Ban vendor"
    //                 description="Are you sure to ban this vendor?"
    //                 okText="Yes"
    //                 cancelText="No"
    //                 onConfirm={() => ban(record?.vendor?._id)}
    //               >
    //                 <StopOutlined className="text-red-400 cursor-pointer" />
    //               </Popconfirm></span>
    //             </Popover>
    //           )}
    //           {record?.vendor?.status === "banned" && (
    //             <Popover content="Activate">
    //               <span><Popconfirm
    //                 title="Acivate vendor"
    //                 description="Are you sure to activate this vendor?"
    //                 okText="Yes"
    //                 cancelText="No"
    //                 onConfirm={() => activate(record?.vendor?._id)}
    //               >
    //                 <SafetyCertificateOutlined className="text-green-400 cursor-pointer" />
    //               </Popconfirm></span>
    //             </Popover>
    //           )}
    //         </>
    //       )}

    //       {updatingId === record?.vendor?._id && (
    //         <Spin size="small" indicator={antIcon} />
    //       )}
    //     </Space>
    //   ),
    // },
  ];

  async function approve(id) {
    handleApproveUser(id);
  }

  async function decline(id) {
    handleDeclineUser(id);
  }

  async function ban(id) {
    handleBanUser(id);
  }

  async function activate(id) {
    handleActivateUser(id);
  }

  return (
    <Suspense
      fallback={
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
      }
    >
      <Form form={form} component={false}>
        <Table
          size="small"
          dataSource={data}
          columns={columns}
          className="shadow-lg rounded-md"
          pagination={{defaultCurrent: page ? +page : 1, onChange: (page, pageSize) => setPage(page)}}
        />
      </Form>
    </Suspense>
  );
};
export default VendorsTable;
