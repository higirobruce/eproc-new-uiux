'use client'
import React, { useEffect, useState } from "react";
import {
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
} from "antd";
import UploadFiles from "./uploadFiles";
import { encode } from "base-64";
const ItemList = ({ handleSetValues }) => {
  const [serviceCategories, setServiceCategories] = useState([]);
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let token = typeof window !== 'undefined' && localStorage.getItem('token')

  useEffect(() => {
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
        setServiceCategories(res);
      });
  }, []);

  const onValuesChange = (changedValues, allValues) => {
    handleSetValues(allValues);
  };

  return (
    <Form
      name="dynamic_form_nest_item"
      onValuesChange={onValuesChange}
      autoComplete="off"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      // style={{ width: 600 }}
    >
      <Form.List name="items">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Row
                key={key}
                className="flex flex-row border-2 mb-5 justify-between w-full"
              >
                <Col className="flex-1">
                  <Form.Item label="Title" name={[name, "title"]}>
                    <Input />
                  </Form.Item>

                  <Form.Item label="Quantity" name={[name, "quantity"]}>
                    <InputNumber />
                  </Form.Item>

                  <Form.Item label="Cost">
                    <Input.Group compact>
                      <Form.Item noStyle name={[name, "currency"]}>
                        <Select
                          defaultValue="RWF"
                          options={[
                            {
                              value: "RWF",
                              label: "RWF",
                              key:"RWF"
                            },
                            {
                              value: "USD",
                              label: "USD",
                              key:"USD"
                            },
                            {
                              value: "EUR",
                              label: "EUR",
                              key:"EUR"
                            },
                            {
                              value: "GBP",
                              label: "GBP",
                              key:"GBP"
                            },
                          ]}
                        ></Select>
                      </Form.Item>
                      <Form.Item name={[name, "estimatedUnitCost"]} noStyle>
                        <InputNumber />
                      </Form.Item>
                    </Input.Group>
                  </Form.Item>
                  <Form.Item
                    label="Attachements"
                    {...restField}
                    name={[name, "first"]}
                    //   rules={[
                    //     {
                    //       required: true,
                    //       message: 'Missing first name',
                    //     },
                    //   ]}
                  >
                    <UploadFiles />
                  </Form.Item>

                  <Divider />
                </Col>
                <DeleteOutlined
                  className="text-red-400"
                  onClick={() => remove(name)}
                />
              </Row>
            ))}
            <Form.Item>
              <Button
                type="link"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
              >
                Add Item
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};
export default ItemList;
