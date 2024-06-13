"use client";
import {
  DollarOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PlaySquareOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Typography,
  MenuProps,
  Progress,
  Modal,
  Table,
  Empty,
  Popconfirm,
  Popover,
  message,
  Tag,
  Tooltip,
  Select,
  Spin,
  Row,
  Input,
  Col,
  Pagination,
} from "antd";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import parse from "html-react-parser";
import * as _ from "lodash";
import moment from "moment-timezone";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
const PrintPDF = dynamic(() => import("@/app/components/printPDF"), {
  srr: false,
});
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";
import { PaperClipIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FaLink } from "react-icons/fa6";
import { IoLink } from "react-icons/io5";
import { LuUser, LuHash } from "react-icons/lu";
import { BiEnvelope } from "react-icons/bi";
import { IoCheckmarkOutline } from "react-icons/io5";
import { RiForbidLine } from "react-icons/ri";
import { useUser } from "@/app/context/UserContext";
import { isMobile } from "react-device-detect";
import NotificationComponent from "@/app/hooks/useMobile";
// import MyPdfViewer from "../common/pdfViewer";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
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

export default function PurchaseOrders() {
  const { user, login, logout } = useUser();
  // let user = JSON.parse(
  //   typeof window !== "undefined" && localStorage.getItem("user")
  // );
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let router = useRouter();
  const [dataLoaded, setDataLoaded] = useState(false);
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let fendUrl = process.env.NEXT_PUBLIC_FTEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let [pOs, setPOs] = useState(null);
  let [tempPOs, setTempPOs] = useState(null);
  let [po, setPO] = useState(null);
  let [totalPaid, setTotalPaid] = useState(0);
  let [totalValue, setTotalValue] = useState(0);
  let [poFullyPaid, setPoFullyPaid] = useState(false);
  let [openViewPO, setOpenViewPO] = useState(false);
  let [startingDelivery, setStartingDelivery] = useState(false);
  let [readyToSign, setReadyToSign] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [activeIndex, setActiveIndex] = useState(-1);
  const contentHeight = useRef();
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const items = [
    {
      key: "1",
      label: "Sign PO",
    },
    {
      key: "2",
      label: "View PO",
    },
  ];

  let [submitting, setSubmitting] = useState(false);
  let [withdrawing, setWithdrawing] = useState(false);
  let [openWithdrawWarning, setOpenWithdrawWarning] = useState(false);
  let [openTerminatingWarning, setOpenTerminatingWarning] = useState(false);
  // let [openTerminatingWarning, setOpenTerminatingWarning] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState(false);
  const [attachmentId, setAttachmentId] = useState("TOR-id.pdf");

  const onMenuClick = (e) => {
    setOpenViewPO(true);
  };

  const columns = [
    {
      title: "Description",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, item) => <>{(item?.quantity).toLocaleString()}</>,
    },
    {
      title: "Unit Price",
      dataIndex: "estimatedUnitCost",
      key: "estimatedUnitCost",
      render: (_, item) => (
        <>{item?.currency + " " + (item?.estimatedUnitCost).toLocaleString()}</>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, item) => (
        <>
          {item?.currency +
            " " +
            (item?.quantity * item?.estimatedUnitCost).toLocaleString()}
        </>
      ),
    },
  ];

  let [sections, setSections] = useState([
    { title: "Set section title", body: "" },
  ]);
  const [signatories, setSignatories] = useState([]);
  const [docDate, setDocDate] = useState(moment());
  const [docType, setDocType] = useState("dDocument_Service");
  const [signing, setSigning] = useState(false);

  const [searchStatus, setSearchStatus] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    refresh();
  }, [currentPage, pageSize]);

  useEffect(() => {
    refresh();
  }, [searchStatus]);

  useEffect(() => {
    if (searchText === "") {
      refresh();
    } else {
      let _dataSet = [...pOs];
      let filtered = _dataSet.filter((d) => {
        return (
          d?.number?.toString().indexOf(searchText.toLowerCase()) > -1 ||
          d?.vendor?.companyName
            ?.toString()
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1
        );
      });
      setTempPOs(filtered);
      // else setTempDataset(dataset)
    }
  }, [searchText]);

  useEffect(() => {
    if (po) {
      getPoPaidRequests(po?._id, router).then((res) => {
        // setPoVal(res?.poVal);
        let gross = getPoTotalVal2(po).grossTotal?.toLocaleString();
        setTotalPaid(res?.totalPaymentVal);

        setPoFullyPaid(gross === res?.totalPaymentVal);

        // console.log("Paid:", res?.totalPaymentVal, "Value:", gross);
      });
    }
  }, [po]);
  function refresh() {
    setDataLoaded(false);
    if (user?.userType === "VENDOR") {
      fetch(
        `${url}/purchaseOrders/byVendorId/${user?._id}?status=${searchStatus}`,
        {
          method: "GET",
          headers: {
            Authorization:
              "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
            token: token,
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => getResultFromServer(res))
        .then((res) => {
          console.log(res);
          setPOs(res);
          setTempPOs(res);
          setDataLoaded(true);
        })
        .catch((err) => {
          console.log(err);
          setDataLoaded(true);
        });
    } else {
      fetch(
        `${url}/purchaseOrders?pagesize=${pageSize}&page=${currentPage}&status=${searchStatus}`,
        {
          method: "GET",
          headers: {
            Authorization:
              "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
            token: token,
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setPOs(res?.data);
          setTempPOs(res?.data);
          setTotalPages(res?.totalPages);
          setDataLoaded(true);
        })
        .catch((err) => {
          setDataLoaded(true);
        });
    }
  }

  function createPaymentRequest(po) {
    setSubmitting(true);

    fetch(`${url}/purchaseOrders/paymentProgress/${po?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        let { totalPaymentVal, poVal } = res;

        let grossTotal = getPoTotalVal2(po);

        let purchaseOrderStillOpen = grossTotal?.grossTotal > totalPaymentVal;
        console.log(purchaseOrderStillOpen);

        (purchaseOrderStillOpen || poVal == -1) &&
          router.push(`/system/payment-requests/new/${po?._id}`);

        !purchaseOrderStillOpen && poVal !== -1 && setSubmitting(false);

        !purchaseOrderStillOpen &&
          poVal !== -1 &&
          message.error("Purchase order is fully paid!");
      })
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
      })
      .finally((err) => {});
  }

  function getPOs() {}

  function getMyPOs() {}

  function withdrawPOWarning() {
    return (
      <Modal
        title="Are you sure?"
        open={openWithdrawWarning}
        onOk={() => {
          setOpenWithdrawWarning(false);
        }}
        onCancel={() => {
          setOpenWithdrawWarning(false);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              // setOpenViewPO(false);
              setOpenWithdrawWarning(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger={true}
            loading={withdrawing}
            onClick={() => {
              handleWithdrawPo();
            }}
          >
            Yes, withdraw
          </Button>,
        ]}
      >
        Withdrawing this PO will inactivate indefinitely. You will need to
        create a new PO or select a different sourcing method from the related
        purchase request.
      </Modal>
    );
  }

  function cancelPOWarning() {
    return (
      <Modal
        title="Are you sure?"
        open={openTerminatingWarning}
        onOk={() => {
          setOpenTerminatingWarning(false);
        }}
        onCancel={() => {
          setOpenTerminatingWarning(false);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              // setOpenViewPO(false);
              setOpenTerminatingWarning(false);
            }}
          >
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger={true}
            loading={withdrawing}
            onClick={() => {
              handleTerminatePo();
            }}
          >
            Yes, terminate the PO
          </Button>,
        ]}
      >
        Terminatting this PO will inactivate indefinitely. You will need to
        create a new PO or select a different sourcing method from the related
        purchase request.
      </Modal>
    );
  }

  function viewPOMOdal() {
    return (
      <Modal
        title="Display Purchase Order"
        centered
        open={openViewPO}
        onOk={() => {
          setOpenViewPO(false);
        }}
        onCancel={() => setOpenViewPO(false)}
        footer={
          !readyToSign
            ? [
                // <Button key="back" onClick={() => setOpenViewPO(false)}>
                //   Cancel
                // </Button>,
                // <Button
                //   key="submit"
                //   type="primary"
                //   onClick={() => setOpenViewPO(false)}
                // >
                //   Ok
                // </Button>,
                po?.status !== "withdrawn" &&
                  !documentFullySigned(po) &&
                  !poFullyPaid &&
                  user?.permissions?.canApproveAsPM && (
                    // <Popconfirm
                    //   title="Are you sure? Withdrawing this PO will inactivate indefinitely. You will need to create a new PO or select a different sourcing method from the related purchase request."
                    //   onConfirm={handleWithdrawPo}
                    // >
                    <Button
                      key="submit"
                      type="primary"
                      danger={true}
                      loading={withdrawing}
                      onClick={() => setOpenWithdrawWarning(true)}
                    >
                      Withdraw
                    </Button>
                    // </Popconfirm>
                  ),

                // documentFullySigned(po) &&
                //   !poFullyPaid &&
                //   user?.permissions?.canApproveAsPM && (
                //     // <Popconfirm
                //     //   title="Are you sure? Withdrawing this PO will inactivate indefinitely. You will need to create a new PO or select a different sourcing method from the related purchase request."
                //     //   onConfirm={handleWithdrawPo}
                //     // >
                //     <Button
                //       key="submit"
                //       type="primary"
                //       danger={true}
                //       loading={withdrawing}
                //       onClick={() => setOpenCancellingWarning(true)}
                //     >
                //       Cancel PO
                //     </Button>
                //     // </Popconfirm>
                //   ),

                documentFullySigned(po) &&
                  !poFullyPaid &&
                  po?.status !== "terminated" &&
                  user?.permissions?.canApproveAsPM && (
                    // <Popconfirm
                    //   title="Are you sure? Withdrawing this PO will inactivate indefinitely. You will need to create a new PO or select a different sourcing method from the related purchase request."
                    //   onConfirm={handleWithdrawPo}
                    // >
                    <Button
                      key="submit"
                      type="primary"
                      danger={true}
                      loading={withdrawing}
                      onClick={() => setOpenTerminatingWarning(true)}
                    >
                      Terminate PO
                    </Button>
                    // </Popconfirm>
                  ),
              ]
            : []
        }
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <div className="space-y-10 px-20 py-5 overflow-x-scroll">
          <PrintPDF content={content} file={"PO"} />
          <div className="flex flex-row justify-between items-center">
            <Typography.Title level={4} className="flex flex-row items-center">
              PURCHASE ORDER #{po?.number}{" "}
            </Typography.Title>
            {/* <Button icon={<PrinterOutlined />}>Print</Button> */}
          </div>
          <div className="grid grid-cols-2 gap-5 ">
            <div className="flex flex-col ring-1 ring-gray-300 rounded p-5 space-y-3">
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Name</div>
                </Typography.Text>
                <Typography.Text strong>Irembo ltd</Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  Irembo Campass Nyarutarama KG 9 Ave
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>102911562</Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text strong>Sender</Typography.Text>
              </div>
            </div>

            <div className="flex flex-col ring-1 ring-gray-300 rounded p-5 space-y-3">
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Name</div>
                </Typography.Text>
                <Typography.Text strong>
                  {po?.vendor?.companyName}
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  {po?.vendor?.building}-{po?.vendor?.street}-
                  {po?.vendor?.avenue}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>{po?.vendor?.tin}</Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text strong>Receiver</Typography.Text>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-5">
            <Table
              size="small"
              dataSource={po?.items}
              columns={columns}
              pagination={false}
            />
            <Typography.Title level={5} className="self-end">
              Total (Tax Excl.):{" "}
              {po?.items[0]?.currency +
                " " +
                getPoTotalVal().totalVal?.toLocaleString()}{" "}
            </Typography.Title>
            <Typography.Title level={5} className="self-end">
              Tax:{" "}
              {po?.items[0]?.currency +
                " " +
                getPoTotalVal().totalTax?.toLocaleString()}
            </Typography.Title>
            <Typography.Title level={5} className="self-end">
              Gross Total:{" "}
              {po?.items[0]?.currency +
                " " +
                getPoTotalVal().grossTotal?.toLocaleString()}
            </Typography.Title>
            <Typography.Title level={3}>Details</Typography.Title>
            {po?.sections?.map((section) => {
              return (
                <>
                  <Typography.Title level={4}>{section.title}</Typography.Title>
                  <div>{parse(section?.body)}</div>
                </>
              );
            })}
          </div>

          {/* Signatories */}
          <div className="grid grid-cols-3 gap-5">
            {po?.signatories?.map((s, index) => {
              let yetToSign = po?.signatories?.filter((notS) => {
                return !notS.signed;
              });
              return (
                <div
                  key={s?.email}
                  className="flex flex-col ring-1 ring-gray-300 rounded pt-5 space-y-3 justify-between"
                >
                  <div className="px-5 flex flex-col space-y-6">
                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">On Behalf of</div>
                      </Typography.Text>
                      <Typography.Text strong>{s.onBehalfOf}</Typography.Text>
                    </div>

                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">Representative Title</div>
                      </Typography.Text>
                      <Typography.Text strong>{s.title}</Typography.Text>
                    </div>

                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">Company Representative</div>
                      </Typography.Text>
                      <Typography.Text strong>{s.names}</Typography.Text>
                    </div>

                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">Email</div>
                      </Typography.Text>
                      <Typography.Text strong>{s.email}</Typography.Text>
                    </div>

                    {s.signed && po?.status != "withdrawn" && (
                      <>
                        {!signing && (
                          <div className="flex flex-col">
                            <Typography.Text type="secondary">
                              <div className="text-xs">IP address</div>
                            </Typography.Text>
                            <Typography.Text strong>
                              {s?.ipAddress}
                            </Typography.Text>
                          </div>
                        )}
                        {signing && (
                          <Spin
                            indicator={
                              <LoadingOutlined
                                className="text-gray-500"
                                style={{ fontSize: 20 }}
                                spin
                              />
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                  {s?.signed && po?.status != "withdrawn" && (
                    <div className="flex flex-row justify-center space-x-10 items-center border-t-2 bg-blue-50 p-5">
                      <Image
                        width={40}
                        height={40}
                        src="/icons/icons8-signature-80.png"
                      />

                      {!signing && (
                        <div className="text-blue-500 flex flex-col">
                          <div className="text-lg">Signed digitally</div>
                          <div>
                            {moment(s.signedAt).format("DD MMM YYYY")} at
                          </div>
                          <div>
                            {moment(s.signedAt)
                              .tz("Africa/Kigali")
                              .format("h:mm a z")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(user?.email === s?.email || user?.tempEmail === s?.email) &&
                    !s?.signed &&
                    previousSignatorySigned(po?.signatories, index) &&
                    po?.status != "withdrawn" && (
                      <Popconfirm
                        title="Confirm Contract Signature"
                        onConfirm={() => handleSignPo(s, index)}
                        onOpenChange={() =>
                          setReadyToSign((prevState) => !prevState)
                        }
                      >
                        <div className="flex flex-row justify-center space-x-5 items-center border-t-2 bg-blue-50 p-5 cursor-pointer hover:opacity-75">
                          <Image
                            width={40}
                            height={40}
                            src="/icons/icons8-signature-80.png"
                          />

                          <div className="text-blue-400 text-lg">
                            It is your turn, sign with one click
                          </div>
                        </div>
                      </Popconfirm>
                    )}
                  {((user?.email !== s?.email &&
                    user?.tempEmail !== s?.email &&
                    !s.signed) ||
                    !previousSignatorySigned(po?.signatories, index)) &&
                    po?.status != "withdrawn" && (
                      <div className="flex flex-row justify-center space-x-5 items-center border-t-2 bg-gray-50 p-5">
                        <Image
                          width={40}
                          height={40}
                          src="/icons/icons8-signature-80-2.png"
                        />
                        <div className="text-gray-400 text-lg">
                          {s.signed
                            ? "Signed"
                            : `Waiting for ${yetToSign[0]?.names}'s signature`}
                        </div>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    );
  }

  function previousSignatorySigned(signatories, index) {
    let signed = index == 0 ? true : signatories[index - 1]?.signed;
    return signed;
  }

  function handleSignPo(signatory, index) {
    setSigning(true);

    fetch("https://api.ipify.org?format=json")
      .then((res) => getResultFromServer(res))
      .then((res) => {
        let myIpObj = "";
        signatory.signed = true;
        let _po = { ...po };
        myIpObj = res;
        signatory.ipAddress = res?.ip;
        signatory.signedAt = moment();

        _po.signatories[index] = signatory;
        setPO(_po);

        fetch(`${url}/purchaseOrders/${po?._id}`, {
          method: "PUT",
          headers: {
            Authorization:
              "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
            token: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPo: po,
            pending: po?.status === "pending-signature" || !po?.status,
            paritallySigned: documentFullySignedInternally(po),
            signed: documentFullySigned(po),
            signingIndex: index,
          }),
        })
          .then((res) => getResultFromServer(res))
          .then((res) => {
            setSigning(false);
            setSignatories([]);
            setSections([{ title: "Set section title", body: "" }]);
            // setPO(res);
          });
      })
      .catch((err) => {
        messageApi.error(
          "An error occured while trying to get your ip address. Please try again"
        );
      })
      .finally(() => {
        setSigning(false);
      });

    //call API to sign
  }

  function handleWithdrawPo() {
    setWithdrawing(true);

    let _po = { ...po };

    fetch(`${url}/purchaseOrders/status/${po?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "withdrawn",
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        _po.status = "withdrawn";
        setPO(_po);
        // setSignatories([]);
        // setSections([{ title: "Set section title", body: "" }]);
        // setPO(res);
        setOpenViewPO(false);
        setOpenWithdrawWarning(false);
        setWithdrawing(false);
        refresh();
      });
    //call API to sign
  }

  function handleTerminatePo() {
    setWithdrawing(true);

    let _po = { ...po };

    fetch(`${url}/purchaseOrders/status/${po?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: "terminated",
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        _po.status = "terminated";
        setPO(_po);
        // setSignatories([]);
        // setSections([{ title: "Set section title", body: "" }]);
        // setPO(res);
        setOpenViewPO(false);
        setOpenTerminatingWarning(false);
        setWithdrawing(false);
        refresh();
      });
    //call API to sign
  }

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

  function getPoTotalVal2(po) {
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

  function handleStartDelivery(po) {
    let _pos = [...pOs];
    // Find item index using _.findIndex (thanks @AJ Richardson for comment)
    var index = _.findIndex(_pos, { _id: po._id });
    let elindex = _pos[index];
    elindex.status = "starting";
    // Replace item at index using native splice
    _pos.splice(index, 1, elindex);

    setPOs(_pos);
    setTempPOs(_pos);

    fetch(`${url}/purchaseOrders/status/${po?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "started",
      }),
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        if (res?.error) {
          let _pos = [...pOs];
          // Find item index using _.findIndex (thanks @AJ Richardson for comment)
          var index = _.findIndex(_pos, { _id: po._id });
          let elindex = _pos[index];
          elindex.status = "pending";
          // Replace item at index using native splice
          _pos.splice(index, 1, elindex);

          setPOs(_pos);
          setTempPOs(_pos);
        } else {
          let _pos = [...pOs];
          // Find item index using _.findIndex (thanks @AJ Richardson for comment)
          var index = _.findIndex(_pos, { _id: po._id });
          let elindex = _pos[index];
          elindex.status = "started";
          // Replace item at index using native splice
          _pos.splice(index, 1, elindex);

          setPOs(_pos);
          setTempPOs(_pos);
        }
      });
  }

  function documentFullySigned(document) {
    let totSignatories = document?.signatories;
    let signatures = document?.signatories?.filter((s) => s.signed);

    return totSignatories?.length === signatures?.length;
  }

  function documentFullySignedInternally(document) {
    let totIntenalSignatories = document?.signatories?.filter(
      (s) => s.onBehalfOf === "Irembo Ltd"
    );
    let signatures = document?.signatories?.filter(
      (s) => s.signed && s.onBehalfOf === "Irembo Ltd"
    );

    return totIntenalSignatories?.length === signatures?.length;
  }

  function previewAttachmentModal() {
    // return (
    //   <Modal
    //     title="Attachment view"
    //     centered
    //     open={previewAttachment}
    //     onOk={() => setPreviewAttachment(false)}
    //     onCancel={() => setPreviewAttachment(false)}
    //     width={"60%"}
    //     // bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
    //   >
    //     <div>
    //       <MyPdfViewer fileUrl={`${url}/file/${attachmentId}`} />
    //     </div>
    //   </Modal>
    // );
  }

  const handleItemClick = (value) => {
    setActiveIndex((prevIndex) => (prevIndex === value ? "" : value));
  };

  const content = () => {
    return (
      <div className="space-y-5 p-3 overflow-x-scroll bg-white mx-11 my-10 shadow-md">
        <div className="flex flex-row justify-between items-center">
          <Typography.Title level={4} className="flex flex-row items-center">
            PURCHASE ORDER #{po?.number}{" "}
          </Typography.Title>
          {/* <Button icon={<PrinterOutlined />}>Print</Button> */}
        </div>
        <div className="grid grid-cols-2 gap-5 ">
          <div className="flex flex-col ring-1 ring-gray-300 rounded p-5 space-y-3">
            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Company Name</div>
              </Typography.Text>
              <Typography.Text strong>Irembo ltd</Typography.Text>
            </div>

            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Company Address</div>
              </Typography.Text>
              <Typography.Text strong>
                Irembo Campass Nyarutarama KG 9 Ave
              </Typography.Text>
            </div>

            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Company TIN no.</div>
              </Typography.Text>
              <Typography.Text strong>102911562</Typography.Text>
            </div>

            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Hereinafter refferd to as</div>
              </Typography.Text>
              <Typography.Text strong>Sender</Typography.Text>
            </div>
          </div>

          <div className="flex flex-col ring-1 ring-gray-300 rounded p-5 space-y-3">
            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Company Name</div>
              </Typography.Text>
              <Typography.Text strong>
                {po?.vendor?.companyName}
              </Typography.Text>
            </div>

            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Company Address</div>
              </Typography.Text>
              <Typography.Text strong>
                {po?.vendor?.building}-{po?.vendor?.street}-{po?.vendor?.avenue}
              </Typography.Text>
            </div>
            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Company TIN no.</div>
              </Typography.Text>
              <Typography.Text strong>{po?.vendor?.tin}</Typography.Text>
            </div>
            <div className="flex flex-col">
              <Typography.Text type="secondary">
                <div className="text-xs">Hereinafter refferd to as</div>
              </Typography.Text>
              <Typography.Text strong>Receiver</Typography.Text>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-5">
          <Table
            size="small"
            dataSource={po?.items}
            columns={columns}
            pagination={false}
          />
          <Typography.Title level={5} className="self-end">
            Total (Tax Excl.):{" "}
            {po?.items[0]?.currency +
              " " +
              getPoTotalVal().totalVal?.toLocaleString()}{" "}
          </Typography.Title>
          <Typography.Title level={5} className="self-end">
            Tax:{" "}
            {po?.items[0]?.currency +
              " " +
              getPoTotalVal().totalTax?.toLocaleString()}
          </Typography.Title>
          <Typography.Title level={5} className="self-end">
            Gross Total:{" "}
            {po?.items[0]?.currency +
              " " +
              getPoTotalVal().grossTotal?.toLocaleString()}
          </Typography.Title>
          <Typography.Title level={3}>Details</Typography.Title>
          {po?.sections?.map((section) => {
            return (
              <>
                <Typography.Title level={4}>{section.title}</Typography.Title>
                <div>{parse(section?.body)}</div>
              </>
            );
          })}
        </div>

        {/* Signatories */}
        <div className="grid grid-cols-3 gap-5">
          {po?.signatories?.map((s, index) => {
            let yetToSign = po?.signatories?.filter((notS) => {
              return !notS.signed;
            });
            return (
              <div
                key={s?.email}
                className="flex flex-col ring-1 ring-gray-300 rounded pt-5 space-y-3 justify-between"
              >
                <div className="px-5 flex flex-col space-y-6">
                  <div className="flex flex-col">
                    <Typography.Text type="secondary">
                      <div className="text-xs">On Behalf of</div>
                    </Typography.Text>
                    <Typography.Text strong>{s.onBehalfOf}</Typography.Text>
                  </div>

                  <div className="flex flex-col">
                    <Typography.Text type="secondary">
                      <div className="text-xs">Representative Title</div>
                    </Typography.Text>
                    <Typography.Text strong>{s.title}</Typography.Text>
                  </div>

                  <div className="flex flex-col">
                    <Typography.Text type="secondary">
                      <div className="text-xs">Company Representative</div>
                    </Typography.Text>
                    <Typography.Text strong>{s.names}</Typography.Text>
                  </div>

                  <div className="flex flex-col">
                    <Typography.Text type="secondary">
                      <div className="text-xs">Email</div>
                    </Typography.Text>
                    <Typography.Text strong>{s.email}</Typography.Text>
                  </div>

                  {s.signed && (
                    <>
                      {!signing && (
                        <div className="flex flex-col">
                          <Typography.Text type="secondary">
                            <div className="text-xs">IP address</div>
                          </Typography.Text>
                          <Typography.Text strong>
                            {s?.ipAddress}
                          </Typography.Text>
                        </div>
                      )}
                      {signing && (
                        <Spin
                          indicator={
                            <LoadingOutlined
                              className="text-gray-500"
                              style={{ fontSize: 20 }}
                              spin
                            />
                          }
                        />
                      )}
                    </>
                  )}
                </div>
                {s?.signed && (
                  <div className="flex flex-row justify-center space-x-10 items-center border-t-2 bg-blue-50 p-5">
                    <Image
                      width={40}
                      height={40}
                      src="/icons/icons8-signature-80.png"
                    />

                    {!signing && (
                      <div className="text-blue-500 flex flex-col">
                        <div className="text-lg">Signed digitally</div>
                        <div>{moment(s.signedAt).format("DD MMM YYYY")} at</div>
                        <div>
                          {moment(s.signedAt)
                            .tz("Africa/Kigali")
                            .format("h:mm a z")}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(user?.email === s?.email || user?.tempEmail === s?.email) &&
                  !s?.signed &&
                  previousSignatorySigned(po?.signatories, index) && (
                    <Popconfirm
                      title="Confirm Contract Signature"
                      onConfirm={() => handleSignPo(s, index)}
                      onOpenChange={() =>
                        setReadyToSign((prevState) => !prevState)
                      }
                    >
                      <div className="flex flex-row justify-center space-x-5 items-center border-t-2 bg-blue-50 p-5 cursor-pointer hover:opacity-75">
                        <Image
                          width={40}
                          height={40}
                          src="/icons/icons8-signature-80.png"
                        />

                        <div className="text-blue-400 text-lg">
                          It is your turn, sign with one click
                        </div>
                      </div>
                    </Popconfirm>
                  )}
                {((user?.email !== s?.email &&
                  user?.tempEmail !== s?.email &&
                  !s.signed) ||
                  !previousSignatorySigned(po?.signatories, index)) && (
                  <div className="flex flex-row justify-center space-x-5 items-center border-t-2 bg-gray-50 p-5">
                    <Image
                      width={40}
                      height={40}
                      src="/icons/icons8-signature-80-2.png"
                    />
                    <div className="text-gray-400 text-lg">
                      {s.signed
                        ? "Signed"
                        : `Waiting for ${yetToSign[0]?.names}'s signature`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/purchase-orders/&sessionExpired=true`);
    } else {
      return res.json();
    }
  }

  const getData = () => {
    let filtered = (tempPOs && tempPOs) || [];

    // if (searchStatus !== "all") {
    //   if (searchStatus === "pending-signature")
    //     filtered =
    //       tempPOs &&
    //       tempPOs.filter((item) => item.status == searchStatus || !item.status);
    //   else if (searchStatus === "signed")
    //     filtered =
    //       tempPOs &&
    //       tempPOs.filter(
    //         (item) => item.status == "started" || item.status == "signed"
    //       );
    //   else
    //     filtered =
    //       tempPOs && tempPOs.filter((item) => item.status == searchStatus);
    // }

    return { length: filtered.length, data: filtered };
  };

  return (
    <>
      {isMobile && <NotificationComponent />}
      {contextHolder}
      {dataLoaded && !submitting ? (
        <div className="flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-6 mt-6 h-screen pb-10 px-4">
          {viewPOMOdal()}
          {withdrawPOWarning()}
          {cancelPOWarning()}

          {previewAttachmentModal()}
          {/* <Row className="flex flex-col custom-sticky space-y-2 bg-white px-10 py-3 shadow">
            <div className="flex flex-row justify-between items-center">
              <div className="text-xl font-semibold">Purchase Orders List</div>
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
                    {
                      value: "pending-signature",
                      label: "Pending Signature",
                    },
                    {
                      value: "partially-signed",
                      label: "Paritally Signed",
                    },
                    {
                      value: "signed",
                      label: "Signed",
                    },
                  ]}
                />
              </div>
              <div className="z-0">
                <Input.Search
                  style={{ width: "300px" }}
                  autoFocus
                  onChange={(e) => {
                    setSearchText(e?.target?.value);
                  }}
                  placeholder="Search by po#, vendor name"
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
                className="text-[14px] text-[#2c6ad6] w-48 rounded-sm"
                placeholder="Select status"
                onChange={(value) => {
                  setCurrentPage(1);
                  setSearchStatus(value);
                }}
                value={searchStatus}
                options={[
                  { value: "all", label: "All" },
                  {
                    value: "pending-signature",
                    label: "Pending Signature",
                  },
                  {
                    value: "partially-signed",
                    label: "Paritally Signed",
                  },
                  {
                    value: "signed",
                    label: "Signed",
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

          <div className="request lg:mr-6 bg-white h-[calc(100vh-170px)] rounded-lg mb-10 px-5 overflow-y-auto">
            <div className="flex justify-between items-center space-x-10 mb-5">
              <h4 className="text-[19px] text-[#344767]">
                Purchase Orders List
              </h4>
              <div className="flex items-center gap-5">
                <div className="flex items-center rounded-lg bg-[#F5F7FA] p-1.5">
                  <FiSearch size={18} className="text-[#E4E4E4] ml-2" />
                  <Input
                    className="border-0 text-[#8392AB] bg-transparent text-[15px] hover:bg-transparent hover:border-none hover:outline-none"
                    onChange={(e) => {
                      setSearchText(e?.target?.value);
                    }}
                    placeholder="Search by po#, vendor name"
                  />
                  {/* <Input.Search
                      style={{ width: "300px" }}
                      autoFocus
                      onChange={(e) => {
                        setSearchText(e?.target?.value);
                      }}
                      placeholder="Search by request#, initiator"
                    /> */}
                  <div></div>
                </div>
              </div>
            </div>
            {(getData()?.length < 1 || !getData()) && <Empty />}

            {getData() &&
              getData()?.length >= 1 &&
              getData()?.data?.map((po, key) => {
                let t = 0;
                let gross = getPoTotalVal2(po).grossTotal?.toLocaleString();
                return (
                  <div className="my-5">
                    <button
                      className={`cursor-pointer w-full pr-5 pt-3 -pb-4 flex justify-evenly items-center border-b-0 border-[#f5f2f2] border-t border-x-0 ${
                        activeIndex == key ? "bg-[#F1F3FF]" : "bg-transparent"
                      }`}
                      onClick={() => handleItemClick(key)}
                    >
                      <div className="flex flex-1 items-center justify-between gap-4 my-3">
                        <button
                          disabled={
                            user?.userType === "VENDOR" &&
                            !documentFullySignedInternally(po)
                          }
                          onClick={() => {
                            setPO(po);
                            setOpenViewPO(true);
                          }}
                          className="font-semibold cursor-pointer space-x-1 flex flex-row items-center text-blue-500 hover:underline border-none bg-transparent"
                        >
                          <div>
                            <FileTextOutlined className="text-xs" />
                          </div>
                          <div className="capitalize text-[14px] text-[#1677FF]">
                            {po?.number}
                          </div>
                        </button>
                        {user?.userType !== "VENDOR" && (
                          <div className="flex flex-col items-start gap-2">
                            <small className="text-[10px] text-[#353531]">
                              Vendor
                            </small>

                            <p className="text-[#344767] font-medium text-[14px] py-0 my-0">
                              {!po?.vendor?.companyName
                                ? "Not Specified"
                                : po?.vendor?.companyName.length > 9
                                ? po?.vendor?.companyName.slice(0, 8) + "..."
                                : po?.vendor?.companyName}
                            </p>
                          </div>
                        )}
                        <div className="flex flex-col items-start gap-2">
                          <small className="text-[10px] text-[#353531]">
                            Total Value
                          </small>
                          <p className="text-[#344767] font-medium text-[14px] py-0 my-0">
                            {/* {po?.items?.map((i) => {
                              let lTot = i?.quantity * i?.estimatedUnitCost;
                              t = t + lTot;
                            })}{" "}
                            {t.toLocaleString()} {po?.items[0]?.currency} */}
                            {gross}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-2">
                          <small className="text-[10px] text-[#353531]">
                            Created At
                          </small>
                          <p className="text-[#344767] font-medium text-[14px] py-0 my-0">
                            {(po?.createdAt &&
                              moment(po?.createdAt).format(
                                "DD - MMM - YYYY"
                              )) ||
                              (po?.updatedAt &&
                                moment(po?.updatedAt).format(
                                  "DD - MMM - YYYY"
                                )) ||
                              (po?.request?.createdAt &&
                                moment(po?.request?.createdAt).format(
                                  "DD - MMM - YYYY"
                                ))}
                          </p>
                        </div>
                        {documentFullySigned(po) &&
                          (po?.status == "signed" ||
                            po?.status == "started") && (
                            <div>
                              <div className="bg-[#D2FBD0] rounded-xl text-[#0D4A26] text-[14px] font-medium px-3 py-1">
                                Signed
                              </div>
                            </div>
                          )}

                        {(!documentFullySigned(po) ||
                          (po?.status !== "signed" &&
                            po?.status !== "started")) && (
                          <div>
                            <Tooltip placement="top" title={po?.status}>
                              {/* <IoCheckmarkOutline className="text-[#00CE82]" /> */}
                              <div
                                className={`
                              ${
                                po?.status == "withdrawn" ||
                                po?.status == "cancelled" ||
                                po?.status == "terminated" ||
                                po?.status == "archived"
                                  ? "bg-[#ef554d]"
                                  : po?.status == "signed" ||
                                    po?.status == "started"
                                  ? "bg-[#71d054]"
                                  : "bg-[#F9BB01]"
                              } 
                              capitalize rounded-xl text-[#FFF] text-[14px] font-medium px-3 py-1`}
                              >
                                {po?.status?.length > 8
                                  ? (po?.status?.slice(0, 5) + "..").toString()
                                  : po?.status || "Pending"}
                              </div>
                            </Tooltip>
                          </div>
                        )}

                        <button
                          disabled={
                            !documentFullySigned(po) ||
                            (po?.status !== "signed" &&
                              po?.status !== "started")
                          }
                          className={`${
                            !documentFullySigned(po) ||
                            (po?.status !== "signed" &&
                              po?.status !== "started")
                              ? `bg-gray-50 text-gray-400`
                              : `bg-[#1677FF] text-white cursor-pointer`
                          } border-none px-3 py-2 rounded-lg text-[13px] font-semibold`}
                          onClick={() => createPaymentRequest(po)}
                        >
                          Request Payment
                        </button>
                      </div>
                      <RiArrowDropDownLine
                        className={`text-[36px] text-[#344767] arrow ml-10 ${
                          activeIndex == key ? "active" : ""
                        }`}
                      />
                    </button>
                    <div
                      ref={contentHeight}
                      className="answer-container mt-3 -mb-[21px] px-8 rounded-lg"
                      style={
                        activeIndex == key
                          ? {
                              display: "flex",
                              flexDirection: "column",
                              borderWidth: 2,
                              borderStyle: "solid",
                              borderColor: "#F1F3FF",
                              background: "#FDFEFF",
                            }
                          : { display: "none" }
                      }
                    >
                      <div className="py-5 flex justify-between">
                        <div className="flex flex-col gap-5">
                          <small className="text-[12px] text-[#353531]">
                            Related Links
                          </small>
                          {(po?.tender?.purchaseRequest?.number ||
                            po?.request?.number) &&
                            user?.userType !== "VENDOR" && (
                              <Link
                                onClick={() => setSubmitting(true)}
                                alt=""
                                href={`/system/requests/${
                                  po?.tender?.purchaseRequest?._id ||
                                  po?.request?._id
                                }`}
                                className="text-[13px] flex items-center gap-3 no-underline text-[#1677FF]"
                              >
                                <FaLink />
                                Check Request
                              </Link>
                            )}
                          {po?.reqAttachmentDocId && (
                            <Link
                              href={`${fendUrl}/api?folder=reqAttachments&name=${po?.reqAttachmentDocId}.pdf`}
                              target="_blank"
                              className="text-[13px] flex items-center gap-3 no-underline text-[#1677FF]"
                            >
                              <IoLink />
                              Reference Docs
                            </Link>
                          )}
                        </div>
                        <div className="flex flex-col gap-5">
                          <small className="text-[12px] text-[#353531]">
                            Vendor Details
                          </small>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <LuUser className="text-[#8392AB]" />
                              {/* {po?.vendor?.companyName} */}
                              <small className="text-[#455A64] text-[13px] font-medium">
                                {po?.vendor?.companyName || "-"}
                              </small>
                            </div>
                            <div className="flex items-center gap-3">
                              <LuHash className="text-[#8392AB]" />
                              {/* {po?.vendor?.tin} */}
                              <small className="text-[#455A64] text-[13px] font-medium">
                                {po?.vendor?.tin || "-"}
                              </small>
                            </div>
                            <div className="flex items-center gap-3">
                              <BiEnvelope className="text-[#8392AB]" />
                              {/* {po?.vendor?.companyEmail} */}
                              <small className="text-[#455A64] text-[13px] font-medium">
                                {po?.vendor?.email || "-"}
                              </small>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-5">
                          <small className="text-[12px] text-[#353531]">
                            Signatories
                          </small>
                          {user?.userType !== "VENDOR" && (
                            <div className="flex flex-col gap-3">
                              {po?.signatories?.map((s) => {
                                return (
                                  <div
                                    key={s?.email}
                                    className="flex items-center gap-3"
                                  >
                                    {s?.signed ? (
                                      <Tooltip
                                        placement="top"
                                        title={`signed: ${moment(
                                          s?.signedAt
                                        ).format("DD MMM YYYY")} at ${moment(
                                          s?.signedAt
                                        )
                                          .tz("Africa/Kigali")
                                          .format("h:mm a z")}`}
                                      >
                                        <IoCheckmarkOutline className="text-[#00CE82]" />
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Signature still pending">
                                        <span>
                                          <RiForbidLine className="text-[#F5365C]" />
                                        </span>
                                      </Tooltip>
                                    )}
                                    {/* <small className="text-[#455A64] text-[13px] font-semibold">
                                      {s?.names}
                                    </small> */}
                                    <div className="bg-[#F1F3FF] py-1 px-3 rounded-xl text-[11px] font-medium text-[#353531]">
                                      {s?.names || s?.title}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-5">
                          <small className="text-[12px] text-[#353531]">
                            SAP B1 References
                          </small>
                          <div className="text-gray-600">
                            {po?.referenceDocs?.map((ref, i) => {
                              return <Tag key={i}>{ref}</Tag>;
                            })}
                          </div>
                        </div>
                        <div className="flex flex-col gap-5">
                          <small className="text-[12px] text-[#353531]">
                            Delivery Status
                          </small>
                          <Progress
                            percent={_.round(po?.deliveryProgress, 1)}
                            size="small"
                            status="active"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            <div className="flex w-full justify-end">
              <Pagination
                pageSizeOptions={[5, 10, 20, 30, 50, 75, 100]}
                showSizeChanger
                defaultCurrent={currentPage}
                onShowSizeChange={(page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                }}
                onChange={(page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                }}
                pageSize={pageSize}
                total={totalPages}
              />
            </div>
          </div>
        </div>
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
