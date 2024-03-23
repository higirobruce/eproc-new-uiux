"use client";
import React, { useEffect, useState } from "react";
import { encode } from "base-64";
import { motion } from "framer-motion";
import { LightBulbIcon } from "@heroicons/react/24/outline";
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
  Typography,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import UploadPaymentReq from "@/app/components/uploadPaymentReq";
import { resolve } from "styled-jsx/css";
import { reject } from "lodash";
import { MdAccountBalance } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getPoDetails(id, router) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/purchaseOrders/${id}`, {
    headers: {
      Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth");
    }
    // This will activate the closest `error.js` Error Boundary
    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getPoPaymentProgress(id, router) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/purchaseOrders/paymentProgress/${id}`, {
    method: "GET",
    headers: {
      Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth");
    }
    // This will activate the closest `error.js` Error Boundary
    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getPoPaidRequests(id, router) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/purchaseOrders/paymentsDone/${id}`, {
    method: "GET",
    headers: {
      Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth");
    }
    // This will activate the closest `error.js` Error Boundary
    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default function NewPaymentRequest({ params }) {
  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let [po, setPo] = useState(null);
  let router = useRouter();
  let [form] = Form.useForm();
  let [title, setTitle] = useState("");
  let [description, setDescription] = useState("");
  let [amount, setAmout] = useState(null);
  let [currency, setCurrency] = useState(null);
  let [docId, setDocId] = useState(null);
  let [files, setFiles] = useState([]);
  let [submitting, setSubmitting] = useState(false);
  let [poVal, setPoVal] = useState(0);
  let [totalPaymentVal, setTotalPaymentVal] = useState(0);
  let [totalPaid, setTotalPaid] = useState(0);
  const [bankPay, setBankPay] = useState(true);
  let [bankName, setBankName] = useState("");
  let [accountName, setAccountName] = useState("");
  let [accountNumber, setAccountNumber] = useState("");
  let [phoneName, setPhoneName] = useState("");
  let [phoneNumber, setPhoneNumber] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getPoDetails(params?.poId, router).then((res) => {
      setCurrency(res?.items[0]?.currency);
      console.log(res);
      setPo(res);
    });

    getPoPaymentProgress(params?.poId, router).then((res) => {
      setPoVal(res?.poVal);
      setTotalPaymentVal(res?.totalPaymentVal);
    });

    getPoPaidRequests(params?.poId, router).then((res) => {
      // setPoVal(res?.poVal);
      setTotalPaid(res?.totalPaymentVal);
    });
  }, [params]);

  useEffect(() => {}, [files]);

  function getPoTotalVal() {
    let t = 0;
    let tax = 0;
    po?.items?.map((i) => {
      t = t + i?.quantity * i?.estimatedUnitCost;
      if (i.taxGroup === "I1")
        tax = tax + (i?.quantity * i?.estimatedUnitCost * 18) / 100;
    });
    return {
      totalVal: t,
      totalTax: tax,
      grossTotal: t + tax,
    };
  }

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
        category: "external",
        createdBy: user?._id,
        purchaseOrder: params?.poId,
        docIds: _fileList,
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
        setSubmitting(false);
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: po ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
        type: "tween",
        ease: "circOut",
      }}
      className="flex flex-col transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 mt-6 h-screen pb-10"
    >
      {/* <div className="flex flex-row justify-between items-center">
        {contextHolder}
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
          <div className="text-lg font-semibold">
            New Payment Request for PO {po?.number}
          </div>
        </div>
      </div> */}
      <div className="request mr-6 bg-white h-[calc(100vh-165px)] rounded-lg mb-10 px-5 overflow-y-auto py-2 flex flex-col justify-between pb-8 md:mr-5">
        <div className="flex flex-col">
          <div className="flex items-start gap-x-5">
            <h4 className="text-[21px] text-[#344767] mb-3">
              New Payment Request
            </h4>
            <sup className="bg-[#F1F3FF] px-3 py-1 rounded-full mt-2 text-[#1677FF] font-semibold">
              EXTERNAL
            </sup>
          </div>
          <small className="text-[13.5px] text-[#8392AB]">
            Please fill the form and submit the form below to create your
            payment request
          </small>
        </div>
        <div className="grid lg:grid-cols-3 gap-x-10 mt-5 items-start justify-start h-full">
          <div className="lg:col-span-2">
            <h5 className="text-[18px] text-[#344767] ml-3 mb-4">
              Request Details
            </h5>

            <div className="gap-1 grid-cols-1">
              <div className="flex flex-col p-3">
                <Form
                  // layout="horizontal"
                  form={form}
                  initialValues={{
                    currency: currency,
                  }}
                  // onFinish={handleUpload}
                >
                  <div className="grid md:grid-cols-2 gap-x-10">
                    {/* Form grid 1 */}
                    <div>
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
                              className="h-11"
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="How would you name your request?"
                            />
                          </Form.Item>
                        </div>
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
                              rows={5}
                              onChange={(e) => {
                                setDescription(e.target.value);
                              }}
                              placeholder="Describe your request"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div>
                      {/* Amount */}
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
                              {
                                validator(rule, value) {
                                  // return new Promise((resolve, reject) => {
                                  //   if (
                                  //     (poVal > -1 &&
                                  //       value >
                                  //         getPoTotalVal()?.grossTotal -
                                  //           totalPaymentVal -
                                  //           value) ||
                                  //     (poVal == -1 &&
                                  //       value > getPoTotalVal()?.grossTotal)
                                  //   ) {
                                  //     reject(
                                  //       "Requested amount should not exceed the PO Value!"
                                  //     );
                                  //   } else {
                                  //     resolve();
                                  //   }
                                  // });
                                  return new Promise((resolve, reject) => {
                                    if (
                                      (poVal > -1 &&
                                        value >
                                          getPoTotalVal()?.grossTotal -
                                            totalPaymentVal) ||
                                      (poVal == -1 &&
                                        value > getPoTotalVal()?.grossTotal)
                                    ) {
                                      reject(
                                        "Requested amount should not exceed the PO Value!"
                                      );
                                    } else {
                                      resolve();
                                    }
                                  });
                                },
                              },
                            ]}
                          >
                            <InputNumber
                              style={{ width: "100%" }}
                              className="h-11"
                              addonBefore={
                                <Form.Item
                                  noStyle
                                  name="currencyP"
                                  rules={[
                                    {
                                      validator(rule, value) {
                                        return new Promise(
                                          (resolve, reject) => {
                                            value = currency;
                                            if (
                                              value !== po?.items[0]?.currency
                                            ) {
                                              reject(
                                                "The currency can not differ from the PO currency!"
                                              );
                                            } else {
                                              resolve();
                                            }
                                          }
                                        );
                                      },
                                    },
                                  ]}
                                >
                                  {currency && (
                                    <Select
                                      onChange={(value) => setCurrency(value)}
                                      defaultValue={currency}
                                      value={currency}
                                      size="large"
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
                                  )}
                                </Form.Item>
                              }
                              value={amount}
                              onChange={(e) => setAmout(e)}
                            />
                          </Form.Item>
                        </Form.Item>
                      </div>
                      <div>
                        <div className="text-[14px] text-[#344767] mb-2">
                          Invoice attachement(s)
                        </div>
                        <UploadPaymentReq files={files} setFiles={setFiles} />
                      </div>
                    </div>

                    {/* Form grid 3 */}
                    {user?.userType !== "VENDOR" && (
                      <div>
                        {/* Budgeted */}
                        <div>
                          <div className="text-[14px] text-[#344767] mb-2">
                            Budgeted?
                          </div>
                          <div className="font-semibold">
                            {po?.request?.budgeted ? "Yes" : "No"}
                          </div>
                        </div>

                        {/* Budget Lines */}
                        {po?.request?.budgetLine && (
                          // <Form.Item label="Budget Line" name="budgetLine">
                          //   <Input
                          //     onChange={(e) => {
                          //       setBudgetLine(e.target.value);
                          //     }}
                          //     placeholder=""
                          //   />
                          // </Form.Item>

                          <div className="mt-10">
                            <div className="text-[14px] text-[#344767] mb-2">
                              Budget Line
                            </div>
                            <div className="font-semibold">
                              {po?.request?.budgetLine?.description}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Form>

                <div className="bg-[#F1F3FF] pb-5 px-10  my-5 rounded">
                  <div className="flex flex-row space-x-2 items-center text-[#FFD275]">
                    <LightBulbIcon className="h-7 w-7" />
                    <h5 className="text-[18px] text-[#FFD275]">Hints</h5>
                  </div>

                  <div className="flex flex-col space-y-6 my-5">
                    <div className="w-full flex justify-between text-gray-700">
                      <div>Related PO {po?.number} (Total Value): </div>
                      <div className="font-semibold text-[13px]">
                        {po?.items[0]?.currency +
                          " " +
                          getPoTotalVal().grossTotal?.toLocaleString()}
                      </div>
                    </div>

                    <div className="w-full flex justify-between text-gray-700">
                      <div>Paid Requests' Value: </div>
                      <div className="font-semibold text-[13px]">
                        {po?.items[0]?.currency +
                          " " +
                          totalPaid?.toLocaleString()}
                      </div>
                    </div>

                    <div className="w-full flex justify-between text-gray-700">
                      <div>Linked Payment Requests' Value: </div>
                      <div
                        className={`font-semibold text-[13px]
                      
                          ${
                            amount >
                              getPoTotalVal().grossTotal - totalPaymentVal &&
                            "text-red-500"
                          }
                      `}
                      >
                        {po?.items[0]?.currency +
                          " " +
                          (totalPaymentVal + amount)?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Form
              form={form}
              
            >
              <div className="mr-5 lg:col-span-1 bg-[#EFF4F8] pb-8 pt-3 px-10">
                <h5 className="text-[18px] text-[#344767] mb-7">
                  Payment Details
                </h5>
                <div className="flex items-center">
                  <Form.Item
                    name="bankPay"
                    valuePropName="checked"
                    // wrapperCol={{ offset: 8, span: 16 }}
                  >
                    <Radio.Group
                      onChange={(e) => {
                        setBankPay(e.target.value);
                        // if (e.target.value === false) setBudgetLine(null);
                      }}
                      value={bankPay}
                      className="my-2"
                    >
                      <div className="flex gap-x-10">
                        <div className="my-1 border-t-2 border-x-2 border-[#BFC5C5]">
                          <Radio
                            value={true}
                            className="flex gap-x-1 items-center"
                          >
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
                        <label className="text-[#344767] text-[14px] mb-2">
                          Bank Name
                        </label>
                        <div className="text-red-500">*</div>
                      </div>

                      <div>
                        <Form.Item
                          name="bankName"
                          rules={
                            bankPay && [
                              {
                                required: true,
                                message: "Request Bank name is required",
                              },
                            ]
                          }
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
                        <label className="text-[#344767] text-[14px] mb-2">
                          Account Name
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
                      <div>
                        <Form.Item
                          name="accountName"
                          rules={
                            bankPay && [
                              {
                                required: true,
                                message: "Request account name is required",
                              },
                            ]
                          }
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
                        <label className="text-[#344767] text-[14px] mb-2">
                          Account Number
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
                      <div>
                        <Form.Item
                          name="accountNumber"
                          rules={
                            bankPay && [
                              {
                                required: true,
                                message: "Request account number is required",
                              },
                            ]
                          }
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
                        <label className="text-[#344767] text-[14px] mb-2">
                          Phone Name
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
                      <div>
                        <Form.Item
                          name="phoneName"
                          rules={
                            !bankPay && [
                              {
                                required: true,
                                message: "Request Phone name is required",
                              },
                            ]
                          }
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
                        <label className="text-[#344767] text-[14px] mb-2">
                          Phone Number
                        </label>
                        <div className="text-red-500">*</div>
                      </div>
                      <div>
                        <Form.Item
                          name="phoneNumber"
                          rules={
                            !bankPay && [
                              {
                                required: true,
                                message: "Request Phone number required",
                              },
                            ]
                          }
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
            </Form>

            <h5 className="text-[16px] text-[#344767] pt-5">
              Related Document
            </h5>
            <div className="flex items-center gap-x-2">
              <small className="text-[134x] text-[#344767]">
                Purchase Order:
              </small>
              <Link
                className="text-[#1677FF] text-[14px]"
                href={"/system/purchase-orders/" + po?.number}
              >
                {po?.number}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex w-full justify-end items-end self-end">
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
            Save
          </button>
        </div>
      </div>
    </motion.div>
  );
}
