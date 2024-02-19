"use client";

import React, { useEffect, useState } from "react";
import { DatePicker, Form, Input, Select, Radio, message } from "antd";
import ItemsTable from "../../../components/itemsTable";
import moment from "moment/moment";
import { encode } from "base-64";
import { useRouter } from "next/navigation";

export default function NewRequest() {
  let router = useRouter();
  const [open, setOpen] = useState(false);
  let [confirmLoading, setConfirmLoading] = useState(false);
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  const [messageApi, contextHolder] = message.useMessage();
  const [serviceCategories, setServiceCategories] = useState([]);
  let [serviceCategory, setServiceCategory] = useState("");
  let [dueDate, setDueDate] = useState(null);
  let [title, setTitle] = useState("");
  let [description, setDescription] = useState("");
  let [rowData, setRowData] = useState(null);
  let [loadingRowData, setLoadingRowData] = useState(false);
  let [confirmRejectLoading, setConfirmRejectLoading] = useState(false);
  let [budgeted, setBudgeted] = useState(true);
  let [budgetLine, setBudgetLine] = useState("");
  let [reload, setReload] = useState(false);
  let [fileList, setFileList] = useState([]);
  let [level1Approvers, setLevel1Approvers] = useState([]);
  let [level1Approver, setLevel1Approver] = useState("");
  let [defaultApprover, setDefaultApprover] = useState({});
  let [budgetLines, setBudgetLines] = useState([]);
  const [values, setValues] = useState([]);
  let [files, setFiles] = useState([]);
  let token = typeof window !== 'undefined' && localStorage.getItem("token");

  const [form] = Form.useForm();

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth?goTo=/system/requests&sessionExpired=true");
    } else {
      return res.json();
    }
  }

  useEffect(() => {
    // loadRequests()
    //   .then((res) => res.json())
    //   .then((res) => {
    //     setDataLoaded(true);
    //     setDataset(res);
    //     setTempDataset(res);
    //   })
    //   .catch((err) => {
    //     messageApi.open({
    //       type: "error",
    //       content: "Something happened! Please try again.",
    //     });
    //   });
    fetch(`${url}/serviceCategories`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setServiceCategories(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content:
            "Something happened fetching service categories! Please try again.",
        });
      });

    fetch(`${url}/users/${user?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => setCurrentUser(res))
      .catch((err) => {
        console.log(err);
        messageApi.open({
          type: "error",
          content: "Something happened fetching users! Please try again.",
        });
      });

    fetch(`${url}/users/level1Approvers`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        let approversList = res?.filter((a) => a?._id !== user?._id);
        setLevel1Approvers(approversList);
        let hod = approversList?.filter(
          (a) => a?.department?._id === user?.department
        );

        setLevel1Approver(hod[0]?._id);

        setDefaultApprover(
          hod?.length >= 1
            ? {
                value: hod[0]?._id,
                label: hod[0].firstName + " " + hod[0].lastName,
              }
            : approversList[0]
        );
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened fetching approvers! Please try again.",
        });
      });

    fetch(`${url}/budgetLines`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setBudgetLines(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content:
            "Something happened fetching budget lines! Please try again.",
        });
      });
  }, []);

  function _setFiles(newFileList) {
    setFiles(newFileList);
  }

  function _setFileList(list) {
    setFileList(list);
  }

  const save = (_fileList) => {
    if (values && values[0]) {
      setConfirmLoading(true);
      let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
      let _values = [...values];
      _values.map((v, index) => {
        v.paths = _fileList[index];
        return v;
      });
      fetch(`${url}/requests/`, {
        method: "POST",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dueDate,
          description,
          serviceCategory,
          items: _values,
          createdBy: user?._id,
          budgeted,
          budgetLine: budgetLine,
          title,
          level1Approver,
        }),
      })
        .then((res) => getResultFromServer(res))
        .then(async (res) => {
          router.push('/system/requests')
          setDueDate(null),
            setDescription(""),
            setServiceCategory(""),
            setValues([]),
            setBudgeted(true),
            setBudgetLine(""),
            setTitle(""),
            setFileList([]);
          setFiles([]);
          loadRequests()
            .then((res) => getResultFromServer(res))
            .then((res) => {
              setDataLoaded(true);
              setDataset(res);
              setTempDataset(res);
              setConfirmLoading(false);
            })
            .catch((err) => {
              setConfirmLoading(false);
              setOpen(false);
              messageApi.open({
                type: "error",
                content: "Something happened! Please try again.",
              });
          });
        })
        .catch((err) => {
          setConfirmLoading(false);
          setOpen(false);
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
    } else {
      messageApi.error("Please add atleast one item!");
      setConfirmLoading(false);
    }
  };

  const handleUpload = (files) => {
    if (files?.length < 1) {
      messageApi.error("Please add at least one doc.");
      setConfirmLoading(false);
    } else {
      files.forEach((filesPerRow, rowIndex) => {
        filesPerRow.map((rowFile, fileIndex) => {
          const formData = new FormData();
          formData.append("files[]", rowFile);

          // You can use any AJAX library you like
          fetch(`${url}/uploads/termsOfReference/`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
              token: token,
              // "Content-Type": "multipart/form-data",
            },
          })
            .then((res) => getResultFromServer(res))
            .then((savedFiles) => {
              let _filenames = savedFiles?.map((f) => {
                return f?.filename;
              });

              let _files = [...files];
              _files[rowIndex][fileIndex] = _filenames[0];

              if (
                rowIndex === files?.length - 1 &&
                fileIndex === filesPerRow.length - 1
              ) {
                save(_files);
              }
            })
            .catch((err) => {
              messageApi.error("upload failed.");
            })
            .finally(() => {});
        });
      });
    }
  };

  return (
    <div className="payment-request h-[calc(100vh-128px)] overflow-y-auto mr-4 rounded-lg mt-6 bg-white pb-5 px-7 pt-3">
      <div className="flex flex-col justify-between h-full">
        <div>
          <h4 className="mb-2.5 font-semibold text-[19px]">
            New Purchase request
          </h4>
          <small className="text-[#8392AB]">
            Fill and submit the form below to create your purchase request.
          </small>
          <Form
            // labelCol={{ span: 8 }}
            // wrapperCol={{ span: 16 }}
            // style={{ maxWidth: 600 }}
            className="md:mr-16 mr-5"
            // layout="horizontal"
            form={form}
            onFinish={save}
          >
            <h3 className="my-4 font-bold text-[15px]">Overview</h3>
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <div className="mb-3">
                  <label>Due Date</label>
                </div>
                <div>
                  <Form.Item
                    name="dueDate"
                    rules={[
                      {
                        required: true,
                        message: "Due date is required",
                      },
                    ]}
                  >
                    <DatePicker
                      className="w-full h-11"
                      defaultValue={null}
                      value={dueDate}
                      disabledDate={(current) =>
                        current.isBefore(moment().subtract(1, "d"))
                      }
                      onChange={(v, dstr) => setDueDate(dstr)}
                    />
                  </Form.Item>
                </div>
              </div>
              <div>
                <div className="mb-3">
                  <label>Approver</label>
                </div>
                <div>
                  <Form.Item
                    name="level1Approver"
                    rules={[
                      {
                        required: true,
                        message: "Who Approves",
                      },
                    ]}
                  >
                    <Select
                      // defaultValue={defaultApprover}
                      placeholder="Select who should approve this request"
                      size="large"
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
              </div>
              <div>
                <div className="mb-3">
                  <label>Category</label>
                </div>
                <div>
                  <Form.Item
                    name="serviceCategory"
                    rules={[
                      {
                        required: true,
                        message: "Service category is required",
                      },
                    ]}
                  >
                    <Select
                      // defaultValue={serviceCategory}
                      placeholder="Select service category"
                      className="text-[7px]"
                      size="large"
                      showSearch
                      onChange={(value) => {
                        setServiceCategory(value);
                      }}
                      filterSort={(optionA, optionB) =>
                        (optionA?.label ?? "")
                          .toLowerCase()
                          .localeCompare((optionB?.label ?? "").toLowerCase())
                      }
                      filterOption={(inputValue, option) =>
                        option.label
                          .toLowerCase()
                          .includes(inputValue.toLowerCase())
                      }
                      // defaultValue="RWF"
                      options={[
                        ...serviceCategories,
                        { description: "Others" },
                      ].map((s) => {
                        return {
                          value: s.description,
                          label: s.description,
                        };
                      })}
                    ></Select>
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-10 mb-1">
              <div>
                <div className="mb-3">
                  <label> Request title</label>
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
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="How would you name your request?"
                      className="w-full h-11"
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-span-2">
                <div className="mb-3">
                  <label>Description</label>
                </div>
                <div>
                  <Form.Item
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Description is required",
                      },
                    ]}
                  >
                    <Input.TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe your request"
                      showCount
                      maxLength={100}
                      rows={4}
                    />
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3">
              <div>
                <div className="mb-3">
                  <label>Is this a budgeted request?</label>
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
                      <Radio value={true} className="mr-3">
                        <span className="ml-2 text-[15px]">Yes</span>
                      </Radio>
                      <Radio value={false} className="mx-3">
                        <span className="ml-2 text-[15px]">No</span>
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </div>
              {budgeted && (
                <div>
                  <div className="mb-3">
                    <label>Budget Line</label>
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
                        options={budgetLines.map((s) => {
                          return {
                            label: s.description.toUpperCase(),
                            options: s.budgetlines.map((sub) => {
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
            <h3 className="my-5 font-bold text-[15px]">Request specifications</h3>
            <ItemsTable
              setDataSource={setValues}
              dataSource={values}
              fileList={fileList}
              setFileList={_setFileList}
              files={files}
              setFiles={_setFiles}
            />
          </Form>
        </div>
        <div className="flex justify-end gap-5 xl:-mt-7 md:-mt-5 -mt-3">
          <button className="bg-white rounded-lg px-8 py-3 border border-[#0065DD]">
            <small className="py-0 text-[15px] text-[#0065DD]">Cancel</small>
          </button>
          <button className="bg-[#0065DD] rounded-lg px-8 py-3 border-none cursor-pointer" onClick={async () => {
              await form.validateFields();
              if (values && values[0]) {
                let invalidValues = values?.filter(
                  (v) =>
                    v?.title == "" ||
                    v?.quantity == "" ||
                    v?.estimatedUnitCost === ""
                );
                if (invalidValues?.length == 0) {
                  setConfirmLoading(true);
                  handleUpload(files);
                }
              } else {
                messageApi.error("Please add atleast one item!");
              }
            }}>
            <small className="py-5 text-[15px] text-white">
              Submit for Approval
            </small>
          </button>
        </div>
      </div>
    </div>
  );
}
