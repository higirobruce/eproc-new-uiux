"use client";
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Modal,
  Row,
  Typography,
  message,
  Input,
  Empty,
  Select,
  Spin,
} from "antd";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import ItemList from "../../components/itemList";
import TenderDetails from "../../components/tenderDetails";
import TendersTable from "../../components/tendersTable";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useUser } from "@/app/context/UserContext";

export default function Tenders() {
  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let router = useRouter()
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let [dataset, setDataset] = useState([]);
  let [tempDataset, setTempDataset] = useState([]);
  let [updatingId, setUpdatingId] = useState("");
  const [open, setOpen] = useState(false);
  let [title, setTitle] = useState("");
  let [confirmLoading, setConfirmLoading] = useState(false);
  let [values, setValues] = useState([]);
  let [dueDate, setDueDate] = useState(null);
  let [rowData, setRowData] = useState(null);
  let [loadingRowData, setLoadingRowData] = useState(false);
  let [totalTenders, setTotalTenders] = useState(0);
  let [totalBids, setTotalBids] = useState(0);
  let [doneCreatingContract, setDoneCreatingContract] = useState(false);
  let [services, setServices] = useState([]);

  let [searchStatus, setSearchStatus] = useState("all");
  let [searchText, setSearchText] = useState(null);

  useEffect(() => {
    loadTenders()
      .then((res) => res.json())
      .then((res) => {
        setDataLoaded(true);
        setDataset(res);
        setTempDataset(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }, []);

  function refresh() {
    setDataLoaded(false);
    setLoadingRowData(true);
    loadTenders()
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setDataLoaded(true);
        setLoadingRowData(false);
        setDataset(res);
        setTempDataset(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  async function loadTenders() {
    if (user?.userType === "VENDOR")
      return fetch(`${url}/tenders/byServiceCategories/`, {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceCategories: user?.services,
        }),
      });
    else
      return fetch(`${url}/tenders/`, {
        method: "GET",
        headers: {
          Authorization:
            "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      });
  }

  useEffect(() => {
    setUpdatingId("");
    // loadStats();
  }, [dataset]);

  useEffect(() => {
    if (searchText === "") {
      refresh();
    } else {
      let _dataSet = [...dataset];
      let filtered = _dataSet.filter((d) => {
        return (
          d?.number?.toString().indexOf(searchText) > -1 ||
          d?.purchaseRequest?.number?.toString().indexOf(searchText) > -1
        );
      });
      setTempDataset(filtered);
      // else setTempDataset(dataset)
    }
  }, [searchText]);

  useEffect(() => {
    if (searchStatus === "all") {
      refresh();
    } else {
      setDataLoaded(false);
      fetch(`${url}/tenders/byStatus/${searchStatus}`, {
        method: "GET",
        headers: {
          Authorization:
            "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setDataLoaded(true);
          if (user?.userType !== "VENDOR") {
            setDataset(res);
            setTempDataset(res);
          } else {
            setDataset(
              res?.filter(
                (r) =>
                  user?.services?.indexOf(r?.purchaseRequest?.serviceCategory) >
                  -1
              )
            );
            setTempDataset(
              res?.filter(
                (r) =>
                  user?.services?.indexOf(r?.purchaseRequest?.serviceCategory) >
                  -1
              )
            );
          }
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
    }
  }, [searchStatus]);

  const save = () => {
    console.log("Received values of form:", values);
    setConfirmLoading(true);

    fetch(`${url}/tenders/`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dueDate,
        items: values.items,
        createdBy: user?._id,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        loadTenders()
          .then((res) => res.json())
          .then((res) => {
            setDataLoaded(true);
            setDataset(res);
            setTempDataset(res);
            setConfirmLoading(false);
            setOpen(false);
          })
          .catch((err) => {
            console.log(err);
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
  };

  // function loadStats() {
  //   fetch(`${url}/tenders/stats`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((res) => {
  //       setTotalTenders(res?.total);
  //       // setOpen(res?.open)
  //       // setClosed(res?.closed)
  //     });

  //   fetch(`${url}/submissions`, {
  //     method: "GET",
  //     headers: {
  //       Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
  //       "Content-Type": "application/json",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((res) => {
  //       setTotalBids(res?.length);
  //       // setOpen(res?.open)
  //       // setClosed(res?.closed)
  //     });
  // }

  function handleSetRow(row) {
    setLoadingRowData(true);
    setRowData(row);
    setLoadingRowData(false);
  }

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/tenders&sessionExpired=true`);
    } else {
      return res.json();
    }
  }
  
  return (
    <>
      {contextHolder}
      {dataLoaded ? (
        <motion.div className="flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-6 h-screen mt-6 pb-10 px-4">
          {/* <Row className="flex flex-col custom-sticky space-y-2 bg-white px-10 py-3 shadow">
            <div className="flex flex-row justify-between items-center">
              <div className="text-xl font-semibold">Tenders</div>
            </div>

            <Row className="flex flex-row space-x-5 items-center justify-between">
              <div className="flex-1">
                <Select
                  // mode="tags"
                  style={{ width: "300px" }}
                  placeholder="Select status"
                  onChange={(value) => setSearchStatus(value)}
                  value={searchStatus}
                  options={[
                    { value: "all", label: "All" },
                    { value: "open", label: "Open" },
                    {
                      value: "closed",
                      label: "Closed",
                    },
                  ]}
                />
              </div>
              <div className="">
                <Input.Search
                  style={{ width: "300px" }}
                  autoFocus
                  onChange={(e) => {
                    setSearchText(e?.target?.value);
                  }}
                  placeholder="Search by tender#, request#"
                />
              </div>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
              ></Button>
            </Row>
          </Row> */}
          <div className="flex items-center justify-between lg:mr-6">
            <div />
            <div className="flex items-center gap-5">
              <Select
                  // mode="tags"
                  className="text-[9px] w-32 rounded-sm"
                  placeholder="Select status"
                  onChange={(value) => setSearchStatus(value)}
                  value={searchStatus}
                  options={[
                    // { value: "mine", label: "My requests" },
                    { value: "all", label: "All" },
                    { value: "open", label: "Open" },
                    {
                      value: "closed",
                      label: "Closed",
                    },
                  ]}
                />
              <Button
                type="text"
                className="bg-white h-8 text-[#0063CF]"
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
              ></Button>
            </div>
          </div>
          <div className="request lg:mr-6 bg-white rounded-lg h-[calc(100vh-170px)] mb-10 px-5 pb-2 overflow-y-auto">
            <div className="flex justify-between space-x-10 items-center mb-5">
              <h4 className="text-[19px] text-[#344767]">Tenders</h4>
              <div className="flex items-center rounded-lg bg-[#F5F7FA] p-1.5">
                <FiSearch size={18} className="text-[#E4E4E4] ml-2" />
                <Input
                  onChange={(e) => {
                    setSearchText(e?.target?.value);
                  }}
                  placeholder="Search by tender#, request#"
                  className="border-0 text-[#8392AB] bg-transparent text-[15px] hover:border-none hover:outline-none"
                />
                <div></div>
              </div>
            </div>
          
            <TendersTable
              handleSetRow={handleSetRow}
              dataSet={tempDataset}
              updatingId={updatingId}
              user={user}
            />
          </div>
          <Modal
            title="Create a User Purchase request"
            centered
            open={open}
            onOk={() => save()}
            onCancel={() => setOpen(false)}
            okText="Save"
            okButtonProps={{ size: "small" }}
            cancelButtonProps={{ size: "small" }}
            width={1000}
            confirmLoading={confirmLoading}
          >
            <Form
              // labelCol={{ span: 3 }}
              className="mt-5"
              // wrapperCol={{ span: 14 }}
              // layout="horizontal"
              size="small"
              onFinish={save}
            >
              <Form.Item label="Due date">
                <DatePicker
                  onChange={(v, dstr) => setDueDate(dstr)}
                  disabledDate={(current) =>
                    current.isBefore(moment().subtract(1, "d"))
                  }
                />
              </Form.Item>
              <Row className="flex flex-row justify-between">
                <Col>
                  <Typography.Title level={4}>Items</Typography.Title>
                  <ItemList handleSetValues={setValues} />
                </Col>

                <Col>
                  <Typography.Title level={4}>
                    Evalutaion Criterion
                  </Typography.Title>
                </Col>
              </Row>
            </Form>
          </Modal>
          {/* <div class="absolute -bottom-32 right-10 opacity-10">
            <Image src="/icons/blue icon.png" width={110} height={100} />
          </div> */}
        </motion.div>
      ) : dataLoaded && dataset?.length === 0 ? (
        <Empty />
      ) : (
        <div className="flex items-center justify-center flex-1 h-screen">
          <Spin
            indicator={
              <LoadingOutlined
                className="text-gray-500"
                style={{ fontSize: 42 }}
                spin
              />
            }
          />
        </div>
      )}
    </>
  );
}
