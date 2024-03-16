import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Form,
  Input,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Tooltip
} from "antd";
import {
  FileTextOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment/moment";
import Highlighter from "react-highlight-words";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PaymentRequestsTable = ({
  dataSet,
  handleSubmitting,
  handleApproveRequest,
  handleDeclineRequest,
  updatingId,
  handleSetRow,
  handleSelectRequest,
}) => {
  let router = useRouter();
  const [form] = Form.useForm();
  const [data, setData] = useState(dataSet);
  let [selectedRow, setSelectedRow] = useState("");
  const antIcon = <LoadingOutlined style={{ fontSize: 9 }} spin />;
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        searchInput.current?.select();
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  function getHighLevelStatus(status) {
    if (status.includes("Approved (")) return "Pending-approval";
    else if (status === "Pending-approval" || status === "Reviewed")
      return "Pending-approval";
    else return status;
  }

  const cancel = () => {
    setEditingKey("");
  };

  const getTagColor = (status) => {
    if (status === "Pending-approval" || status === "Reviewed") return "yellow";
    else if (status === "Pending-review") return "yellow";
    else if (status === "Approved" || status == "Paid") return "green";
    else if (status === "Declined" || status =='Withdrawn') return "red";
  };

  useEffect(() => {
    setData(dataSet);
  }, [dataSet]);

  const columns = [
    {
      title: "Req Number",
      // dataIndex: "number",
      sorter: (a, b) => a?.number - b?.number,
      render: (_, record) => (
        <>
          <div
            className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
            onClick={() => {
              // handleSetRow(record);
              handleSubmitting(true);
              router.push(`/system/payment-requests/${record?._id}`);
            }}
          >
            <div>
              <FileTextOutlined className="text-xs" />
            </div>
            <div className="capitalize text-[14px] text-[#1677FF]">{record?.number}</div>
          </div>
        </>
      ),
      // ...getColumnSearchProps("number"),
    },

    {
      title: "PO Reference",
      // dataIndex: "number",
      sorter: (a, b) => a?.purchaseOrder?.number - b?.purchaseOrder?.number,
      render: (_, record) => (
        <>
          <div
            className=""
            onClick={() => {
              // handleSetRow(record);
              handleSubmitting(true);
              router.push(
                `/system/purchase-orders/${record?.purchaseOrder?._id}`
              );
            }}
          >
            {record?.purchaseOrder ? (
              <div className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline">
                <div>
                  <FileTextOutlined className="text-xs" />
                </div>
                <div className="capitalize text-[14px] text-[#1677FF]">{record?.purchaseOrder?.number}</div>
              </div>
            ) : (
              <div className="text-[14px] self-end">N/A</div>
            )}
          </div>
        </>
      ),
      // ...getColumnSearchProps("number"),
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a?.title?.localeCompare(b?.title),

      // sorter: (a,b)=>moment(a.dueDate).isAfter(moment(b.dueDate)),
      render: (_, record) => (
        <>
          <div className={record?.number === selectedRow ? "font-bold" : ""}>
            <Typography.Text style={{ width: 150 }} className="capitalize text-[14px] text-[#8392AB]" ellipsis={true}>
              {record?.title}
            </Typography.Text>
          </div>
        </>
      ),
    },
    {
      title: "Initiator",
      key: "initiator",
      sorter: (a, b) =>
        a?.createdBy?.firstName?.localeCompare(b?.createdBy?.firstName),
      render: (_, record) => (
        <>
          <Typography.Text className="capitalize text-[14px] text-[#8392AB]">
            {record?.createdBy?.userType !== "VENDOR"
              ? record?.createdBy?.firstName
              : record?.createdBy?.companyName}
          </Typography.Text>
        </>
      ),
    },

    {
      title: "Amount Due",
      key: "amount",
      sorter: (a, b) => a?.amount - b?.amount,
      render: (_, record) => (
        <>
          <Row className="felx flex-row items-center justify-between">
            <Typography.Text className="capitalize text-[14px] text-[#8392AB]">
              {record?.amount?.toLocaleString()} {record?.currency}
            </Typography.Text>
          </Row>
        </>
      ),
    },
    {
      title: "Status",
      key: "status",
      sorter: (a, b) =>
        getHighLevelStatus(
          a?.status.charAt(0).toUpperCase() + a?.status.slice(1)
        ).localeCompare(
          getHighLevelStatus(
            b?.status.charAt(0).toUpperCase() + b?.status.slice(1)
          )
        ),
      render: (_, record) => (
        <>
          <div className={`rounded`}>
            <span className={`bg-${getTagColor(
                getHighLevelStatus(
                  record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
                )
              )}-500/20 text-${getTagColor(
                getHighLevelStatus(
                  record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
                )
              )}-500 text-[13px]`}>
              {getHighLevelStatus(
                record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
              )}
            </span>
          </div>
        </>
      ),
    },
    {
      title: "Internal/External",
      key: "category",
      
      render: (_, record) => (
        <div className="mt-2 text-left font-semibold text-[11px]">
          <small className="bg-[#F1F3FF] rounded-3xl text-[#1677FF] px-4 py-1.5">{record?.category == "internal" ? 'INTERNAL' : 'EXTERNAL'}</small>
        </div>
        // <Tag color={`${record?.category === "internal" ? "blue" : "magenta"}`}>
        //   {record?.category?.charAt(0).toUpperCase() + record?.category?.slice(1)}
        // </Tag>
      ),
    },

    // {
    //   title: "Invoice (s) ",
    //   key: "docs",
    //   sorter: (a, b) => a?.status > b?.status,
    //   render: (_, record) => (
    //     <div className="flex flex-col text-xs">
    //       {record?.docIds?.map((doc, index) => {
    //         const truncatedFileName =
    //           doc?.length >= 11
    //             ? `${doc?.slice(0, 7)}... ${doc?.slice(doc?.lastIndexOf("."))}`
    //             : doc;
    //         return (
    //           <Tooltip title={doc}>
    //             <Typography.Text ellipsis>
    //               <Link
    //                 href={`${url}/file/paymentRequests/${doc}`}
    //                 target="_blank"
    //                 className="capitalize text-[12px] text-[#8392AB]"
    //               >
    //                 {truncatedFileName}
    //               </Link>
    //             </Typography.Text>
    //           </Tooltip>
    //         );
    //       })}
    //     </div>
    //   ),
    // },

    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       {updatingId !== record._id && (
    //         <>
    //           <EllipsisOutlined
    //             className="text-blue-400 cursor-pointer"
    //             onClick={() => {
    //               handleSetRow(record);
    //               setSelectedRow(record.number);
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

  return (
    <Form form={form} component={false}>
      <Table
        size="small"
        dataSource={data}
        columns={columns}
        className="shadow-lg rounded-md"
        // pagination={{
        //   pageSize: 20,
        // }}
      />
    </Form>
  );
};
export default PaymentRequestsTable;
