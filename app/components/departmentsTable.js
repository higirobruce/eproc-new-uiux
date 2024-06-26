"use client";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { PaperClipIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { v4 } from "uuid";
import UploadTORs from "./uploadTORs";
import { FaPlus } from "react-icons/fa6";
import Link from "next/link";
import { MdDeleteOutline } from "react-icons/md";
import { encode } from "base-64";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let fendUrl = process.env.NEXT_PUBLIC_FTEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  disable,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef?.current?.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };
  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        initialValue={record[dataIndex]}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: ``,
          },
        ]}
      >
        {dataIndex == "quantity" || dataIndex == "estimatedUnitCost" ? (
          <InputNumber
            className="w-full"
            ref={inputRef}
            onPressEnter={save}
            // placeholder={dataIndex === "title" ? "enter title" : "eg. 1000000"}
            onBlur={save}
            size="small"
            disabled={disable}
          />
        ) : (
          <Input
            className="w-full"
            ref={inputRef}
            onPressEnter={save}
            // placeholder={dataIndex === "title" ? "enter title" : "eg. 1000000"}
            onBlur={save}
            size="small"
            disabled={disable}
          />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const DepartmentsTable = ({
  setDataSource,
  dataSource,
  disable,
  handleUpdateRow,
  handleRefresh,
}) => {
  const [count, setCount] = useState(dataSource?.length + 1);
  // const [rowForm] = Form.useForm();
  const [openCreateDepartment, setOpenCreateDepartment] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  let [form] = Form.useForm();

  let [editRow, setEditRow] = useState(false);
  const onFinish = (values) => {};
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

  const totalAmount = useMemo(() => {
    return dataSource.reduce(
      (sum, value) =>
        sum +
        parseInt(
          value.estimatedUnitCost == "" ? "0" : value.estimatedUnitCost
        ) *
          parseInt(value.quantity == "" ? "0" : value.quantity),
      0
    );
  }, [dataSource, disable]);

  const defaultColumns = [
    // {
    //   title: "#",
    //   dataIndex: "number",
    //   width: "10%",
    //   editable: false,
    // },
    {
      title: "Description",
      dataIndex: "description",
      // width: "15%",
      editable: !disable,
    },
    {
      title: "Visible",
      dataIndex: "visible",
      // width: "15%",
      editable: false,
      render: (_, record) => (record?.visible ? "Yes" : "No"),
    },

    {
      title: "Action",
      dataIndex: "operation",
      render: (_, record) =>
        dataSource?.length >= 1 ? (
          <div>
            {disable ? (
              <MdDeleteOutline
                className={`${
                  disable
                    ? `text-[#b8b5b6] cursor-not-allowed`
                    : `text-[#F5365C]`
                }`}
                size={24}
              />
            ) : (
              <Popconfirm
                title="Are you sure?"
                onConfirm={() => handleHide(record)}
              >
                <a>
                  {/* <MdDeleteOutline
                    className={`${
                      disable
                        ? `text-[#b8b5b6] cursor-not-allowed`
                        : `text-[#F5365C]`
                    }`}
                    size={24}
                  /> */}
                  {record?.visible ? "Hide" : "Unhide"}
                </a>
              </Popconfirm>
            )}
          </div>
        ) : null,
    },
  ];

  const handleAdd = () => {
    let c = dataSource?.length;

    const newData = {
      key: c + 1,
      // number: c + 1,
      visible: false,
      description: "",
      id: v4(),
    };

    setDataSource([...dataSource, newData]);
    setCount(c + 1);
  };


  const handleConfirm = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    handleUpdateRow(row, "department");
    setDataSource(newData);
  };

  const handleSave = (row) => {
    setEditRow(row);
    setOpenConfirmModal(true);
  };

  const handleHide = (row) => {
    row.visible = !row?.visible;
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    handleUpdateRow(row, "department");
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        number: col.number,
        handleSave,
      }),
    };
  });

  async function createDepartment(value) {
    fetch(`${url}/dpts/`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(value),
    }).then((res) => {
      handleRefresh();
    });
  }

  function buildNewDepartmentModel() {
    return (
      <Modal
        centered
        open={openCreateDepartment}
        onOk={() => {
          form.validateFields().then(
            (value) => {
              createDepartment(value);
              setOpenCreateDepartment(false);
            },
            (reason) => {}
          );

          // setOpenCreateDepartment(false);
        }}
        title="New Department"
        okText={"Save"}
        onCancel={() => setOpenCreateDepartment(false)}
        width={"30%"}
        bodyStyle={{ maxHeight: "700px", overflow: "hidden" }}
      >
        <div className="p-10">
          <Form form={form} name="name">
            <Form.Item
              label="Department Name"
              name="description"
              rules={[
                {
                  required: true,
                  message: "Can not be empty!",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    );
  }

  function buildCofirmModal() {
    return (
      <Modal
        centered
        open={openConfirmModal}
        onOk={() => {
          handleConfirm(editRow);
          // setOpenCreateServiceCategory(false);
        }}
        title="Editing a Department"
        okText={"Yes"}
        onCancel={() => setOpenConfirmModal(false)}
        width={"30%"}
        bodyStyle={{ maxHeight: "700px", overflow: "hidden" }}
      >
        <div className="p-10">
          This will override the old information. Do you want to continue?
        </div>
      </Modal>
    );
  }

  return (
    <>
      {buildNewDepartmentModel()}
      {buildCofirmModal()}
      <div className="flex flex-col gap-2 request-empty">
        <div className="flex items-center justify-between w-full">
          <div className="flex justify-between items-center">
            {!disable ? (
              <Button
                onClick={() => setOpenCreateDepartment(true)}
                className="flex self-start items-center gap-1 border-0 bg-[#EAF1FC] text-[#0065DD] mb-1"
              >
                <FaPlus />
                New
              </Button>
            ) : (
              <div className="mb-1" />
            )}
          </div>
        </div>
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
          size="small"
          // pagination={false}
        />
      </div>
    </>
  );
};
export default DepartmentsTable;
