import React, { useEffect, useRef, useState } from "react";
import {
  Badge,
  Button,
  Form,
  Input,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  LoadingOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import moment from "moment/moment";
import Highlighter from "react-highlight-words";
import { useRouter } from "next/navigation";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";

const UsersRequestsTable = ({
  dataSet,
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
    // return status

    if (status === "Approved" || status === "Declined" || status=='Withdrawn') {
      return status;
    } else if (status === "Approved (pm)" || status == "Approved (fd)") {
      return "Pending PROC";
    } else if (status === "Pending") {
      return "Pending HOD";
    } else if (status === "Approved (hod)") {
      return "Pending FIN";
    }
  }

  const cancel = () => {
    setEditingKey("");
  };

  const getTagColor = (status) => {
    if (status === "Pending HOD") return "yellow";
    else if (status === "Approved") return "green";
    else if (status === "Approved (fd)" || status === "Pending PROC") return "cyan";
    else if (status === "Approved (pm)" || status === "Pending PROC") return "geekblue";
    else if (status === "approved (hod)" || status === "Pending FIN") return "blue";
    else if (status === "Declined" || status === "Withdrawn") return "red";
  };

  useEffect(() => {
    setData(dataSet);
  }, [dataSet]);

  const columns = [
    {
      title: "Req Number",
      // dataIndex: "number",
      sorter: (a, b) => a?.number > b?.number,
      render: (_, record) => (
        <>
          <div
            className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline"
            onClick={() => {
              // handleSetRow(record);
              router.push(`/system/requests/${record?._id}`);
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
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a?.title > a?.title,
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
        a?.createdBy?.department?.description >
        b?.createdBy?.department?.description,
      render: (_, record) => (
        <>
          <Typography.Text className="capitalize text-[14px] text-[#8392AB]">{record?.createdBy?.firstName.toLowerCase()}</Typography.Text>
        </>
      ),
    },
    {
      title: "Department",
      key: "department",
      sorter: (a, b) =>
        a?.createdBy?.department?.description >
        b?.createdBy?.department?.description,
      render: (_, record) => (
        <>
          <Typography.Text className="capitalize text-[14px] text-[#8392AB]">
            {record?.createdBy?.department?.description.toLowerCase()}
          </Typography.Text>
        </>
      ),
    },
    {
      title: "Category",
      key: "serviceCategory",
      sorter: (a, b) => a?.serviceCategory > b?.serviceCategory,
      render: (_, record) => (
        <>
          <Typography.Text className="text-[14px] text-[#8392AB]">{record?.serviceCategory}</Typography.Text>
        </>
      ),
    },

    {
      title: "Budgeted?",
      key: "budgeted",
      sorter: (a, b) => a?.budgeted > b?.budgeted,
      render: (_, record) => (
        <>
          {record.budgeted && <IoMdCheckmarkCircleOutline size={18} className="text-[#01AF65]" />}
          {!record.budgeted && <IoMdCloseCircleOutline size={18} className="text-[#F5365C]" />}
        </>
      ),
    },
    {
      title: "Due date",
      key: "dueDate",
      sorter: (a, b) => moment(a.dueDate).isAfter(moment(b.dueDate)),
      render: (_, record) => (
        <>
          <Row className="felx flex-row items-center justify-between">
            <Typography.Text className="text-[14px] text-[#8392AB]">
              {moment(record?.dueDate).fromNow()}{" "}
            </Typography.Text>
          </Row>
        </>
      ),
    },

    {
      title: "Status",
      key: "status",
      sorter: (a, b) => a?.status > b?.status,
      render: (_, record) => (
        <>
        <div className={`bg-${getTagColor(
              getHighLevelStatus(
                record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
              )
            )}-500/10 rounded`}>
          <span className={`text-${getTagColor(
              getHighLevelStatus(
                record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
              )
            )}-500 text-[13px]`}>
            {getHighLevelStatus(
              record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
            )}
          </span>
        </div>
          {/* <Badge
            color={getTagColor(
              getHighLevelStatus(
                record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
              )
            )}
            text={getHighLevelStatus(
              record?.status.charAt(0).toUpperCase() + record?.status.slice(1)
            )}
          /> */}
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

  async function approve(id) {
    handleApproveRequest(id);
  }

  async function decline(id) {
    handleDeclineRequest(id);
  }

  return (
    <Form form={form} component={false}>
      <div className="request-table">
        <Table
          size="small"
          dataSource={data}
          columns={columns}
          className="shadow-lg rounded-md"
          // pagination={{
          //   pageSize: 20,
          // }}
        />
      </div>
    </Form>
  );
};
export default UsersRequestsTable;
