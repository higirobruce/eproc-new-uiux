"use client";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
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
  const [editing, setEditing] = useState(true);
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
            message: `Input required.`,
          },
        ]}
      >
        {dataIndex == "quantity" || dataIndex == "estimatedUnitCost" ? (
          <InputNumber
            className="w-full h-10"
            ref={inputRef}
            onPressEnter={save}
            placeholder={dataIndex === "title" ? "enter title" : "eg. 1000000"}
            onBlur={save}
            disabled={disable}
          />
        ) : (
          <Input
            className="w-full h-10"
            ref={inputRef}
            onPressEnter={save}
            placeholder={dataIndex === "title" ? "enter title" : "eg. 1000000"}
            onBlur={save}
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

const ItemsTable = ({
  setDataSource,
  dataSource,
  setFileList,
  fileList,
  files,
  setFiles,
  editingRequest,
  disable,
  noItemDocs = true,
  currency = "RWF"
}) => {
  const [count, setCount] = useState(dataSource?.length + 1);
  const [rowForm] = Form.useForm();

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key && item.key);
    setCount(count - 1);
    setDataSource(newData);
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

  const defaultColumns = !noItemDocs
    ? [
        {
          title: "Item title",
          dataIndex: "title",
          width: "25%",
          editable: !disable,
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          width: "15%",
          editable: !disable,
        },
        {
          title: "Estimated Unit cost",
          dataIndex: "estimatedUnitCost",
          width: "15%",
          editable: !disable,
          render: (_, item) => {
            return <div>{item.estimatedUnitCost.toLocaleString()}</div>;
          },
        },
        {
          title: "Currency",
          dataIndex: "currency",
          width: "10%",
          render: (_, record) => {
            return (
              <Select
                defaultValue={record.currency}
                disabled={disable}
                size="large"
                className="w-full"
                onChange={(value) => (record.currency = value)}
                options={[
                  {
                    value: "RWF",
                    label: "RWF",
                    key: "RWF",
                  },
                  {
                    value: "USD",
                    label: "USD",
                    key: "USD",
                  },
                  {
                    value: "EUR",
                    label: "EUR",
                    key: "EUR",
                  },
                  {
                    value: "GBP",
                    label: "GBP",
                    key: "GBP",
                  },
                ]}
              />
            );
          },
        },
        {
          title: (
            <div className="flex flex-row space-x-1 items-center">
              <div>Supporting Docs</div>
              <Tooltip
                title="(e.g specs, ToR,... expected in PDF format)"
                placement="top"
                arrow={false}
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </div>
          ),
          dataIndex: "attachements",
          width: "20%",
          render: (_, record, index) => {
            return (
              dataSource?.length >= 1 && (
                <div>
                  {!disable && (
                    <UploadTORs
                      uuid={record?.key - 1}
                      setFileList={setFileList}
                      fileList={fileList}
                      files={files}
                      setFiles={setFiles}
                      itemFiles={files[index]}
                      disabled={disable}
                      setStatus={() => {}}
                      iconOnly={false}
                    />
                  )}
                  {disable &&
                    (record?.paths || record?.paths?.length >= 1 ? (
                      <div className="flex flex-col m-2">
                        {record?.paths?.map((p, i) => {
                          return (
                            <div key={p}>
                              {p && (
                                <Link
                                  // href={`${url}/file/termsOfReference/${p}`}
                                  href={`${fendUrl}/api?folder=termsOfReference&name=${p}`}
                                  target="_blank"
                                >
                                  <Typography.Link
                                    className="flex flex-row items-center space-x-2"
                                    // onClick={() => {
                                    //   setPreviewAttachment(!previewAttachment);
                                    //   setAttachmentId(p);
                                    // }}
                                  >
                                    <div>supporting doc{i + 1} </div>{" "}
                                    <div>
                                      <PaperClipIcon className="h-4 w-4" />
                                    </div>
                                  </Typography.Link>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="items-center justify-center flex flex-col">
                        <div>
                          <RectangleStackIcon className="h-5 w-5 text-gray-200" />
                        </div>
                        <div className="text-xs text-gray-400">
                          No docs found
                        </div>
                      </div>
                    ))}
                </div>
              )
            );
          },
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
                    onConfirm={() => handleDelete(record.key)}
                  >
                    <a>
                      <MdDeleteOutline
                        className={`${
                          disable
                            ? `text-[#b8b5b6] cursor-not-allowed`
                            : `text-[#F5365C]`
                        }`}
                        size={24}
                      />
                    </a>
                  </Popconfirm>
                )}
              </div>
            ) : null,
        },
      ]
    : [
        {
          title: "Item title",
          dataIndex: "title",
          // width: "25%",
          editable: !disable,
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          width: "15%",
          editable: !disable,
        },
        {
          title: "Estimated Unit cost",
          dataIndex: "estimatedUnitCost",
          // width: "15%",
          editable: !disable,
          render: (_, item) => {
            return <div>{item.estimatedUnitCost.toLocaleString()}</div>;
          },
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
                    onConfirm={() => handleDelete(record.key)}
                  >
                    <a>
                      <MdDeleteOutline
                        className={`${
                          disable
                            ? `text-[#b8b5b6] cursor-not-allowed`
                            : `text-[#F5365C]`
                        }`}
                        size={24}
                      />
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
      title: ``,
      quantity: "",
      estimatedUnitCost: "",
      currency: "RWF",
      id: v4(),
    };

    setDataSource([...dataSource, newData]);
    setCount(c + 1);
  };

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
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
        title: col.title,
        handleSave,
      }),
    };
  });

  return (
    <>
      <div className="flex flex-col gap-2 request-empty">
        <div className="flex items-center justify-between w-full">
          <div className="flex justify-between items-center">
            {!disable ? (
              <Button
                onClick={handleAdd}
                className="flex self-start items-center gap-1 border-0 bg-[#EAF1FC] text-[#0065DD] mb-1"
              >
                <FaPlus />
                Row
              </Button>
            ) : (
              <div className="mb-1" />
            )}
          </div>
          <h4 className="my-5 font-bold text-[15px]">Total: {currency} {totalAmount.toLocaleString()}</h4>
        </div>
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          bordered
          dataSource={dataSource}
          columns={columns}
          size="small"
          pagination={false}
        />
      </div>
    </>
  );
};
export default ItemsTable;
