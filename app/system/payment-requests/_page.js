"use client";
import {
  ArrowLeftOutlined,
  BackwardOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Modal,
  Row,
  Typography,
  message,
  Input,
  Select,
  Checkbox,
  Radio,
  Spin,
  Switch,
} from "antd";
import moment from "moment/moment";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import ItemsTable from "../../components/itemsTable";
import RequestDetails from "../../components/requestDetails";
import UsersRequestsTable from "../../components/userRequestsTable";
import { useRouter } from "next/navigation";
import { encode } from "base-64";
import { motion } from "framer-motion";
import PaymentRequestsTable from "@/app/components/paymentRequestsTable";
import { useUser } from "@/app/context/UserContext";

export default function UserRequests() {
  let router = useRouter();
  const { user, login, logout } = useUser();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  // let user = JSON.parse(localStorage.getItem("user"));
  let [dataset, setDataset] = useState([]);
  let [tempDataset, setTempDataset] = useState([]);
  let [updatingId, setUpdatingId] = useState("");
  let [rowData, setRowData] = useState(null);
  let [loadingRowData, setLoadingRowData] = useState(false);
  let [confirmRejectLoading, setConfirmRejectLoading] = useState(false);
  let [reload, setReload] = useState(false);
  const [editRequest, setEditRequest] = useState(false);

  let [searchStatus, setSearchStatus] = useState("all");
  let [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [onlyMine, setOnlyMine] = useState(
    !user?.permissions?.canApproveAsHof &&
      !user?.permissions?.canApproveAsPM &&
      !user?.permissions?.canApproveAsHod
      ? true
      : false
  );
  const [myPendingRequest, setMyPendingRequest] = useState(false);
  const [currentUser, setCurrentUser] = useState("");
  const [sourcingMethod, setSourcingMethod] = useState("");
  let [submitting, setSubmitting] = useState(false);
  let token = typeof window !== 'undefined' && localStorage.getItem("token");

  useEffect(() => {
    setDataLoaded(false);
    let requestUrl =
      onlyMine || user?.userType === "VENDOR"
        ? `${url}/paymentRequests/byStatus/${searchStatus}/${user?._id}`
        : `${url}/paymentRequests/byStatus/${searchStatus}/${null}`;
    fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
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
  }, [searchStatus, onlyMine]);

  useEffect(() => {
    if (searchText === "") {
      refresh();
      setDataset(dataset);
    } else {
      let _dataSet = [...dataset];
      let filtered = _dataSet.filter((d) => {
        return (
          d?.number.toString().indexOf(searchText) > -1 ||
          d?.purchaseOrder?.number.toString().indexOf(searchText) > -1 ||
          d?.title?.toLowerCase().indexOf(searchText?.toLowerCase()) > -1 ||
          d?.createdBy?.firstName
            ?.toLowerCase()
            .indexOf(searchText?.toLowerCase()) > -1 ||
          d?.createdBy?.lastName
            ?.toLowerCase()
            .indexOf(searchText?.toLowerCase()) > -1
        );
      });
      setTempDataset(filtered);
      // else setTempDataset(dataset)
    }
  }, [searchText]);

  useEffect(() => {
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
      .catch((err) =>
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        })
      );
  }, []);

  function refresh() {
    setDataLoaded(false);
    // setSearchStatus("mine");
    loadRequests()
      .then((res) => getResultFromServer(res))
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
  }

  async function loadRequests() {
    // setDataLoaded(false);
    let requestUrl = onlyMine
      ? `${url}/paymentRequests/byStatus/${searchStatus}/${user?._id}`
      : `${url}/paymentRequests/byStatus/${searchStatus}/${null}`;
    // let requestUrl =
    //   searchStatus === "mine"
    //     ? `${url}/requests/${user?._id}`
    //     : `${url}/requests/byStatus/${searchStatus}`;

    return fetch(requestUrl, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  const getMyPendingRequest = (value) => {
    setMyPendingRequest(value);
    if (value) {
      const statusFilter = tempDataset.filter((item) =>
        user?.permissions?.canApproveAsHof
          ? item.status == "approved (hod)"
          : user?.permissions?.canApproveAsHod
          ? user._id == item?.approver?._id &&
            (item?.status == "pending-review" || item?.status == "reviewed")
          : true
      );

      setTempDataset(statusFilter);
    } else {
      refresh();
    }
  };

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/payment-requests/&sessionExpired=true`);
    } else {
      return res.json();
    }
  }

  useEffect(() => {
    setUpdatingId("");
  }, [dataset]);

  return !rowData ? (
    <>
      {contextHolder}
      {dataLoaded && !submitting ? (
        <motion.div className="flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-10 h-full">
          <Row className="flex flex-col custom-sticky bg-white px-10 py-3 shadow space-y-2">
            <div className="flex flex-row items-center justify-between">
              <div className="text-xl font-semibold">Payment Requests</div>

              <div className="flex items-center space-x-3">
                {user?.userType !== "VENDOR" &&
                  (currentUser?.permissions?.canApproveAsHod ||
                    currentUser?.permissions?.canApproveAsHof ||
                    currentUser?.permissions?.canApproveAsPM) && (
                    <div className="flex flex-row items-center space-x-1">
                      <div>Awaiting my approval</div>
                      <Checkbox
                        checked={myPendingRequest}
                        disabled={onlyMine}
                        onChange={(e) => {
                          getMyPendingRequest(e.target.checked);
                        }}
                      />
                    </div>
                  )}
                {user?.userType !== "VENDOR" && (
                  <div className="flex flex-row items-center space-x-1">
                    <div>My requests</div>
                    {
                      <Checkbox
                        checked={onlyMine}
                        onChange={(e) => {
                          setOnlyMine(e.target.checked);
                        }}
                      />
                    }
                  </div>
                )}
              </div>
            </div>
            <Row className="flex flex-row justify-between items-center space-x-4">
              <div className="flex-1">
                <Select
                  // mode="tags"
                  style={{ width: "300px" }}
                  placeholder="Select status"
                  onChange={(value) => setSearchStatus(value)}
                  value={searchStatus}
                  options={[
                    // { value: "mine", label: "My requests" },
                    { value: "all", label: "All requests" },
                    { value: "pending-approval", label: "Pending approval" },
                    { value: "pending-review", label: "Pending review" },
                    {
                      value: "approved",
                      label: "Approved",
                    },
                    {
                      value: "paid",
                      label: "Paid",
                    },
                    {
                      value: "declined",
                      label: "Declined",
                    },
                  ]}
                />
              </div>

              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
              ></Button>
              <div>
                <Input.Search
                  style={{ width: "300px" }}
                  autoFocus
                  onChange={(e) => {
                    setSearchText(e?.target?.value);
                  }}
                  placeholder="Search by request#, po#, initiator"
                />
              </div>

              {user?.userType !== "VENDOR" && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setSubmitting(true);
                    router.push("/system/payment-requests/new");
                  }}
                >
                  New Payment request
                </Button>
              )}
            </Row>
          </Row>
          {/* <RequestStats totalRequests={dataset?.length}/> */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: tempDataset ? 1 : 0,
            }}
            transition={{
              duration: 0.2,
              type: "tween",
              ease: "circOut",
            }}
            className="mx-10"
          >
            <PaymentRequestsTable
              // handleSetRow={handleSetRow}
              dataSet={tempDataset}
              handleSubmitting={setSubmitting}
              // handleApproveRequest={approveRequest}
              // handleDeclineRequest={declineRequest}
              updatingId={updatingId}
            />
          </motion.div>

          <div class="absolute -bottom-32 right-10 opacity-10">
            <Image src="/icons/blue icon.png" width={110} height={100} />
          </div>
        </motion.div>
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
  ) : (
    buildRequest(
      rowData,
      setRowData,
      updateStatus,
      loadingRowData,
      rowData,
      createTender,
      declineRequest,
      setConfirmRejectLoading,
      confirmRejectLoading,
      updateProgress,
      reload,
      createPO,
      createContract
    )
  );
  function buildRequest(
    selectedReqId,
    setSelectedReqId,
    updateStatus,
    loadingRowData,
    rowData,
    createTender,
    declineRequest,
    setConfirmRejectLoading,
    confirmRejectLoading,
    updateProgress,
    reload,
    createPO,
    createContract
  ) {
    return (
      <div className="flex flex-col mx-10 transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 h-full">
        {contextHolder}
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row space-x-10 items-center">
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                type="primary"
                onClick={() => {
                  setSelectedReqId(null);
                  setEditRequest(false);
                }}
              >
                Back
              </Button>
            </div>

            {editRequest && (
              <div className="flex flex-row items-center text-xl font-semibold">
                <Typography.Text
                  level={5}
                  editable={
                    editRequest && {
                      text: selectedReqId?.title,
                      onChange: (e) => {
                        let req = { ...selectedReqId };
                        req.title = e;
                        setSelectedReqId(req);
                      },
                    }
                  }
                >
                  {selectedReqId?.title}
                </Typography.Text>
              </div>
            )}

            {editRequest && (
              <div>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={() => {
                    updateRequest();
                  }}
                >
                  Save
                </Button>
              </div>
            )}

            {!editRequest && (
              <div className="text-xl font-semibold">
                Request - {selectedReqId?.title}
              </div>
            )}
          </div>
          {(rowData?.level1Approver?._id === user?._id ||
            rowData?.createdBy?._id === user?._id) &&
            rowData?.status !== "approved" && (
              <Switch
                checkedChildren={<EditOutlined />}
                unCheckedChildren={<EyeOutlined />}
                onChange={(e) => setEditRequest(e)}
              />
            )}
        </div>
        <RequestDetails
          handleUpdateStatus={updateStatus}
          loading={loadingRowData}
          data={rowData}
          handleCreateTender={createTender}
          handleReject={declineRequest}
          setConfirmRejectLoading={setConfirmRejectLoading}
          confirmRejectLoading={confirmRejectLoading}
          handleUpdateProgress={updateProgress}
          reload={reload}
          handleCreatePO={createPO}
          handleCreateContract={createContract}
          edit={editRequest}
          handleUpdateRequest={setSelectedReqId}
          handleRateDelivery={rateDelivery}
          refDoc={sourcingMethod}
          setRefDoc={setSourcingMethod}
        />
      </div>
    );
  }
}
