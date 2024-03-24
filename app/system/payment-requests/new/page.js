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
import { MdAccountBalance } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { useUser } from "@/app/context/UserContext";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getApprovers() {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
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
  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== "undefined" && localStorage.getItem("token");
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
  let [budgeted, setBudgeted] = useState(true);
  let [level1Approver, setLevel1Approver] = useState(null);
  let [level1Approvers, setLevel1Approvers] = useState([]);
  const [bankPay, setBankPay] = useState(true);
  let [bankName, setBankName] = useState("");
  let [accountName, setAccountName] = useState("");
  let [accountNumber, setAccountNumber] = useState("");
  let [phoneName, setPhoneName] = useState("");
  let [phoneNumber, setPhoneNumber] = useState("");

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
        status: "pending-approval",
        paymentDetails: {
          bankName,
          accountName,
          accountNumber,
          phoneName,
          phoneNumber,
        },
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
      className="flex flex-col transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 mt-6 h-screen pb-10"
    >
      {contextHolder}
      {/* <div className="flex flex-row justify-between items-center">
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
      </div> */}
      <div className="request mr-6 bg-white h-[calc(100vh-165px)] rounded-lg mb-10 px-5 overflow-y-auto py-2 flex flex-col justify-between pb-8 md:mr-5">
        <div className="flex flex-col">
          <div className="flex items-start gap-x-5">
            <h4 className="text-[21px] text-[#344767] mb-3">
              New Payment Request
            </h4>
            <sup className="bg-[#F1F3FF] px-3 py-1 rounded-full mt-2 text-[#1677FF] font-semibold">
              INTERNAL
            </sup>
          </div>
          <small className="text-[13.5px] text-[#8392AB]">
            Please fill the form and submit the form below to create your
            payment request
          </small>
        </div>
        <div className="grid lg:grid-cols-3 gap-x-10 mt-5 items-start justify-start h-full">
          <div className="lg:col-span-2">
            <h5 className="text-[18px] text-[#344767] mb-4">Request Details</h5>
            <div className="gap-1">
              <div className="flex flex-col py-3">
                <Form
                  className="mt-5"
                  // layout="horizontal"
                  form={form}
                  // onFinish={handleUpload}
                >
                  <div className="grid md:grid-cols-2 gap-x-10">
                    {/* Form grid 1 */}
                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-[#000000e0] text-[14px]">
                          Request Title
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
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
                            className="h-10"
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="How would you name your request?"
                          />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <label className="text-[#000000e0] text-[14px]">
                          Level 1 approver
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
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
                          size="large"
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

                    {/* Description */}
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-[#000000e0] text-[14px]">
                          Comment/additional note
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
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
                            rows={4}
                            onChange={(e) => {
                              setDescription(e.target.value);
                            }}
                            placeholder="Describe your request"
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <label className="text-[#000000e0] text-[14px]">
                          Amount due
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
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
                            className="w-full h-10"
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
                                    {
                                      value: "GBP",
                                      label: "GBP",
                                      key: "GBP",
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
                      <div className="flex items-center gap-2">
                        <label className="text-[#000000e0] text-[14px]">
                          Budgeted?
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
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
                    <div>
                      <div className="text-[14px] text-[#344767] mb-2">
                        Invoice attachement(s)
                      </div>
                      <UploadPaymentReq files={files} setFiles={setFiles} />
                    </div>

                    {/* Form grid 3 */}
                    <div>
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
                          <div className="flex items-center gap-2">
                            <label className="text-[#000000e0] text-[14px]">
                              Budget Line
                            </label>
                            <div className="text-red-500">*</div>
                          </div>
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
                                size="large"
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
                </Form>
              </div>
            </div>
          </div>
          <div className="mr-5 lg:col-span-1">
            <div className="bg-[#EFF4F8] pt-2 pb-5 px-10">
              <h5 className="text-[18px] text-[#344767]">Payment Details</h5>
              <div className="flex items-center">
                <Form.Item
                  name="budgeted"
                  valuePropName="checked"
                  // wrapperCol={{ offset: 8, span: 16 }}
                >
                  <Radio.Group
                    onChange={(e) => {
                      setBankPay(e.target.value);
                      if (e.target.value === false) setBudgetLine(null);
                    }}
                    value={bankPay}
                    className="mb-2 mt-5"
                  >
                    <div className="flex gap-x-10">
                      <div className="my-1 border-t-2 border-x-2 border-[#BFC5C5]">
                        <Radio value={true} className="flex gap-x-1 items-center">
                          <MdAccountBalance /> &nbsp;<span>Bank Info</span>
                        </Radio>
                      </div>
                      <div className="my-1 border-2 border-[#BFC5C5]">
                        <Radio
                          value={false}
                          className="flex gap-x-1 items-center"
                        >
                          <FaMobileAlt /> &nbsp;<span>Mobile Pay</span>
                        </Radio>
                      </div>
                    </div>
                  </Radio.Group>
                </Form.Item>
              </div>
              {bankPay ? (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#344767] text-[14px] mb-2">Bank Name</label>
                    </div>
                    <div>
                      <Form.Item
                        name="bankName"
                        // rules={bankPay && [
                        //   {
                        //     required: true,
                        //     message: "Request Bank name is required",
                        //   },
                        // ]}
                      >
                        <Input
                          value={bankName}
                          className="h-11"
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Type in Bank Name"
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#344767] text-[14px] mb-2">Account Name</label>
                    </div>
                    <div>
                      <Form.Item
                        name="accountName"
                        // rules={bankPay && [
                        //   {
                        //     required: true,
                        //     message: "Request account name is required",
                        //   },
                        // ]}
                      >
                        <Input
                          value={accountName}
                          className="h-11"
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Type in User account name"
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#344767] text-[14px] mb-2">Account Number</label>
                    </div>
                    <div>
                      <Form.Item
                        name="accountNumber"
                        // rules={bankPay && [
                        //   {
                        //     required: true,
                        //     message: "Request account number is required",
                        //   },
                        // ]}
                      >
                        <Input
                          value={accountNumber}
                          className="h-11"
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="Type in User account number"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#344767] text-[14px] mb-2">Phone Name</label>
                    </div>
                    <div>
                      <Form.Item
                        name="phoneName"
                        // rules={!bankPay && [
                        //   {
                        //     required: true,
                        //     message: "Request Phone name is required",
                        //   },
                        // ]}
                      >
                        <Input
                          value={phoneName}
                          className="h-11"
                          onChange={(e) => setPhoneName(e.target.value)}
                          placeholder="Type in Phone name"
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#344767] text-[14px]">Phone Number</label>
                    </div>
                    <div>
                      <Form.Item
                        name="phoneNumber"
                        // rules={!bankPay && [
                        //   {
                        //     required: true,
                        //     message: "Request Phone number required",
                        //   },
                        // ]}
                      >
                        <Input
                          value={phoneNumber}
                          className="h-11"
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Type in phone number"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex w-full mt-10">
              <button
                onClick={() => {
                  form.validateFields().then(() => {
                    setSubmitting(true);
                    handleUpload();
                  });
                }}
                disabled={submitting}
                className="flex item-center cursor-pointer border-none text-[16px] text-white gap-x-4 bg-[#0065DD] rounded-lg py-3 px-6"
              >
                <SaveOutlined className="font-[19px]" />
                Submit
              </button>
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end items-end self-end">
          <button
            onClick={() => {
              if (files?.length <= 0)
                message.error(
                  "Please provide atleast one supporting document!"
                );
              form.validateFields().then(() => {
                if (files?.length <= 0)
                  message.error(
                    "Please provid atlease one supporting document!"
                  );
                else {
                  setSubmitting(true);
                  handleUpload();
                }
              });
            }}
            disabled={submitting}
            className="flex item-center mr-7 cursor-pointer border-none text-[15px] text-white gap-x-2 bg-[#0065DD] rounded pt-2.5 pb-3 pl-4 pr-5"
          >
            <SaveOutlined className="font-[17px]" />
            Submit
          </button>
        </div>
      </div>
    </motion.div>
  );
}
