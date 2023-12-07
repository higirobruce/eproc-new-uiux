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

async function getPoDetails(id, router) {
  let token = localStorage.getItem("token");
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

export default function NewPaymentRequest({ params }) {
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

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    getPoDetails(params?.poId, router).then((res) => {
      setPo(res);
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
        .then((res) => {
          if(res.ok){
           
            res.json()
          } else{
            
          }
        })
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
        docIds: _fileList
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
      className="flex flex-col mx-10 transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 h-full"
    >
      <div className="flex flex-row justify-between items-center">
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

              <div>
                {/* Amount */}
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
            </div>

            <Button
              icon={<SaveOutlined />}
              type="primary"
              onClick={() => {
                form.validateFields();
                setSubmitting(true);
                handleUpload();
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
