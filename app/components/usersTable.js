"use client";
import React, { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Spin,
  Table,
  Tooltip,
  Typography,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useInternalContext } from "../context/InternalContext";

const UsersTable = ({
  dataSet,
  handleApproveUser,
  handleDeclineUser,
  updatingId,
  handleSetRow,
}) => {
  let router = useRouter();
  const [form] = Form.useForm();
  const [data, setData] = useState(dataSet);
  const antIcon = <LoadingOutlined style={{ fontSize: 9 }} spin />;
  const {page, setPage, filter} = useInternalContext()

  const cancel = () => {
    setEditingKey("");
  };

  useEffect(() => {
    setData(dataSet);
  }, [dataSet]);

  const getTagColor = (status) => {
    if (status === "pending-approval") return "yellow";
    else if (status === "approved") return "green";
    else if (status === "rejected") return "red";
  };


  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      render: (_, record) => (
        <>
          <div
            className="cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
            onClick={() => {
              router.push(`/system/users/${record._id}?page=${page}&filter=${filter}`);
              // if(!record?.permissions) record.permissions={}
              // handleSetRow(record)
            }}
          >
            <div className="text-[14px]">{record?.email}</div>
          </div>
        </>
      ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      sorter: (a, b) => a.firstName.localeCompare(b.firstName),
      render: (_, record) => (
        <>
          <div className="space-x-1 flex flex-row items-center">
            {/* <div>
              <UserOutlined className="text-xs" />
            </div> */}
            <div className="text-[14px] text-[#8392AB]">{record?.firstName}</div>
          </div>
        </>
      ),
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
      render: (_, record) => (
        <>
          <div className="space-x-1 flex flex-row items-center">
            {/* <div>
              <UserOutlined className="text-xs" />
            </div> */}
            <div className="text-[14px] text-[#8392AB]">{record?.lastName}</div>
          </div>
        </>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      sorter: (a, b) =>
        a.department?.description.localeCompare(b.department?.description),
      render: (_, record) => <div className=" capitalize text-[14px] text-[#8392AB]">{record?.department?.description.toLowerCase()}</div>,
    },

    {
      title: "Phone",
      dataIndex: "telephone",
      sorter: (a, b) => a.telephone > b.telephone,
      render: (_, record) => <div className="text-[14px] text-[#8392AB]">{record?.telephone}</div>
    },
    {
      title: "Status",
      key: "action",
      sorter: (a, b) => a.telephone > b.telephone,
      render: (_, record) => (
        <>
          <div className={`rounded`}>
            <span className={`bg-${getTagColor(record?.status)}-500/20 text-${getTagColor(record?.status)}-500 text-[13px]`}>
              {record?.status}
            </span>
          </div>
        </>
        
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          {updatingId !== record._id && (
            <>
              {record.status !== "approved" && (
                <Tooltip title="Approve">
                  <span>
                    <CheckOutlined
                      className="text-green-400 cursor-pointer"
                      onClick={() => approve(record._id)}
                    />
                  </span>
                </Tooltip>
              )}
              {record.status !== "rejected" && (
                <Tooltip title="Reject">
                  <CloseOutlined
                    className="text-red-400 cursor-pointer"
                    onClick={() => decline(record._id)}
                  />
                </Tooltip>
              )}
            </>
          )}

          {updatingId === record._id && (
            <Spin size="small" indicator={antIcon} />
          )}
        </Space>
      ),
    },
  ];

  async function approve(id) {
    handleApproveUser(id);
  }

  async function decline(id) {
    handleDeclineUser(id);
  }

  return (
    <Form form={form} component={false}>
      <Table
        size="small"
        className="shadow-lg rounded-md"
        dataSource={data}
        columns={columns}
        rowClassName="editable-row"
        pagination={{defaultCurrent: page ? +page : 1, onChange: (page, pageSize) => setPage(page)}}
      />
    </Form>
  );
};
export default UsersTable;
