"Use client";
import React, { useEffect, useState } from "react";
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
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
  let [fileSelected, setFileSelected] = useState(false);

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

  return (
    <>
      {contextHolder}
      {data && (
        <List size="small">
          <VirtualList
            data={data}
            // height={ContainerHeight}
            itemHeight={47}
            itemKey="number"
            onScroll={onScroll}
          >
            {(item) => (
              <List.Item key={item?.number}>
                <List.Item.Meta
                  //   avatar={<Avatar src={item.picture.large} />}
                  title={<a href="#">{item.number}</a>}
                  description={
                    <div className="grid md:grid-cols-9 ">
                      <div className="self-center">
                        <div className="text-xs text-gray-400">Vendor</div>
                        <div className="text-xs text-gray-600">
                          {item?.createdBy?.companyName}
                        </div>
                      </div>

                      <div className="self-center">
                        <div className="text-xs text-gray-400">Bank Info</div>
                        <div className="flex flex-row">
                          <div className="text-xs text-gray-600">
                            {item?.bankName}
                          </div>
                        </div>

                        <div className="flex flex-row">
                          <div className="text-xs text-gray-600">
                            {item?.bankAccountName}
                          </div>
                        </div>
                        <div className="flex flex-row">
                          <div className="text-xs text-gray-600">
                            {item?.bankAccountNumber}
                          </div>
                        </div>
                      </div>

                      <div className="self-center">
                        <div className="text-xs text-gray-400">Price</div>
                        <div className="text-xs text-gray-600">
                          {item?.price.toLocaleString() + " " + item?.currency}
                        </div>
                        <div className="text-xs text-gray-400">Comment</div>
                        <div className="text-xs text-gray-600">
                          {item?.comment}
                        </div>
                      </div>

                      <div className="self-center flex flex-col">
                        <div className="text-xs text-gray-400">Discount</div>
                        <div className="text-xs text-gray-600">
                          {item?.discount}%
                        </div>
                      </div>

                      <div className="self-center">
                        <div className="text-xs text-gray-400">Warranty</div>
                        <div className="text-xs text-gray-600">
                          {item?.warranty} {item?.warrantyDuration}
                        </div>
                      </div>

                      <div className="self-center">
                        <div className="text-xs text-gray-400">
                          Delivery date
                        </div>
                        <div className="text-xs text-gray-600">
                          {moment(item?.deliveryDate).fromNow()}
                        </div>
                      </div>

                      <div className="self-center">
                        <div className="text-xs text-gray-400">Docs</div>
                        {item?.proposalDocId && (
                          <div className="flex flex-row items-center space-x-2">
                            <a
                              href={`${url}/file/bidDocs/${item?.proposalDocId}.pdf`}
                              target="_blank"
                              // onClick={() => {
                              //   setAttachmentId(
                              //     `bidDocs/${item?.proposalDocId}.pdf`
                              //   );
                              //   setPreviewAttachment(true);
                              // }}
                              className="text-xs"
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
                              className="text-xs"
                            >
                              Other Doc <PaperClipIcon className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="self-center">
                        <div>
                          {item?.status === "pending" && (
                            <Tag color="blue">{item?.status}</Tag>
                          )}
                          {item?.status === "selected" && (
                            <Tag color="green">{item?.status}</Tag>
                          )}
                          {item?.status === "awarded" && (
                            <>
                              <Tag color="green">selected</Tag>
                              <Tag color="green">{item?.status}</Tag>
                            </>
                          )}
                          {item?.status === "not awarded" && (
                            <>
                              <Tag color="red">not selected</Tag>
                              <Tag color="red">{item?.status}</Tag>
                            </>
                          )}
                        </div>
                      </div>

                      {item?.status === "pending" && (
                        <Button
                          className="self-center"
                          size="small"
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
                              size="small"
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

                      {/* {(item?.status === "not selected" || item?.status === "not awarded") && (
                    <Button
                      size="small"
                      disabled
                      //   onClick={() => handleSelectBid(item._id)}
                    >
                      Select Bid
                    </Button>
                  )} */}
                    </div>
                  }
                />
                <div className="flex flex-row items-end space-x-10 justify-between">
                  <div className="flex flex-row space-x-2">
                    <div className="flex flex-col"></div>
                  </div>
                </div>
              </List.Item>
            )}
          </VirtualList>
        </List>
      )}

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
