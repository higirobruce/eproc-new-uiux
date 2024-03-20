"use client";
import React, { useEffect, useState } from "react";
import { Badge, Form, Row, Table, Tag, Typography } from "antd";
import {
  FileDoneOutlined,
  FileProtectOutlined,
  FileWordFilled,
  LoadingOutlined,
} from "@ant-design/icons";
import moment from "moment/moment";
import { useRouter } from "next/navigation";

const TendersTable = ({
  dataSet,
  handleApproveRequest,
  handleDeclineRequest,
  updatingId,
  handleSetRow,
  user,
}) => {
  let router = useRouter();
  const [form] = Form.useForm();
  const [data, setData] = useState(dataSet);
  const antIcon = <LoadingOutlined style={{ fontSize: 9 }} spin />;

  const cancel = () => {
    setEditingKey("");
  };

  useEffect(() => {
    setData(dataSet)
  }, [dataSet]);

  const columns =
    user?.userType !== "VENDOR"
      ? [
          {
            title: "Tender Number",
            dataIndex: "number",
            sorter: (a, b) => b?.number > a?.number,
            render: (_, record) => (
              <>
                <div
                  className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
                  onClick={() => {
                    router.push(`/system/tenders/${record?._id}`);
                  }}
                >
                  <div>
                    <FileProtectOutlined />
                  </div>
                  <div className="capitalize text-[14px]">{record?.number}</div>
                </div>
              </>
            ),
          },
          {
            title: "Request reference",
            key: "request",
            sorter: (a, b) => b?.request > a?.request,
            render: (_, record) => (
              <>
                <div
                  className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
                  onClick={() => {
                    router.push(
                      `/system/requests/${record?.purchaseRequest?._id}`
                    );
                  }}
                >
                  <div>
                    <FileDoneOutlined />
                  </div>
                  <div className="capitalize text-[14px]">{record?.purchaseRequest?.number}</div>
                </div>
              </>
            ),
          },
          {
            title: "Title",
            key: "title",
            sorter: (a, b) => b > a,
            render: (_, record) => (
              <>
                <Typography.Text className="capitalize text-[#8392AB] text-[14px]">
                  {record?.purchaseRequest?.title.toLowerCase()}
                </Typography.Text>
              </>
            ),
          },
          {
            title: "Department",
            key: "department",
            sorter: (a, b) => b > a,
            render: (_, record) => (
              <>
                <Typography.Text className="capitalize text-[#8392AB] text-[14px]">
                  {record?.createdBy?.department?.description.toLowerCase()}
                </Typography.Text>
              </>
            ),
          },

          {
            title: "Category",
            key: "category",
            sorter: (a, b) => b > a,
            render: (_, record) => (
              <>
                <Typography.Text className="capitalize text-[#8392AB] text-[14px]">
                  {record?.purchaseRequest?.serviceCategory.toLowerCase()}
                </Typography.Text>
              </>
            ),
          },

          {
            title: "Closing date",
            key: "submissionDeadLine",
            sorter: (a, b) =>
              moment(a.submissionDeadLine).isAfter(
                moment(b.submissionDeadLine)
              ),
            render: (_, record) => (
              <>
                <Row className="felx flex-row items-center justify-between">
                  <Typography.Text className="capitalize text-[#8392AB] text-[14px]">
                    {moment(record?.submissionDeadLine).format("YYYY-MMM-DD")}{" "}
                  </Typography.Text>
                  {/* <Typography.Text>
              <Tag color="lime">
                <Statistic.Countdown
                  className="text-xs text-gray-500"
                  valueStyle={{ fontSize: "0.75rem", lineHeight: "1rem" }}
                  format="DD:HH:mm:ss"
                  value={moment(record?.submissionDeadLine)}
                />
              </Tag>
            </Typography.Text> */}
                </Row>
              </>
            ),
          },

          {
            title: "Status",
            key: "action",
            sorter: (a, b) => b > a,
            render: (_, record) => (
              <>
                <div className={`bg-${moment().isBefore(moment(record?.submissionDeadLine)) ? 'yellow' : moment().isAfter(moment(record?.submissionDeadLine)) && 'green'}-500/15 rounded`}>
                  <span className={`text-${moment().isBefore(moment(record?.submissionDeadLine)) ? 'yellow' : moment().isAfter(moment(record?.submissionDeadLine)) && 'green'}-500 text-[13px]`}>
                    {moment().isBefore(moment(record?.submissionDeadLine)) ? 'Open' : moment().isAfter(moment(record?.submissionDeadLine)) && 'Closed'}
                  </span>
                </div>
              </>
            ),
          },
          // {
          //   title: "Action",
          //   key: "action",
          //   render: (_, record) => (
          //     <Space size="middle">
          //       {updatingId !== record._id && (
          //         <>
          //           {record.status !== "approved" && (
          //             <CheckOutlined
          //               className="text-green-400 cursor-pointer"
          //               onClick={() => approve(record._id)}
          //             />
          //           )}
          //           {record.status !== "declined" && (
          //             <CloseOutlined
          //               className="text-red-400 cursor-pointer"
          //               onClick={() => decline(record._id)}
          //             />
          //           )}
          //           <EllipsisOutlined
          //             className="text-blue-400 cursor-pointer"
          //             onClick={() => {
          //               handleSetRow(record);
          //             }}
          //           />
          //         </>
          //       )}

          //       {updatingId === record._id && (
          //         <Spin size="small" indicator={antIcon} />
          //       )}
          //     </Space>
          //   ),
          // },
        ]
      : [
          {
            title: "Tender Number",
            dataIndex: "number",
            render: (_, record) => (
              <>
                <div
                  className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
                  onClick={() => {
                    router.push(`/system/tenders/${record?._id}`);
                  }}
                >
                  <div>
                    <FileProtectOutlined />
                  </div>
                  <div className="capitalize text-[14px]">{record?.number}</div>
                </div>
              </>
            ),
          },
          {
            title: "Title",
            key: "title",
            render: (_, record) => (
              <>
                <Typography.Text className="capitalize text-[14px]">
                  {record?.purchaseRequest?.title}
                </Typography.Text>
              </>
            ),
          },

          {
            title: "Category",
            key: "category",
            render: (_, record) => (
              <>
                <Typography.Text className="capitalize text-[14px]">
                  {record?.purchaseRequest?.serviceCategory.toLowerCase()}
                </Typography.Text>
              </>
            ),
          },

          {
            title: "Closing date",
            key: "submissionDeadLine",
            render: (_, record) => (
              <>
                <Row className="flex flex-row items-center justify-between">
                  <Typography.Text className="capitalize text-[14px]">
                    {moment(record?.submissionDeadLine).format("YYYY-MMM-DD")}{" "}
                  </Typography.Text>
                  {/* <Typography.Text>
              <Tag color="lime">
                <Statistic.Countdown
                  className="text-xs text-gray-500"
                  valueStyle={{ fontSize: "0.75rem", lineHeight: "1rem" }}
                  format="DD:HH:mm:ss"
                  value={moment(record?.submissionDeadLine)}
                />
              </Tag>
            </Typography.Text> */}
                </Row>
              </>
            ),
          },

          {
            title: "Status",
            key: "action",
            render: (_, record) => (
              <div className={`bg-${moment().isBefore(moment(record?.submissionDeadLine)) ? 'yellow' : moment().isAfter(moment(record?.submissionDeadLine)) && 'green'}-500/15 rounded`}>
                <span className={`text-${moment().isBefore(moment(record?.submissionDeadLine)) ? 'yellow' : moment().isAfter(moment(record?.submissionDeadLine)) && 'green'}-500 text-[13px]`}>
                  {moment().isBefore(moment(record?.submissionDeadLine)) ? 'Open' : moment().isAfter(moment(record?.submissionDeadLine)) && 'Closed'}
                </span>
              </div>
            ),
          },
          // {
          //   title: "Action",
          //   key: "action",
          //   render: (_, record) => (
          //     <Space size="middle">
          //       {updatingId !== record._id && (
          //         <>
          //           {record.status !== "approved" && (
          //             <CheckOutlined
          //               className="text-green-400 cursor-pointer"
          //               onClick={() => approve(record._id)}
          //             />
          //           )}
          //           {record.status !== "declined" && (
          //             <CloseOutlined
          //               className="text-red-400 cursor-pointer"
          //               onClick={() => decline(record._id)}
          //             />
          //           )}
          //           <EllipsisOutlined
          //             className="text-blue-400 cursor-pointer"
          //             onClick={() => {
          //               handleSetRow(record);
          //             }}
          //           />
          //         </>
          //       )}

          //       {updatingId === record._id && (
          //         <Spin size="small" indicator={antIcon} />
          //       )}
          //     </Space>
          //   ),
          // },
        ];

  async function approve(id) {
    handleApproveRequest(id);
  }

  async function decline(id) {
    handleDeclineRequest(id);
  }

  return (
    <Form form={form} component={false}>
      <Table
        size="small"
        dataSource={data}
        columns={columns}
        className="shadow-lg rounded-md"
        // pagination={{
        //   total: 20
        // }}
        // pagination={{
        //   onChange: cancel,
        // }}
      />
    </Form>
  );
};
export default TendersTable;
