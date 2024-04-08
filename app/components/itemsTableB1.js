"use client";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Table,
} from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";

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
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
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
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {dataIndex == "quantity" || dataIndex == "estimatedUnitCost" ? (
          <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
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

const ItemsTable = ({ setDataSource, dataSource, assetOptions, currency }) => {
  const [count, setCount] = useState(dataSource?.length + 1);
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key && item.key);
    setCount(count - 1);
    setDataSource(newData);
  };
  const defaultColumns = [
    {
      title: "Item title",
      dataIndex: "title",
      // width: "40%",
      editable: true,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      editable: true,
    },
    {
      title: "Item type",
      dataIndex: "itemType",

      render: (_, record) => (
        <Select
          onChange={(value) => {
            let d = [...dataSource];
            let toEdit = d.filter((data, index) => data.key === record.key);
            if (toEdit?.length > 0) toEdit[0].itemType = value;
            setDataSource(d);
          }}
          style={{ width: "100%" }}
          defaultValue="non-asset"
          options={[
            { value: "non-asset", label: "Non-Asset" },
            { value: "asset", label: "Asset" },
          ]}
        />
      ),
    },
    {
      title: "Asset",
      dataIndex: "asset",
      // width: "30%",
      render: (_, record) => (
        <Select
          mode="tags"
          showArrow
          disabled={record?.itemType === "non-asset" || !record.itemType}
          style={{ width: "100%" }}
          onChange={(value) => {
            // let _v = [...assets];
            // _v[index] = value;
            // setAssets(_v);

            let d = [...dataSource];
            let toEdit = d.filter((data, index) => data.key === record.key);
            if (toEdit?.length > 0) toEdit[0].assetCodes = value;
            setDataSource(d);
          }}
          options={assetOptions}
          showSearch
        />
        // <Select
        //   onChange={(value) => {
        //     let d = [...dataSource];
        //     let toEdit = d.filter((data, index) => data.key === record.key);
        //     if (toEdit.length > 0) toEdit[0].itemType = value;
        //     setDataSource(d);
        //   }}
        //   style={{ width: "100%" }}
        //   defaultValue="non-asset"
        //   options={[
        //     { value: "non-asset", label: "Non-Asset" },
        //     { value: "asset", label: "Asset" },
        //   ]}
        // />
      ),
    },
    {
      title: "Tax Group",
      dataIndex: "taxGroup",
      render: (_, record) => (
        <Select
          onChange={(value) => {
            let d = [...dataSource];
            let toEdit = d.filter((data, index) => data.key === record.key);
            if (toEdit.length > 0) toEdit[0].taxGroup = value;
            setDataSource(d);
          }}
          style={{ width: "100%" }}
          defaultValue="X1"
          options={[
            {
              value: "I1",
              label: "Input VAT",
            },
            {
              value: "X1",
              label: "Exempt Tax",
            },
          ]}
        />
      ),
    },
    // {
    //   title: "Currency",
    //   dataIndex: "currency",
    //   width: "10%",
    //   render: (_, record) => {
    //     return (
    //       <Select
    //         defaultValue={record.currency}
    //         onChange={(value) => {
    //           let d = [...dataSource];
    //           let toEdit = d.filter((data, index) => data.key === record.key);
    //           if (toEdit.length > 0) toEdit[0].currency = value;
    //           setDataSource(d);
    //         }}
    //         options={[
    //           {
    //             value: "RWF",
    //             label: "RWF",
    //             key: "RWF",
    //           },
    //           {
    //             value: "USD",
    //             label: "USD",
    //             key: "USD",
    //           },
    //           {
    //             value: "EUR",
    //             label: "EUR",
    //             key: "EUR",
    //           },
    //           {
    //             value: "GBP",
    //             label: "GBP",
    //             key: "GBP",
    //           },
    //         ]}
    //       />
    //     );
    //   },
    // },
    {
      title: "Price",
      dataIndex: "estimatedUnitCost",
      editable: true,
      render: (_, item) => {
        return (
          <div>{currency + " " + item.estimatedUnitCost.toLocaleString()}</div>
        );
      },
    },
    // {
    //   title: "Action",
    //   dataIndex: "operation",
    //   render: (_, record) =>
    //     dataSource.length >= 1 ? (
    //       <Popconfirm
    //         title="Sure to delete?"
    //         onConfirm={() => handleDelete(record.key)}
    //       >
    //         <a>Delete</a>
    //       </Popconfirm>
    //     ) : null,
    // },
  ];
  const handleAdd = () => {
    const newData = {
      key: count,
      title: `Title`,
      quantity: "0",
      estimatedUnitCost: `0`,
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
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
    <div>
      {/* <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add a row
      </Button> */}
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns}
        size="small"
      />
    </div>
  );
};
export default ItemsTable;
