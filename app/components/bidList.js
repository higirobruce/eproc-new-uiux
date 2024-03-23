"Use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Empty,
  Form,
  List,
  message,
  Modal,
  Popover,
  Tag,
  Typography,
} from "antd";
import VirtualList from "rc-virtual-list";
import moment from "moment";
import {
  FileOutlined,
  FileTextOutlined,
  FolderViewOutlined,
} from "@ant-design/icons";
import UploadFiles from "./uploadFiles";
import {
  CheckCircleIcon,
  MinusCircleIcon,
  PaperClipIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";
import UploadEvaluationReport from "./uploadEvaluationReport";
import { v4 } from "uuid";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import { RiArrowDropDownLine } from "react-icons/ri";
import { MdOutlineAccountBalance } from "react-icons/md";
import { LuUser, LuHash } from "react-icons/lu";
const fakeDataUrl =
  "https://randomuser.me/api/?results=20&inc=name,gender,email,nat,picture&noinfo";

const BidList = ({
  tenderId,
  handleSelectBid,
  refresh,
  handleAwardBid,
  handleSetBidList,
  canSelectBid,
  comitee,
  user,
  setPreviewAttachment,
  setAttachmentId,
  tenderData,
}) => {
  let router = useRouter();
  const [data, setData] = useState(null);
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  const [messageApi, contextHolder] = message.useMessage();
  let [selectedBid, setSelectedBid] = useState(null);
  let [ContainerHeight, setContainerHeight] = useState(0);
  let [openSelectBid, setOpenSelectBid] = useState(false);
  let [evaluationReportId, setEvaluationRptId] = useState(v4());
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let [fileSelected, setFileSelected] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const contentHeight = useRef();

  const appendData = () => {
    fetch(`${url}/submissions/byTender/${tenderId}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((body) => {
        setData(body);
        handleSetBidList(body);
        if (body?.length >= 2) setContainerHeight(200);
        else if (body?.length == 1) setContainerHeight(200);
        else setContainerHeight(0);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleItemClick = (value) => {
    setActiveIndex((prevIndex) => (prevIndex === value ? "" : value));
  };

  useEffect(() => {
    appendData();
  }, [refresh]);
  useEffect(() => {
    appendData();
    setEvaluationRptId(v4());
  }, [tenderId]);
  const onScroll = (e) => {
    if (
      e.currentTarget.scrollHeight - e.currentTarget.scrollTop ===
      ContainerHeight
    ) {
      appendData();
    }
  };

  const statusClass = {
    pending: { bgColor: "#FFFFD3", color: "#BDC00A", status: "Pending" },
    selected: { bgColor: "#F0FEF3", color: "#00CE82", status: "Selected" },
    awarded: { bgColor: "#F0FEF3", color: "#00CE82", status: "Awarded" },
    "not awarded": { bgColor: "#FEE", color: "#F5365C", status: "Not Awarded" },
  };

  return (
    <>
      {contextHolder}
      {data?.length > 0 &&
        data.map((item, key) => (
          <>
            <button
              className={`cursor-pointer w-full pr-5 mt-4 pt-1 -pb-4 flex justify-evenly items-center border-b-0 border-[#f5f2f2] border-t border-x-0 ${
                activeIndex == key ? "bg-[#F7F7F8]" : "bg-transparent"
              }`}
              onClick={() => handleItemClick(key)}
            >
              <div className="flex flex-1 items-center justify-between gap-x-4 my-1 py-1 px-5">
                <h6 className="text-[#344767] text-[13px] py-0 my-0">
                  {item?.number}
                </h6>
                <div className="flex flex-col items-start gap-2">
                  <small className="text-[10px] text-[#8392AB]">Vendor</small>
                  <p className="text-[#344767] font-medium text-[15px] py-0 my-0">
                    {item?.createdBy?.companyName}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <small className="text-[10px] text-[#8392AB]">Price</small>
                  <p className="text-[#344767] font-semibold text-[15px] py-0 my-0">
                    {item?.price.toLocaleString() + " " + item?.currency}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <small className="text-[10px] text-[#8392AB]">Discount</small>
                  <p className="text-[#344767] font-semibold text-[15px] py-0 my-0">
                    {item?.discount}%
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <small className="text-[10px] text-[#8392AB]">
                    Bid Decision
                  </small>
                  <div>
                    <div
                      className={`px-3 py-1.5 bg-[${
                        statusClass[item?.status]?.bgColor
                      }] rounded-xl`}
                    >
                      <small
                        className={`text-[${
                          statusClass[item?.status]?.color
                        }] text-[13px]`}
                      >
                        {statusClass[item?.status]?.status}
                      </small>
                    </div>
                  </div>
                </div>
                {item?.status === "pending" && (
                  <Button
                    className="self-center"
                    size="middle"
                    type="primary"
                    disabled={
                      !canSelectBid || !user?.permissions?.canApproveBids
                    }
                    onClick={() => {
                      setSelectedBid(item._id);
                      setOpenSelectBid(true);
                    }}
                  >
                    Select Bid
                  </Button>
                )}
                {item?.status === "selected" &&
                  tenderData?.evaluationReportId && (
                    <>
                      <Button
                        size="middle"
                        disabled={
                          !documentFullyApproved(data) ||
                          !user?.permissions?.canCreateContracts
                        }
                        type="primary"
                        onClick={() => handleAwardBid(item._id)}
                      >
                        Award Tender
                      </Button>
                    </>
                  )}
                <RiArrowDropDownLine
                  className={`text-[36px] text-[#344767] arrow ml-10 ${
                    activeIndex == key ? "active" : ""
                  }`}
                />
              </div>
            </button>
            <div
              ref={contentHeight}
              className="answer-container mt-1 -mb-[21px] px-8 rounded-lg"
              style={
                activeIndex == key
                  ? {
                      display: "flex",
                      flexDirection: "column",
                      borderWidth: 1,
                      borderStyle: "solid",
                      borderColor: "#F1F3FF",
                      background: "#FDFEFF",
                    }
                  : { display: "none" }
              }
            >
              <div className="py-5 flex justify-between">
                <div className="flex flex-col gap-5">
                  <small className="text-[12px] text-[#8392AB]">
                    Supporting Docs
                  </small>
                  <div className="">
                    {item?.proposalDocId && (
                      <div className="flex flex-row items-center">
                        <a
                          href={`${url}/file/bidDocs/${item?.proposalDocId}.pdf`}
                          target="_blank"
                          // onClick={() => {
                          //   setAttachmentId(
                          //     `bidDocs/${item?.proposalDocId}.pdf`
                          //   );
                          //   setPreviewAttachment(true);
                          // }}
                          className="text-xs no-underline text-[#1677FF]"
                        >
                          Proposal <PaperClipIcon className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {!item?.proposalDocId && (
                      <div className="text-xs">No proposal doc found!</div>
                    )}
                    {item?.otherDocId && (
                      <div>
                        <a
                          href={`${url}/file/bidDocs/${item?.otherDocId}.pdf`}
                          target="_blank"
                          // onClick={() => {
                          //   // router.push(`bidDocs/${item?.otherDocId}.pdf`)
                          //   // setAttachmentId(
                          //   //   `bidDocs/${item?.otherDocId}.pdf`
                          //   // );
                          //   // setPreviewAttachment(true);
                          // }}
                          className="text-xs no-underline text-[#1677FF]"
                        >
                          Other Doc <PaperClipIcon className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <small className="text-[12px] text-[#8392AB]">
                    Bank Details
                  </small>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <MdOutlineAccountBalance className="text-[#8392AB]" />
                      {/* {po?.vendor?.companyEmail} */}
                      <small className="text-[#455A64] text-[13px] font-medium">
                        {item?.bankName || "-"}
                      </small>
                    </div>
                    <div className="flex items-center gap-3">
                      <LuUser className="text-[#8392AB]" />
                      {/* {po?.vendor?.companyName} */}
                      <small className="text-[#455A64] text-[13px] font-medium">
                        {item?.bankAccountName || "-"}
                      </small>
                    </div>
                    <div className="flex items-center gap-3">
                      <LuHash className="text-[#8392AB]" />
                      {/* {po?.vendor?.tin} */}
                      <small className="text-[#455A64] text-[13px] font-medium">
                        {item?.bankAccountNumber || "-"}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <small className="text-[12px] text-[#8392AB]">
                    Additional Bid Info
                  </small>
                  <div className="flex flex-col gap-y-3.5 mt-5">
                    <div className="flex items-center gap-3">
                      <small className="text-[#455A64] text-[13px] font-medium">
                        {item?.warranty} {item?.warrantyDuration}
                      </small>
                      <div className="bg-[#F1F3FF] py-1 px-3 rounded-xl text-[11px] font-medium text-[#353531]">
                        Warranty
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <small className="text-[#455A64] text-[13px] font-medium">
                      {(item?.deliveryTimeFrame &&
                                          item?.deliveryTimeFrame +
                                            " " +
                                            item?.deliveryTimeFrameDuration) ||
                                          moment(item?.deliveryDate).fromNow()}
                      </small>
                      <div className="bg-[#F1F3FF] py-1 px-3 rounded-xl text-[11px] font-medium text-[#353531]">
                        Delivery timeframe
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-5">
                  <small className="text-[12px] text-[#8392AB]">
                    Additional Comments
                  </small>
                  <textarea
                    value={item?.comment}
                    className="border-[#D9D9D9] px-3 py-2.5 rounded-lg text-[12px] text-[#8392AB]"
                    rows={4}
                  ></textarea>
                </div>
              </div>
            </div>
          </>
        ))}

      {(!data || data?.length < 1) && <Empty />}

      {selectBidModal()}
    </>
  );

  function selectBidModal() {
    return (
      <Modal
        title="Select Bid"
        centered
        open={openSelectBid}
        onOk={() => {
          if (fileSelected) {
            setOpenSelectBid(false);
            handleSelectBid(selectedBid, evaluationReportId);
          } else {
            messageApi.error("Please first select the evaluation report!");
          }
        }}
        width={"30%"}
        okText="Save and Submit"
        onCancel={() => setOpenSelectBid(false)}
        // bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <Form>
          <div className="flex flex-col">
            <Typography.Title level={4}>
              Please upload the evaluation report.
            </Typography.Title>
            <Form.Item>
              <UploadEvaluationReport
                uuid={evaluationReportId}
                label="Select evaluation report!"
                setSelected={setFileSelected}
              />
            </Form.Item>

            <Alert
              banner
              message={
                <>
                  <div className="text-sm mb-2">
                    The following people should approve of this.
                  </div>
                  <div className="grid grid-cols1 gap-3">
                    {comitee?.map((c) => {
                      return (
                        <>
                          <div
                            key={c.approver}
                            className="flex flex-row items-center space-x-2 w-full"
                          >
                            <UserIcon className="h-4 w-4" />
                            <div>{c.approver}</div>
                          </div>
                          {/* <div className="flex flex-row space-x-2 items-center">
                      <CheckCircleIcon className="cursor-pointer h-5 w-5 text-green-500" />
                      <XCircleIcon className="cursor-pointer h-5 w-5 text-red-500" />
                      <MinusCircleIcon className="cursor-pointer h-5 w-5 text-yellow-500" />
                    </div> */}
                        </>
                      );
                    })}
                  </div>
                </>
              }
            />
          </div>
        </Form>
      </Modal>
    );
  }

  function documentFullyApproved(document) {
    let totIvitees = comitee;
    let approvals = comitee?.filter((s) => s.approved);

    return totIvitees?.length === approvals?.length;
  }
};
export default BidList;
