"use client";
import React, { useEffect, useState } from "react";
import { encode } from "base-64";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Select,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import UploadPaymentReq from "@/app/components/uploadPaymentReq";
let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getApprovers() {
  let token = localStorage.getItem("token");
  const res = await fetch(`${url}/users/level1Approvers`, {
    method: "GET",
    headers: {
      Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),

      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary

    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default function NewPaymentRequest() {
  let user = JSON.parse(localStorage.getItem("user"));
  let token = localStorage.getItem("token");
  let [po, setPo] = useState(null);
  let router = useRouter();
  let [form] = Form.useForm();
  let [title, setTitle] = useState("");
  let [description, setDescription] = useState("");
  let [amount, setAmout] = useState(null);
  let [currency, setCurrency] = useState("RWF");
  let [docId, setDocId] = useState(null);
  let [files, setFiles] = useState([]);
  let [submitting, setSubmitting] = useState(false);
  let [budgetLines, setBudgetLines] = useState([]);
  let [budgetLine, setBudgetLine] = useState(null);
  let [budgeted, setBudgeted] = useState(false);
  let [level1Approver, setLevel1Approver] = useState(null);
  let [level1Approvers, setLevel1Approvers] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetch(`${url}/budgetLines`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/auth");
        } else {
          return res.json();
        }
      })
      .then((res) => {
        setBudgetLines(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });

    getApprovers()
      .then((res) => {
        let approversList = res?.filter((a) => a?._id !== user?._id);
        setLevel1Approvers(res);
        let hod = approversList?.filter(
          (a) => a?.department?._id === user?.department
        );
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }, []);

  const handleUpload = () => {
    setSubmitting(true);

    if (files?.length < 1) {
      messageApi.error("Please add at least one doc.");
      setSubmitting(false);
    } else {
      let docIds = [];
      const formData = new FormData();
      files.forEach((f) => {
        formData.append("files[]", f);
      });

      // You can use any AJAX library you like
      fetch(`${url}/uploads/paymentRequests/`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          // "Content-Type": "multipart/form-data",
        },
      })
        .then((res) => res.json())
        .then((savedFiles) => {
          let _filenames = savedFiles?.map((f) => {
            return f?.filename;
          });

          // docIds.push(_filenames[0]);

          save(_filenames);
        })
        .catch((err) => {
          console.log(err);
          messageApi.error("upload failed.");
        })
        .finally(() => {
          // setSubmitting(false);
        });
    }
  };

  const save = (_fileList) => {
    setSubmitting(true);
    fetch(`${url}/paymentRequests/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "",
        token: token,
      },
      body: JSON.stringify({
        title,
        description,
        amount,
        currency,
        createdBy: user?._id,
        budgeted,
        budgetLine,
        category: "internal",
        approver: level1Approver,
        // purchaseOrder: params?.poId,
        docIds: _fileList,
        status:'pending-approval'
      }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw res.statusText;
        }
      })
      .then((res) => {
        router.push("/system/payment-requests");
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // setSubmitting(false)
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.2,
        type: "tween",
        ease: "circOut",
      }}
      className="flex flex-col mx-10 transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 h-full"
    >
      {contextHolder}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row space-x-10 items-center">
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              type="primary"
              onClick={() => {
                router.back();
              }}
            >
              Back
            </Button>
          </div>
          <div className="text-lg font-semibold">New Payment Request</div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-1">
        <div className="md:col-span-4 flex flex-col ring-1 ring-gray-200 p-3 rounded shadow-md bg-white  overflow-y-scroll">
          <Form
            className="mt-5"
            // layout="horizontal"
            form={form}
            // onFinish={handleUpload}
          >
            <div className="grid md:grid-cols-3 gap-10">
              {/* Form grid 1 */}
              <div>
                {/* Title */}
                <div>
                  <div> Request title</div>
                  <div>
                    <Form.Item
                      name="title"
                      rules={[
                        {
                          required: true,
                          message: "Request title is required",
                        },
                      ]}
                    >
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="How would you name your request?"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div>Comment/additional note</div>
                  <div>
                    <Form.Item
                      name="description"
                      rules={[
                        {
                          required: true,
                          message: "Request description is required",
                        },
                      ]}
                    >
                      <Input.TextArea
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);
                        }}
                        placeholder="Describe your request"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              {/* Form grid 2 */}
              <div>
                {/* Amount */}
                {/* <div>
                  <div>Amount due</div>
                  <div>
                    <Form.Item
                      name="amount"
                      rules={[
                        {
                          required: true,
                          message: "Request title is required",
                        },
                      ]}
                    >
                      <InputNumber
                        className="w-full"
                        value={amount}
                        onChange={(e) => setAmout(e)}
                        placeholder="100000"
                      />
                    </Form.Item>
                  </div>
                </div> */}

                <div className="flex flex-col">
                  <div>Amount due</div>
                  <Form.Item>
                    <Form.Item
                      name="amount"
                      noStyle
                      rules={[
                        {
                          required: true,
                          message: "Amount is required",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        addonBefore={
                          <Form.Item noStyle name="currency">
                            <Select
                              onChange={(value) => setCurrency(value)}
                              defaultValue="RWF"
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
                              ]}
                            ></Select>
                          </Form.Item>
                        }
                        value={amount}
                        onChange={(e) => setAmout(e)}
                      />
                    </Form.Item>
                  </Form.Item>
                </div>
                <div>
                  <div>Invoice attachement(s)</div>
                  <UploadPaymentReq files={files} setFiles={setFiles} />
                </div>
              </div>

              {/* Form grid 3 */}
              <div>
                <div className="flex flex-col">
                  <div>Level 1 approver</div>
                  <Form.Item
                    // label="Select level 1 approver"
                    name="level1Approver"
                    rules={[
                      {
                        required: true,
                        message: "Level 1 approver is required",
                      },
                    ]}
                  >
                    <Select
                      // defaultValue={defaultApprover}
                      placeholder="Select Approver"
                      showSearch
                      onChange={(value) => {
                        setLevel1Approver(value);
                      }}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      options={level1Approvers.map((l) => {
                        return {
                          label: l?.firstName + " " + l?.lastName,
                          value: l?._id,
                        };
                      })}
                    ></Select>
                  </Form.Item>
                </div>
                {/* Budgeted */}
                <div>
                  <div>Budgeted?</div>
                  <div>
                    <Form.Item
                      name="budgeted"
                      valuePropName="checked"
                      // wrapperCol={{ offset: 8, span: 16 }}
                    >
                      <Radio.Group
                        onChange={(e) => {
                          setBudgeted(e.target.value);
                          if (e.target.value === false) setBudgetLine(null);
                        }}
                        value={budgeted}
                      >
                        <Radio value={true}>Yes</Radio>
                        <Radio value={false}>No</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </div>

                {/* Budget Lines */}
                {budgeted && (
                  // <Form.Item label="Budget Line" name="budgetLine">
                  //   <Input
                  //     onChange={(e) => {
                  //       setBudgetLine(e.target.value);
                  //     }}
                  //     placeholder=""
                  //   />
                  // </Form.Item>

                  <div>
                    <div>Budget Line</div>
                    <div>
                      <Form.Item
                        name="budgetLine"
                        rules={[
                          {
                            required: budgeted,
                            message: "Budget Line is required",
                          },
                        ]}
                      >
                        <Select
                          // defaultValue={budgetLine}
                          placeholder="Select service category"
                          showSearch
                          onChange={(value, option) => {
                            setBudgetLine(value);
                          }}
                          // filterSort={(optionA, optionB) =>
                          //   (optionA?.label ?? "")
                          //     .toLowerCase()
                          //     .localeCompare(
                          //       (optionB?.label ?? "").toLowerCase()
                          //     )
                          // }
                          filterOption={(inputValue, option) => {
                            return option.label
                              .toLowerCase()
                              .includes(inputValue.toLowerCase());
                          }}
                          options={budgetLines?.map((s) => {
                            return {
                              label: s.description.toUpperCase(),
                              options: s.budgetlines?.map((sub) => {
                                return {
                                  label: sub.description,
                                  value: sub._id,
                                  title: sub.description,
                                };
                              }),
                            };
                          })}
                        ></Select>
                      </Form.Item>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={() => {
                form.validateFields().then(() => {
                  setSubmitting(true);
                  handleUpload();
                });
              }}
              disabled={submitting}
            >
              Save
            </Button>
          </Form>
        </div>
      </div>
    </motion.div>
  );
}
