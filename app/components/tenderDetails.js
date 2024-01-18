"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import parse from "html-react-parser";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  RectangleStackIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Statistic,
  Tabs,
  Tag,
  message,
  List,
  Typography,
  Modal,
  Table,
  Divider,
  Popover,
  Popconfirm,
  Switch,
  Tooltip,
} from "antd";
import {
  CloseCircleOutlined,
  CloseOutlined,
  DislikeOutlined,
  EditOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  LikeOutlined,
  LoadingOutlined,
  PlusOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import moment from "moment-timezone";
import BidList from "./bidList";
import Image from "next/image";
import ItemsTable from "./itemsTableB1";
import UploadBidDoc from "./uploadBidDoc";
import { v4 } from "uuid";
import { encode } from "base-64";
import {
  CalendarDaysIcon,
  CheckIcon,
  LockClosedIcon,
  LockOpenIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { AiOutlineFileSync } from "react-icons/ai";
import UploadTenderDoc from "./uploadTenderDoc";
// import MyPdfViewer from "./pdfViewer";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import MyDocument from "./MyDocument";

let modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link"],
    ["clean"],
  ],
};

let formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
];

const TenderDetails = ({
  data,
  handleUpdateStatus,
  loading,
  handleCreateSubmission,
  handleClose,
  handleRefreshData,
  handleCreatePO,
  handleSendInvitation,
  user,
  handleSendEvalApproval,
}) => {
  const [form] = Form.useForm();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
  const [messageApi, contextHolder] = message.useMessage();
  const [size, setSize] = useState("small");
  const [currentCode, setCurrentCode] = useState(-1);
  let [deadLine, setDeadLine] = useState(null);
  let [proposalUrls, setProposalUrls] = useState([""]);
  let [deliveryDate, setDeliveryDate] = useState(null);
  let [price, setPrice] = useState(0);
  let [warranty, setWarranty] = useState(0);
  let [discount, setDiscount] = useState(0);
  let [comment, setComment] = useState("");
  let [currency, setCurrency] = useState("RWF");
  let [iSubmitted, setISubmitted] = useState(false);
  let [checkingSubmission, setCheckingSubmission] = useState(false);
  let [refresh, setRefresh] = useState(1);
  let [bidList, setBidList] = useState(null);
  let [poCreated, setPoCreated] = useState(false);
  let [contractCreated, setContractCreated] = useState(false);
  let [po, setPO] = useState(null);
  let [contract, setContract] = useState(null);
  let [openCreatePO, setOpenCreatePO] = useState(false);
  let [openViewPO, setOpenViewPO] = useState(false);

  let [users, setUsers] = useState([]);

  let [openCreateContract, setOpenCreateContract] = useState(false);
  let [openViewContract, setOpenViewContract] = useState(false);
  let [selectionComitee, setSelectionComitee] = useState([]);
  let [contractStartDate, setContractStartDate] = useState(null);
  let [contractEndDate, setContractEndDate] = useState(null);

  let [vendor, setVendor] = useState("");
  let [tendor, setTendor] = useState("");
  let [paymentTerms, setPaymentTerms] = useState("");
  let [items, setItems] = useState(null);
  let tot = 0;
  let [totalVal, setTotVal] = useState(0);
  let [totalTax, setTotTax] = useState(0);
  let [grossTotal, setGrossTotal] = useState(0);
  let [warrantyDuration, setWarrantyDuration] = useState("months");
  let [sectionTitle, setSectionTitle] = useState("Section 1: ");
  let [sections, setSections] = useState([
    { title: "Set section title", body: "" },
  ]);

  const itemColumns =
    user?.userType !== "VENDOR"
      ? [
          {
            title: "Item title",
            dataIndex: "title",
            key: "title",
            render: (_, item) => (
              <>
                <Typography.Text className="flex flex-row items-center space-x-2">
                  <div>{item.title}</div>{" "}
                </Typography.Text>
              </>
            ),
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
              <>
                {item?.currency +
                  (item?.estimatedUnitCost * 1).toLocaleString()}
              </>
            ),
          },

          {
            title: "Total Amount",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (_, item) => (
              <>
                {item.currency +
                  (item?.quantity * item?.estimatedUnitCost).toLocaleString()}
              </>
            ),
          },
          {
            title: "Supporting docs",
            dataIndex: "supportingDocs",
            key: "supportingDocs",
            render: (_, item) => (
              <div className="flex flex-col">
                {item?.paths?.map((p, i) => {
                  return (
                    <div key={p}>
                      <Link
                        href={`${url}/file/termsOfReference/${p}`}
                        target="_blank"
                      >
                        <Typography.Link className="flex flex-row items-center space-x-2">
                          <div>supporting doc{i + 1} </div>{" "}
                          <div>
                            <PaperClipIcon className="h-4 w-4" />
                          </div>
                        </Typography.Link>
                      </Link>
                    </div>
                  );
                })}
                {(item?.paths?.length < 1 || !item?.paths) && (
                  <div className="items-center justify-center flex flex-col">
                    <div>
                      <RectangleStackIcon className="h-5 w-5 text-gray-200" />
                    </div>
                    <div className="text-xs text-gray-400">No docs found</div>
                  </div>
                )}
              </div>
            ),
          },
        ]
      : [
          {
            title: "Item title",
            dataIndex: "title",
            key: "title",
            render: (_, item) => (
              <>
                <Typography.Text className="flex flex-row items-center space-x-2">
                  <div>{item.title}</div>{" "}
                </Typography.Text>
              </>
            ),
          },
          {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            render: (_, item) => <>{(item?.quantity).toLocaleString()}</>,
          },
          {
            title: "Supporting docs",
            dataIndex: "supportingDocs",
            key: "supportingDocs",
            render: (_, item) => (
              <div className="flex flex-col">
                {item?.paths?.map((p, i) => {
                  return (
                    <div key={p}>
                      <Link
                        href={`${url}/file/termsOfReference/${p}`}
                        target="_blank"
                      >
                        <Typography.Link className="flex flex-row items-center space-x-2">
                          <div>supporting doc{i + 1} </div>{" "}
                          <div>
                            <PaperClipIcon className="h-4 w-4" />
                          </div>
                        </Typography.Link>
                      </Link>
                    </div>
                  );
                })}
                {(item?.paths?.length < 1 || !item?.paths) && (
                  <div className="items-center justify-center flex flex-col">
                    <div>
                      <RectangleStackIcon className="h-5 w-5 text-gray-200" />
                    </div>
                    <div className="text-xs text-gray-400">No docs found</div>
                  </div>
                )}
              </div>
            ),
          },
        ];
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
      render: (_, item) => <>{(item?.estimatedUnitCost).toLocaleString()}</>,
    },
    {
      title: "Total Amount (Rwf)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, item) => (
        <>{(item?.quantity * item?.estimatedUnitCost).toLocaleString()}</>
      ),
    },
  ];
  const [signatories, setSignatories] = useState([]);
  const [docDate, setDocDate] = useState(moment());
  const [docType, setDocType] = useState("dDocument_Service");
  const [bankName, setBankName] = useState("BK");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [signing, setSigning] = useState(false);

  const [previewAttachment, setPreviewAttachment] = useState(false);
  const [attachmentId, setAttachmentId] = useState("");
  const [proposalDocId, setProposalDocId] = useState(v4());
  const [otherDocId, setOtherDocId] = useState(v4());
  const [editContract, setEditContract] = useState(
    user?.permissions?.canEditContracts
  );
  const [assets, setAssets] = useState([]);
  const [assetList, setAssetList] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [creatingPo, setCreatingPo] = useState(false);
  const [proposalSelected, setProposalSelected] = useState(false);
  const [otherDocSelected, setOtherDocSelected] = useState(false);
  const [extending, setExtending] = useState(false);
  const [submittingExtensionRe, setSubmittingExtension] = useState(false);

  useEffect(() => {
    let statusCode = getRequestStatusCode(data?.status);
    setCurrentCode(1);
    setItems(data?.purchaseRequest?.items);
    getUsers();
    if (data) checkSubmission();
    updateBidList();
    setProposalDocId(v4());
    setOtherDocId(v4());
    setDeadLine(moment(data?.submissionDeadLine));
    getFixedAssets();
  }, [data]);

  useEffect(() => {
    let t = 0;
    let tax = 0;
    items?.map((i) => {
      t = t + i?.quantity * i?.estimatedUnitCost;
      if (i.taxGroup === "I1")
        tax = tax + (i?.quantity * i?.estimatedUnitCost * 18) / 100;
    });

    setTotVal(t);
    setTotTax(tax);
    setGrossTotal(t + tax);

    updateBidList();
  }, [items]);

  useEffect(() => {
    let list = [];
    assets.map((alist) => {
      alist.map((a) => {
        list.push(a);
      });
    });
  }, [assets]);

  useEffect(() => {
    if (openViewContract) {
      setSections(contract?.sections);
      setSignatories(contract?.signatories);
    }
  }, [openViewContract]);

  useEffect(() => {
    if (editContract) {
    }
  }, [editContract]);

  function handleCreateContract(
    vendor,
    tender,
    createdBy,
    sections,
    contractStartDate,
    contractEndDate,
    signatories,
    request
  ) {
    fetch(`${url}/contracts/`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendor,
        tender,
        createdBy,
        sections,
        contractStartDate,
        contractEndDate,
        signatories,
        request,
      }),
    })
      .then((res) => res.json())
      .then((res1) => {
        setSignatories([]);
        setSections([{ title: "Set section title", body: "" }]);
        updateBidList();
      })
      .catch((err) => {
        console.error(err);
        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

  function handleUpdateContract(sections, signatories) {
    let _contract = { ...contract };
    _contract.sections = sections;
    _contract.signatories = signatories;
    _contract.status = "pending-signature";

    fetch(`${url}/contracts/${contract?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newContract: _contract,
        previousStatus: contract?.status,
        signingIndex: 0,
      }),
    })
      .then((res) => res.json())
      .then((res1) => {
        setSignatories([]);
        setSections([{ title: "Set section title", body: "" }]);
        setEditContract(false);
        updateBidList();
      })
      .catch((err) => {
        console.error(err);
        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

  function getUsers() {
    fetch(`${url}/users/internal`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((body) => {
        setUsers(body);
      })
      .catch((err) => {
        messageApi.error({
          content: "Could not fetch users!",
        });
      });
  }

  function getFixedAssets() {
    fetch(`${url}/b1/fixedAssets`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((body) => {
        if (body?.error) {
          messageApi.error({
            content: body?.error?.message?.value,
          });
        } else {
          let value = body?.value;
          let assetOptions = value?.map((v) => {
            return {
              value: v?.ItemCode,
              label: v?.ItemName,
            };
          });
          setAssetOptions(assetOptions);
        }
      })
      .catch((err) => {
        messageApi.error({
          content: "Could not fetch users!",
        });
      });
  }

  const updateBidList = () => {
    fetch(`${url}/submissions/byTender/${data?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((body) => {
        setBidList(body);
        checkPOCreated();
        checkContractCreated();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const checkPOCreated = () => {
    fetch(`${url}/purchaseOrders/byTenderId/${data?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setPO(res[0]);
        if (res.length >= 1) setPoCreated(true);
        else setPoCreated(false);
      });
  };

  const checkContractCreated = () => {
    fetch(`${url}/contracts/byTenderId/${data?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setContract(res[0]);
        if (res.length >= 1) setContractCreated(true);
        else setContractCreated(false);
      });
  };

  function checkSubmission() {
    setCheckingSubmission(true);
    fetch(`${url}/submissions/submitted/${data?._id}?vendorId=${user?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setISubmitted(res);
        setCheckingSubmission(false);
      })
      .catch((err) => {
        setCheckingSubmission(false);
        setISubmitted(true);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function getRequestStatus(code) {
    if (code === 0) return "verified";
    else if (code === 1) return "approved (hod)";
    else if (code === 2) return "approved (fd)";
    else if (code === 3) return "approved (pm)";
    else return "pending for approval";
  }

  function getRequestStatusCode(status) {
    if (status === "verified") return 0;
    else if (status === "approved (hod)") return 1;
    else if (status === "approved (fd)") return 2;
    else if (status === "approved (pm)") return 3;
    else return 0;
  }

  function changeStatus(statusCode) {
    setCurrentCode(statusCode);
    handleUpdateStatus(data?._id, getRequestStatus(statusCode));
  }

  function createSubmission(submissionData) {
    handleCreateSubmission(submissionData);
  }

  function submitSubmissionData() {
    let subData = {
      proposalUrls,
      deliveryDate,
      price,
      currency,
      warranty,
      discount,
      status: "pending",
      comment,
      createdBy: user?._id,
      tender: data._id,
      warrantyDuration,
      bankName,
      bankAccountNumber,
      bankAccountName,
      proposalDocId: proposalSelected ? proposalDocId : null,
      otherDocId: otherDocSelected ? otherDocId : null,
    };
    createSubmission(subData);
  }

  function handleSelectBid(bidId, evaluationReportId) {
    fetch(`${url}/submissions/select/${bidId}?tenderId=${data._id}`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        evaluationReportId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        handleUpdateStatus(data._id, "bidSelected");
        setRefresh(refresh + 1);
      });
  }

  function handleAwardBid(bidId) {
    fetch(`${url}/submissions/award/${bidId}?tenderId=${data._id}`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        handleUpdateStatus(data._id, "bidAwarded");
        setRefresh(refresh + 1);
      });
  }

  function sendInvitation() {
    let _data = data;
    _data.invitees = selectionComitee.map((s) => {
      return {
        approver: s,
        approved: false,
      };
    });
    _data.invitationSent = true;

    handleSendInvitation(_data);
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

  function iBelongToEvaluators() {
    let approvers = data?.invitees;
    return approvers?.filter((a) => a.approver === user?.email)?.length >= 1;
  }

  function iHaveApprovedEvalReport() {
    let approvers = data?.invitees;
    return (
      approvers?.filter((a) => a.approver === user?.email && a.approved)
        ?.length >= 1
    );
  }

  function previousSignatorySigned(signatories, index) {
    let signed = index == 0 ? true : signatories[index - 1]?.signed;
    return signed;
  }

  const buildBankDetailsForm = (
    <div className="">
      <div className="font-semibold mb-4">Banking details</div>
      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <div className="flex flex-col">
            <div>Bank Name</div>
            <Form.Item name="bankName" noStyle>
              <Input
                required
                placeholder="ABCX Bank"
                style={{ width: "100%" }}
                onChange={(v) => {
                  setBankName(v.target.value);
                }}
              />
            </Form.Item>
          </div>
        </div>

        <div>
          <div className="flex flex-col">
            <div>Bank Account Name</div>
            <Form.Item name="bankAccountName" noStyle>
              <Input
                required
                placeholder="John Doe"
                style={{ width: "100%" }}
                onChange={(v) => {
                  setBankAccountName(v.target.value);
                }}
              />
            </Form.Item>
          </div>
        </div>

        <div>
          <div className="flex flex-col">
            <div>Account Number</div>
            <Form.Item name="bankAccountNumber" noStyle>
              <Input
                required
                placeholder="1892-0092-0900"
                style={{ width: "100%" }}
                onChange={(v) => {
                  setBankAccountNumber(v.target.value);
                }}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    </div>
  );

  const buildSubmissionForm = (
    <div className="">
      <Typography.Title className="pb-4" level={5}>
        Bid Overview
      </Typography.Title>
      <div className="grid md:grid-cols-2 gap-5 ">
        <div className="flex flex-col">
          <div>Delivery date</div>
          <Form.Item
            name="deliveryDate"
            // label="Delivery date"
            className="w-full"
            rules={[
              {
                required: true,
                message: "Delivery Date is required",
              },
            ]}
          >
            <DatePicker
              className="w-full"
              onChange={(value) => setDeliveryDate(value)}
              disabledDate={(current) =>
                current.isBefore(moment().subtract(1, "d"))
              }
            />
          </Form.Item>
        </div>

        <div className="flex flex-col">
          <div>Total Bid Amount</div>
          <Form.Item>
            <Form.Item
              name="price"
              noStyle
              rules={[
                {
                  required: true,
                  message: "Total bid amount is required",
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
                        {
                          value: "GBP",
                          label: "GBP",
                          key: "GBP",
                        },
                      ]}
                    ></Select>
                  </Form.Item>
                }
                onChange={(value) => setPrice(value)}
              />
            </Form.Item>
          </Form.Item>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="flex flex-col">
          <div>Warranty (where applicable)</div>
          <Form.Item name="warranty" noStyle>
            <InputNumber
              style={{ width: "100%" }}
              addonBefore={
                <Form.Item noStyle name="warrantyDuration">
                  <Select
                    onChange={(value) => setWarrantyDuration(value)}
                    defaultValue="months"
                    options={[
                      {
                        value: "days",
                        label: "Days",
                      },
                      {
                        value: "months",
                        label: "Months",
                      },
                      {
                        value: "years",
                        label: "Years",
                      },
                    ]}
                  ></Select>
                </Form.Item>
              }
              onChange={(value) => setWarranty(value)}
            />
          </Form.Item>
        </div>

        <div className="flex flex-col">
          <div>Discount (%)</div>
          <Form.Item name="discount">
            <InputNumber
              style={{ width: "100%" }}
              onChange={(value) => setDiscount(value)}
            />
          </Form.Item>
        </div>
      </div>

      {buildBankDetailsForm}

      <Typography.Title className="pb-4" level={5}>
        Supporting Documents
      </Typography.Title>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="grid grid-cols-2">
          <div className="flex flex-col">
            <div>My proposal</div>
            <Form.Item
              name="proposal"
              rules={[
                {
                  validator: (_, value) =>
                    proposalSelected
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Should attach the proposal document")
                        ),
                },
              ]}
            >
              <UploadBidDoc
                uuid={proposalDocId}
                setSelected={setProposalSelected}
              />
            </Form.Item>
          </div>

          <div className="flex flex-col">
            <div>Other documents</div>
            <Form.Item name="otherDocs">
              <UploadBidDoc
                uuid={otherDocId}
                setSelected={setOtherDocSelected}
              />
            </Form.Item>
          </div>
        </div>
        <div className="flex flex-col">
          <div>Any additional comments</div>
          <Form.Item name="comment">
            <Input.TextArea onChange={(e) => setComment(e.target.value)} />
          </Form.Item>
        </div>
      </div>
    </div>
  );

  function createPOMOdal() {
    return (
      <Modal
        title="New Purchase Order"
        centered
        open={openCreatePO}
        confirmLoading={creatingPo}
        onOk={async () => {
          setCreatingPo(true);
          let assetItems = [];
          let nonAssetItems = [];
          let docCurrency = (items && items[0]?.currency) || "RWF";

          items
            .filter((i) => i.itemType === "asset")
            .map((i, index) => {
              i?.assetCodes?.map((a) => {
                assetItems.push({
                  ItemCode: a,
                  Quantity: i.quantity / i?.assetCodes?.length,
                  UnitPrice: i.estimatedUnitCost,
                  VatGroup: i.taxGroup ? i.taxGroup : "X1",
                  Currency: i.currency ? i.currency : "RWF",
                });
              });
            });

          items
            .filter((i) => i.itemType === "non-asset" || !i.itemType)
            .map((i, index) => {
              nonAssetItems.push({
                // ItemCode: a,
                Quantity: i.quantity,
                UnitPrice: i.estimatedUnitCost,
                VatGroup: i.taxGroup ? i.taxGroup : "X1",
                Currency: i.currency ? i.currency : "RWF",
              });
            });

          // if (docType === "dDocument_Item") {
          //   items.map((i, index) => {
          //     assets[index]?.map((a) => {
          //       assetItems.push({
          //         ItemCode: a,
          //         Quantity: i.quantity / assets[index]?.length,
          //         UnitPrice: i.estimatedUnitCost,
          //         VatGroup: i.taxGroup ? i.taxGroup : "X1",
          // Currency: i.currency ? i.currency : "RWF"
          //       });
          //     });
          //   });
          // }
          let B1Data_Assets;
          assetItems?.length >= 1
            ? (B1Data_Assets = {
                CardName: vendor?.companyName,
                DocType: "dDocument_Item",
                DocDate: docDate,
                DocumentLines: assetItems,
                DocCurrency: docCurrency,
              })
            : (B1Data_Assets = null);

          let B1Data_NonAssets;
          nonAssetItems?.length >= 1
            ? (B1Data_NonAssets = {
                CardName: vendor?.companyName,
                DocType: "dDocument_Service",
                DocDate: docDate,
                DocumentLines: nonAssetItems,
                DocCurrency: docCurrency,
              })
            : (B1Data_NonAssets = null);

          if (!signatories || signatories?.length < 3) {
            messageApi.open({
              type: "error",
              content:
                "PO can not be submitted. Please specify at least 3 signatories!",
            });
            setCreatingPo(false);
          } else if (
            items?.filter(
              (i) =>
                i.quantity <= 0 ||
                // i.estimatedUnitCost <= 0 ||
                !i.quantity
              // ||
              // !i.estimatedUnitCost
            )?.length >= 1
          ) {
            messageApi.open({
              type: "error",
              content: "PO can not be created. Please specify Quantity/Price!",
            });
            setCreatingPo(false);
          } else if (
            signatories?.filter((s) => {
              return !s?.onBehalfOf || !s?.title || !s?.names || !s?.email;
            })?.length >= 1
          ) {
            messageApi.open({
              type: "error",
              content:
                "PO can not be submitted. Please fill in the relevant signatories' details!",
            });
            setCreatingPo(false);
          } else {
            await handleCreatePO(
              vendor?._id,
              tendor?._id,
              user?._id,
              sections,
              items,
              {
                B1Data_Assets,
                B1Data_NonAssets,
              },
              signatories
            );
            setCreatingPo(false);
            setOpenCreatePO(false);
          }
        }}
        okText="Save and Submit"
        onCancel={() => setOpenCreatePO(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        {contextHolder}
        <div className="space-y-5 px-20 py-5">
          <Typography.Title level={4}>
            PURCHASE ORDER: {vendor?.companyName}
          </Typography.Title>
          {/* header */}
          <div className="grid grid-cols-2 w-1/2">
            {/* PO Document date */}
            {/* <div>
              <div>Document date</div>
              <DatePicker onChange={(v, dstr) => setDocDate(dstr)} />
            </div> */}

            {/* PO type */}
            {/* <div>
              <div>PO Type</div>
              <Select
                onChange={(value) => setDocType(value)}
                defaultValue="dDocument_Service"
                options={[
                  { value: "dDocument_Service", label: "Service" },
                  { value: "dDocument_Item", label: "Item" },
                ]}
              />
            </div> */}
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-5">
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
                <Typography.Text strong>{vendor?.companyName}</Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  {vendor?.building}-{vendor?.street}-{vendor?.avenue}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>{vendor?.tin}</Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text strong>Receiver</Typography.Text>
              </div>
            </div>
          </div>

          {/* PO Details */}
          {items?.length >= 1 && (
            <div className="flex flex-col space-y-5">
              {docType === "dDocument_Item" && (
                <div className="flex flex-col">
                  <Typography.Title level={4}>
                    Asset assignment
                  </Typography.Title>
                  ∏
                  <div className="p-5 rounded ring-1 ring-gray-200 grid md:grid-cols-3 gap-2">
                    {items?.map((i, index) => {
                      return (
                        <div key={i?.key}>
                          Select asset(s) for {i?.title}
                          <div>
                            <Select
                              mode="tags"
                              showArrow
                              style={{ width: "100%" }}
                              onChange={(value) => {
                                let _v = [...assets];
                                _v[index] = value;
                                setAssets(_v);
                              }}
                              options={assetOptions}
                              showSearch
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <ItemsTable
                dataSource={items}
                setDataSource={setItems}
                assetOptions={assetOptions}
              />
              <Typography.Title level={5} className="self-end">
                Total (Tax Excl.):{" "}
                {items[0]?.currency + " " + totalVal?.toLocaleString()}
              </Typography.Title>
              <Typography.Title level={5} className="self-end">
                Total Tax:{" "}
                {items[0]?.currency + " " + totalTax?.toLocaleString()}
              </Typography.Title>
              <Typography.Title level={4} className="self-end">
                Gross Total:{" "}
                {items[0]?.currency + " " + grossTotal?.toLocaleString()}
              </Typography.Title>

              {/* Sections */}
              <div className="flex flex-col space-y-5">
                <Typography.Title level={4}>Contents</Typography.Title>

                {sections.map((s, index) => {
                  let section = sections[index]
                    ? sections[index]
                    : { title: "", body: "" };
                  let _sections = [...sections];
                  return (
                    <>
                      <div className="flex flex-row justify-between items-center">
                        <Typography.Title
                          level={5}
                          editable={{
                            onChange: (e) => {
                              section.title = e;
                              _sections[index]
                                ? (_sections[index] = section)
                                : _sections.push(section);
                              setSections(_sections);
                            },
                            text: s.title,
                          }}
                        >
                          {s.title}
                        </Typography.Title>
                        <Popconfirm
                          onConfirm={() => {
                            let _sections = [...sections];
                            _sections.splice(index, 1);
                            setSections(_sections);
                          }}
                          title="You can not undo this!"
                        >
                          <div>
                            <CloseCircleOutlined className="h-3 text-red-400 cursor-pointer" />
                          </div>
                        </Popconfirm>
                      </div>
                      <ReactQuill
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        onChange={(value) => {
                          section.body = value;
                          _sections[index]
                            ? (_sections[index] = section)
                            : _sections.push(section);
                          setSections(_sections);
                        }}
                      />
                    </>
                  );
                })}

                <Button
                  icon={<PlusOutlined />}
                  onClick={() => {
                    let _sections = [...sections];
                    _sections.push({
                      title: `Set section ${sections?.length + 1} Title`,
                      body: "",
                    });
                    setSections(_sections);
                  }}
                >
                  Add section
                </Button>
              </div>

              {/* Signatories */}
              <div className="grid grid-cols-3 gap-5">
                {signatories.map((s, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-col ring-1 ring-gray-300 rounded py-5"
                    >
                      <div className="flex flex-row items-start justify-between">
                        <div className="flex flex-col space-y-3 px-5">
                          <div className="flex flex-col space-y-1">
                            <Typography.Text type="secondary">
                              <div className="text-xs">On Behalf of</div>
                            </Typography.Text>
                            <Typography.Text
                              editable={{
                                text: s.onBehalfOf,
                                onChange: (e) => {
                                  let _signatories = [...signatories];
                                  _signatories[index].onBehalfOf = e;
                                  setSignatories(_signatories);
                                },
                              }}
                            >
                              {s.onBehalfOf}
                            </Typography.Text>
                          </div>

                          <div className="flex flex-col space-y-1">
                            <Typography.Text type="secondary">
                              <div className="text-xs">
                                Representative Title
                              </div>
                            </Typography.Text>
                            <Typography.Text
                              editable={{
                                text: s.title,
                                onChange: (e) => {
                                  let _signatories = [...signatories];
                                  _signatories[index].title = e;
                                  setSignatories(_signatories);
                                },
                              }}
                            >
                              {s.title}
                            </Typography.Text>
                          </div>

                          <div className="flex flex-col space-y-1">
                            <Typography.Text type="secondary">
                              <div className="text-xs">
                                Company Representative
                              </div>
                            </Typography.Text>
                            <Typography.Text
                              editable={{
                                text: s.names,
                                onChange: (e) => {
                                  let _signatories = [...signatories];
                                  _signatories[index].names = e;
                                  setSignatories(_signatories);
                                },
                              }}
                            >
                              {s.names}
                            </Typography.Text>
                          </div>

                          <div className="flex flex-col space-y-1">
                            <Typography.Text type="secondary">
                              <div className="text-xs">Email</div>
                            </Typography.Text>
                            <Typography.Text
                              editable={{
                                text: s.email,
                                onChange: (e) => {
                                  let _signatories = [...signatories];
                                  _signatories[index].email = e;
                                  setSignatories(_signatories);
                                },
                              }}
                            >
                              {s.email}
                            </Typography.Text>
                          </div>
                        </div>
                        <div
                          onClick={() => {
                            let _signatories = [...signatories];
                            _signatories.splice(index, 1);
                            setSignatories(_signatories);
                          }}
                        >
                          <XMarkIcon className="h-3 px-5 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {/* New Signatory */}
                <div
                  onClick={() => {
                    let signs = [...signatories];
                    let newSignatory =
                      signs?.length <= 1
                        ? { onBehalfOf: "Irembo Ltd" }
                        : {
                            onBehalfOf: vendor?.companyName,
                            title: vendor?.title,
                            names: vendor?.contactPersonNames,
                            email: vendor?.email,
                          };

                    signs.push(newSignatory);
                    setSignatories(signs);
                  }}
                  className="flex flex-col ring-1 ring-gray-300 rounded pt-5 space-y-3 items-center justify-center cursor-pointer hover:bg-gray-50"
                >
                  <Image
                    src="/icons/icons8-signature-80.png"
                    width={40}
                    height={40}
                  />
                  <div>Add new Signatory</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  }

  function createContractMOdal() {
    return (
      <Modal
        title="New Contract"
        centered
        open={openCreateContract}
        onOk={() => {
          if (!signatories || signatories?.length < 2) {
            messageApi.open({
              type: "error",
              content:
                "Contract can not be submitted. Please specify at least 2 signatories!",
            });
          } else if (
            signatories?.filter((s) => {
              return !s?.onBehalfOf || !s?.title || !s?.names || !s?.email;
            })?.length >= 1
          ) {
            messageApi.open({
              type: "error",
              content:
                "Contract can not be submitted. Please fill in the relevant signatories' details!",
            });
          } else if (
            signatories?.filter((s) => {
              return !s?.onBehalfOf.includes("Irembo");
            })?.length < 1
          ) {
            messageApi.open({
              type: "error",
              content:
                "Contract can not be submitted. Please supply the Vendor's information!",
            });
          } else if (!contractStartDate || !contractEndDate) {
            messageApi.open({
              type: "error",
              content:
                "Contract can not be submitted. Please set start and end dates!",
            });
          } else {
            handleCreateContract(
              vendor?._id,
              tendor?._id,
              user?._id,
              sections,
              contractStartDate,
              contractEndDate,
              signatories,
              tendor?.purchaseRequest?._id
            );
            setOpenCreateContract(false);
          }
        }}
        okText="Submit for review"
        onCancel={() => setOpenCreateContract(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <div className="space-y-10 px-20 py-5">
          {contextHolder}
          <Typography.Title level={4}>
            CONTRACTOR: {vendor?.companyName}
          </Typography.Title>
          <div className="grid grid-cols-2 w-1/2">
            <div>
              <div>Contract validity</div>
              <DatePicker.RangePicker
                onChange={(v, dates) => {
                  setContractStartDate(dates[0]);
                  setContractEndDate(dates[1]);
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
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
                <Typography.Text strong>{vendor?.companyName}</Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  {vendor?.hqAddress}-{vendor?.country}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>{vendor?.tin}</Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text strong>Receiver</Typography.Text>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="flex flex-col space-y-5">
            <Typography.Title level={4}>Contents</Typography.Title>

            {sections.map((s, index) => {
              let section = sections[index]
                ? sections[index]
                : { title: "", body: "" };
              let _sections = [...sections];
              return (
                <>
                  <div className="flex flex-row justify-between items-center">
                    <Typography.Title
                      level={5}
                      editable={{
                        onChange: (e) => {
                          section.title = e;
                          _sections[index]
                            ? (_sections[index] = section)
                            : _sections.push(section);
                          setSections(_sections);
                        },
                        text: s.title,
                      }}
                    >
                      {s.title}
                    </Typography.Title>
                    <Popconfirm
                      onConfirm={() => {
                        let _sections = [...sections];
                        _sections.splice(index, 1);
                        setSections(_sections);
                      }}
                      title="You can not undo this!"
                    >
                      <div>
                        <CloseCircleOutlined className="h-3 text-red-400 cursor-pointer" />
                      </div>
                    </Popconfirm>
                  </div>
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    formats={formats}
                    onChange={(value) => {
                      section.body = value;
                      _sections[index]
                        ? (_sections[index] = section)
                        : _sections.push(section);
                      setSections(_sections);
                    }}
                  />
                </>
              );
            })}

            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                let _sections = [...sections];
                _sections.push({
                  title: `Set section ${sections?.length + 1} Title`,
                  body: "",
                });
                setSections(_sections);
              }}
            >
              Add section
            </Button>
          </div>
          {/* Initiator and Reviewers */}
          {/* <div className="grid grid-cols-3 gap-5">
            <div className="flex flex-col ring-1 ring-gray-300 rounded py-5 space-y-3">
              <div className="px-5">
                <Typography.Text type="secondary">Initiated by</Typography.Text>
                <div className="flex flex-col">
                  <Typography.Text strong>
                    e.manirakiza@irembo.com
                  </Typography.Text>
                </div>
              </div>
            </div>

            <div className="flex flex-col ring-1 ring-gray-300 rounded py-5 space-y-3">
              <div className="px-5">
                <Typography.Text type="secondary">Reviewed by</Typography.Text>
                <div className="flex flex-col">
                  <Typography.Text strong>{user?.email}</Typography.Text>
                </div>
              </div>
            </div>
          </div> */}

          {/* Signatories */}
          <div className="grid grid-cols-3 gap-5">
            {signatories.map((s, index) => {
              return (
                <div
                  key={index}
                  className="flex flex-col ring-1 ring-gray-300 rounded py-5"
                >
                  <div className="flex flex-row items-start justify-between">
                    <div className="flex flex-col space-y-3 px-5">
                      <div className="flex flex-col space-y-1">
                        <Typography.Text type="secondary">
                          <div className="text-xs">On Behalf of</div>
                        </Typography.Text>
                        <Typography.Text
                          editable={{
                            text: s.onBehalfOf,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].onBehalfOf = e;
                              setSignatories(_signatories);
                            },
                          }}
                        >
                          {s.onBehalfOf}
                        </Typography.Text>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <Typography.Text type="secondary">
                          <div className="text-xs">Representative Title</div>
                        </Typography.Text>
                        <Typography.Text
                          editable={{
                            text: s.title,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].title = e;
                              setSignatories(_signatories);
                            },
                          }}
                        >
                          {s.title}
                        </Typography.Text>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <Typography.Text type="secondary">
                          <div className="text-xs">Company Representative</div>
                        </Typography.Text>
                        <Typography.Text
                          editable={{
                            text: s.names,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].names = e;
                              setSignatories(_signatories);
                            },
                          }}
                        >
                          {s.names}
                        </Typography.Text>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <Typography.Text type="secondary">
                          <div className="text-xs">Email</div>
                        </Typography.Text>
                        <Typography.Text
                          editable={{
                            text: s.email,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].email = e;
                              setSignatories(_signatories);
                            },
                          }}
                        >
                          {s.email}
                        </Typography.Text>
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        let _signatories = [...signatories];
                        _signatories.splice(index, 1);
                        setSignatories(_signatories);
                      }}
                    >
                      <XMarkIcon className="h-3 px-5 cursor-pointer" />
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-col ring-1 ring-gray-300 rounded py-5 space-y-3 items-center justify-center  hover:bg-gray-50">
              <Image
                src="/icons/icons8-signature-80.png"
                width={40}
                height={40}
              />
              <div
                className="cursor-pointer underline hover:text-blue-600"
                onClick={() => {
                  let signs = [...signatories];
                  let newSignatory = { onBehalfOf: "Irembo Ltd" };
                  // signs?.length < 2
                  //   ?
                  //   : {
                  //       onBehalfOf: vendor?.companyName,
                  //       title: vendor?.title,
                  //       names: vendor?.contactPersonNames,
                  //       email: vendor?.email,
                  //     };
                  signs.push(newSignatory);
                  setSignatories(signs);
                }}
              >
                Add intenal Signatory
              </div>
              <div
                className="cursor-pointer underline"
                onClick={() => {
                  let signs = [...signatories];
                  let newSignatory = {
                    onBehalfOf: vendor?.companyName,
                    title: vendor?.title,
                    names: vendor?.contactPersonNames,
                    email: vendor?.email,
                  };

                  signs.push(newSignatory);
                  setSignatories(signs);
                }}
              >
                Add external Signatory
              </div>
            </div>
          </div>
        </div>
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
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <div className="space-y-10 px-20 py-5 overflow-x-scroll">
          <div>
            {/* <PDFDownloadLink document={<MyDocument title={`PURCHASE ORDER: ${po?.vendor?.companyName}`}/>} fileName="test.pdf">
              {({loading, error }) => {
                // error ? alert(JSON.stringify(error)) : "";
                return loading ? "Loading document..." : "Download now!";
              }}
            </PDFDownloadLink> */}
          </div>
          <div className="flex flex-row justify-between items-center">
            <Typography.Title level={4} className="flex flex-row items-center">
              PURCHASE ORDER: {po?.vendor?.companyName}{" "}
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

                      <div className="text-blue-500 flex flex-col">
                        <div className="text-lg">Signed digitally</div>
                        <div>{moment(s.signedAt).format("DD MMM YYYY")} at</div>
                        <div>
                          {moment(s.signedAt)
                            .tz("Africa/Kigali")
                            .format("h:mm a z")}
                        </div>
                      </div>
                    </div>
                  )}

                  {(user?.email === s?.email || user?.tempEmail === s?.email) &&
                    !s?.signed &&
                    previousSignatorySigned(po?.signatories, index) && (
                      <Popconfirm
                        title="Confirm Contract Signature"
                        onConfirm={() => handleSignPo(s, index)}
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
      </Modal>
    );
  }

  function viewContractMOdal() {
    return (
      <Modal
        title="Display Contract"
        centered
        open={openViewContract}
        onOk={() => {
          editContract &&
            contract?.status === "draft" &&
            handleUpdateContract(sections, signatories);
          setOpenViewContract(false);
        }}
        okText={
          editContract && contract?.status === "draft"
            ? "Save and Send contract"
            : "Ok"
        }
        onCancel={() => setOpenViewContract(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <div className="space-y-10 px-20 py-5 overflow-x-scroll">
          {/* Header */}
          <div className="flex flex-row justify-between items-center">
            <Typography.Title level={4} className="flex flex-row items-center">
              <div>
                CONTRACTOR: {contract?.vendor?.companyName}{" "}
                <div>
                  <Popover
                    placement="topLeft"
                    content={`${moment(contract?.startDate).format(
                      "YYYY-MMM-DD"
                    )} - ${moment(contract?.endDate).format("YYYY-MMM-DD")}`}
                  >
                    <div className="text-xs font-thin text-gray-500">
                      Expires in {moment(contract?.endDate).fromNow()}
                    </div>
                  </Popover>
                </div>
              </div>
            </Typography.Title>
            {/* {contract?.status !== "draft" && (
              <Button icon={<PrinterOutlined />}>Print</Button>
            )} */}
            {contract?.status === "draft" &&
              user?.permissions?.canEditContracts && (
                <Switch
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren={<EyeOutlined />}
                  defaultChecked={editContract}
                  onChange={(checked) => setEditContract(checked)}
                />
              )}
          </div>
          {/* Parties */}
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
                  {contract?.vendor?.companyName}
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  {contract?.vendor?.hqAddress}-{contract?.vendor?.country}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>
                  {contract?.vendor?.tin}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text strong>Receiver</Typography.Text>
              </div>
            </div>
          </div>
          {/* Details */}
          <div className="flex flex-col space-y-5">
            <Typography.Title level={3}>Details</Typography.Title>
            {sections?.map((s, index) => {
              let section = sections[index]
                ? sections[index]
                : { title: "", body: "" };
              let _sections = [...sections];
              return (
                <>
                  <div className="flex flex-row justify-between items-center">
                    <Typography.Title
                      level={4}
                      editable={
                        editContract &&
                        contract?.status === "draft" && {
                          onChange: (e) => {
                            section.title = e;
                            _sections[index]
                              ? (_sections[index] = section)
                              : _sections.push(section);
                            setSections(_sections);
                          },
                          text: s.title,
                        }
                      }
                    >
                      {s.title}
                    </Typography.Title>
                    {editContract && contract?.status === "draft" && (
                      <Popconfirm
                        onConfirm={() => {
                          let _sections = [...sections];
                          _sections.splice(index, 1);
                          setSections(_sections);
                        }}
                        title="You can not undo this!"
                      >
                        <div>
                          <CloseCircleOutlined className="h-3 text-red-400 cursor-pointer" />
                        </div>
                      </Popconfirm>
                    )}
                  </div>
                  {(!editContract || contract?.status) !== "draft" && (
                    <div>{parse(s?.body)}</div>
                  )}
                  {editContract && contract?.status === "draft" && (
                    <ReactQuill
                      theme="snow"
                      modules={modules}
                      formats={formats}
                      value={s.body}
                      onChange={(value) => {
                        section.body = value;
                        _sections[index]
                          ? (_sections[index] = section)
                          : _sections.push(section);
                        setSections(_sections);
                      }}
                    />
                  )}
                </>
              );
            })}
            {editContract && contract?.status === "draft" && (
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  let _sections = [...sections];
                  _sections.push({
                    title: `Set section ${sections?.length + 1} Title`,
                    body: "",
                  });
                  setSections(_sections);
                }}
              >
                Add section
              </Button>
            )}
          </div>
          {/* Signatories */}
          <div className="grid grid-cols-3 gap-5">
            {signatories?.map((s, index) => {
              let yetToSign = signatories?.filter((notS) => {
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
                      <Typography.Text
                        strong
                        editable={
                          editContract &&
                          contract?.status === "draft" && {
                            text: s.onBehalfOf,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].onBehalfOf = e;
                              setSignatories(_signatories);
                            },
                          }
                        }
                      >
                        {s.onBehalfOf}
                      </Typography.Text>
                    </div>

                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">Representative Title</div>
                      </Typography.Text>
                      <Typography.Text
                        strong
                        editable={
                          editContract &&
                          contract?.status === "draft" && {
                            text: s.title,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].title = e;
                              setSignatories(_signatories);
                            },
                          }
                        }
                      >
                        {s.title}
                      </Typography.Text>
                    </div>

                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">Company Representative</div>
                      </Typography.Text>
                      <Typography.Text
                        strong
                        editable={
                          editContract &&
                          contract?.status === "draft" && {
                            text: s.names,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].names = e;
                              setSignatories(_signatories);
                            },
                          }
                        }
                      >
                        {s.names}
                      </Typography.Text>
                    </div>

                    <div className="flex flex-col">
                      <Typography.Text type="secondary">
                        <div className="text-xs">Email</div>
                      </Typography.Text>
                      <Typography.Text
                        strong
                        editable={
                          editContract &&
                          contract?.status === "draft" && {
                            text: s.email,
                            onChange: (e) => {
                              let _signatories = [...signatories];
                              _signatories[index].email = e;
                              setSignatories(_signatories);
                            },
                          }
                        }
                      >
                        {s.email}
                      </Typography.Text>
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

                      <div className="text-blue-500 flex flex-col">
                        <div className="text-lg">Signed digitally</div>
                        <div>{moment(s.signedAt).format("DD MMM YYYY")} at</div>
                        <div>
                          {moment(s.signedAt)
                            .tz("Africa/Kigali")
                            .format("h:mm a z")}
                        </div>
                      </div>
                    </div>
                  )}

                  {(user?.email === s?.email || user?.tempEmail === s?.email) &&
                    !s?.signed &&
                    previousSignatorySigned(signatories, index) &&
                    contract?.status !== "draft" && (
                      <Popconfirm
                        title="Confirm Contract Signature"
                        onConfirm={() => handleSignContract(s, index)}
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
                    !previousSignatorySigned(signatories, index) ||
                    contract?.status == "draft") && (
                    <div className="flex flex-row justify-center space-x-5 items-center border-t-2 bg-gray-50 p-5">
                      <Image
                        width={40}
                        height={40}
                        src="/icons/icons8-signature-80-2.png"
                      />
                      <div className="text-gray-400 text-lg">
                        {s.signed
                          ? "Signed"
                          : contract?.status === "draft"
                          ? "Waiting for Legal's review"
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

  function extendSubmissionDadeline() {
    setExtending(true);
  }

  function submitExtensionRequest() {
    setSubmittingExtension(true);
    let newTender = { ...data };
    newTender.submissionDeadLine = deadLine;

    // alert(JSON.stringify(newTender))

    fetch(`${url}/tenders/${newTender._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newTender }),
    })
      .then((res) => res.json())
      .then((res) => {
        let statusCode = getRequestStatusCode(data?.status);
        setCurrentCode(1);
        setItems(data?.purchaseRequest?.items);
        getUsers();
        if (data) checkSubmission();
        updateBidList();
        setProposalDocId(v4());
        setOtherDocId(v4());
        getFixedAssets();

        setSubmittingExtension(false);
        setExtending(false);
      });
  }

  function buildTabHeader() {
    return (
      <div className="flex flex-col space-y-5">
        <div className="grid grid-cols-5 items-start">
          <div className="flex flex-col items-start">
            <div className="text-xs font-semibold ml-3 text-gray-400">
              Tender Number
            </div>
            <div className="text-sm font-semibold ml-3 text-gray-600">
              {data?.number}
            </div>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-xs font-semibold ml-3 text-gray-400">
              Service category
            </div>
            <div className="text-sm font-semibold ml-3 text-gray-600">
              {data?.purchaseRequest?.serviceCategory}
            </div>
          </div>

          <div className="flex flex-col items-start">
            <div className="text-xs font-semibold ml-3 text-gray-400">
              Due date
            </div>
            <div className="text-sm font-semibold ml-3 text-gray-600">
              {moment(data?.dueDate).format("YYYY-MMM-DD")}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <div>
              <Link
                href={`${url}/file/tenderDocs/${data?.docId}.pdf`}
                target="_blank"
              >
                <Typography.Link>
                  <FileTextOutlined /> Tender document
                </Typography.Link>
              </Link>
            </div>

            {user?.permissions?.canApproveAsPM &&
              moment().isBefore(moment(data?.submissionDeadLine)) &&
              data?.status === "open" &&
              !iSubmitted &&
              bidList?.length < 1 && (
                <div className="flex flex-row space-x-1 items-center">
                  <UploadTenderDoc
                    iconOnly={true}
                    uuid={data?.docId}
                    setTendeDocSelected={() => {}}
                    setStatus={() => {}}
                    label="Update the doc"
                  />
                  {/* <div className="text-sm text-blue-500">
                  Update tender document
                </div> */}
                </div>
              )}
          </div>

          <div className="flex flex-col space-y-2 items-start">
            <div className="flex flex-row space-x-3">
              {!extending &&
                (submittingExtensionRe ? (
                  <Spin size="small" />
                ) : (
                  <Statistic.Countdown
                    title="Deadline (days:hrs:min:sec)"
                    className="text-xs text-gray-500"
                    // valueStyle={{ fontSize: "0.75rem", lineHeight: "1rem" }}
                    format="DD:HH:mm:ss"
                    value={moment(deadLine)}
                  />
                ))}

              {extending && (
                <DatePicker
                  format="YYYY-MM-DD HH:mm"
                  showTime
                  showNow={false}
                  disabledDate={(current) =>
                    current.isBefore(moment().subtract(1, "d"))
                  }
                  onChange={(v, str) => {
                    // console.log(moment(str).toISOString());
                    setDeadLine(moment(str).toISOString());
                  }}
                />
              )}

              {user?.permissions?.canEditTenders &&
                !extending &&
                data?.status !== "bidSelected" &&
                data?.status !== "bidAwarded" && (
                  <div>
                    <Tooltip title="Extend submission deadline">
                      <div
                        onClick={extendSubmissionDadeline}
                        className="p-2 rounded ring-1 ring-red-300 shadow-md flex items-center text-red-500 justify-center cursor-pointer active:shadow-sm active:text-red-300"
                      >
                        <CalendarDaysIcon className="h-4 w-4  " />
                      </div>
                    </Tooltip>
                  </div>
                )}

              {user?.permissions?.canEditTenders && extending && (
                <div className="flex flex-row space-x-1">
                  <div>
                    <Popconfirm
                      title="Are you sure?"
                      onConfirm={() => {
                        submitExtensionRequest();
                        // setExtending(false);
                      }}
                    >
                      <div
                        onClick={extendSubmissionDadeline}
                        className="p-2 rounded ring-1 ring-green-300 shadow-md flex items-center text-green-500 justify-center cursor-pointer active:shadow-sm active:text-green-300"
                      >
                        <CheckIcon className="h-4 w-4  " />
                      </div>
                    </Popconfirm>
                  </div>
                  <div>
                    <div
                      onClick={() => setExtending(false)}
                      className="p-2 rounded ring-1 ring-red-300 shadow-md flex items-center text-red-500 justify-center cursor-pointer active:shadow-sm active:text-red-300"
                    >
                      <CloseOutlined className="h-4 w-4  " />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {user?.userType !== "VENDOR" && (
              <Tag color="magenta">
                {iSubmitted
                  ? "submitted"
                  : moment().isAfter(moment(data?.submissionDeadLine))
                  ? "closed"
                  : data?.status}
              </Tag>
            )}
          </div>
        </div>
      </div>
    );
  }

  function getPoTotalVal() {
    let t = 0;
    let tax = 0;
    po?.items.map((i) => {
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

  function handleSignContract(signatory, index) {
    setSigning(true);

    fetch("https://api.ipify.org?format=json")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw Error("");
        }
      })
      .then((res) => {
        let myIpObj = "";
        signatory.signed = true;
        let _contract = { ...contract };
        myIpObj = res;
        signatory.ipAddress = res?.ip;
        signatory.signedAt = moment();
        _contract.signatories[index] = signatory;
        // setContract(_contract);

        fetch(`${url}/contracts/${contract?._id}`, {
          method: "PUT",
          headers: {
            Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
            token: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newContract: contract,
            pending: contract?.status === "pending-signature",
            paritallySigned: documentFullySignedInternally(contract),
            signed: documentFullySigned(contract),
          }),
        })
          .then((res) => res.json())
          .then((res) => {
            // setSignatories([]);
            // setSections([{ title: "Set section title", body: "" }]);
            setContract(res);
            updateBidList();
            setSigning(false);
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

  function handleSignPo(signatory, index) {
    setSigning(true);

    fetch("https://api.ipify.org?format=json")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          throw Error("");
        }
      })
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
            Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
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
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              throw Error("");
            }
          })
          .then((res) => {
            setSigning(false);
            setSignatories([]);
            setSections([{ title: "Set section title", body: "" }]);
            setPO(res);
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

  return (
    <div className="flex flex-col ring-1 ring-gray-200 p-3 rounded shadow-md bg-white">
      <contextHolder />
      <div className="flex flex-row justify-between items-start">
        <div className="flex-1 ">
          <Tabs defaultActiveKey="1" type="card" size={size}>
            <Tabs.TabPane tab="Overview" key="1">
              {data ? (
                <Spin
                  spinning={loading || checkingSubmission}
                  indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
                >
                  <div className="overflow-x-auto p-3 flex flex-col space-y-10">
                    {/* TItle */}
                    {buildTabHeader()}

                    <div className="">
                      <Table
                        size="small"
                        dataSource={data.items}
                        columns={itemColumns}
                        bordered
                        pagination={false}
                      />
                    </div>

                    {user?.userType === "VENDOR" &&
                      moment().isBefore(moment(data?.submissionDeadLine)) &&
                      data?.status === "open" &&
                      !iSubmitted && (
                        <>
                          <Form form={form} onFinish={submitSubmissionData}>
                            <div className="ml-3 mt-5 items-center">
                              {/* <Divider></Divider> */}

                              <Typography.Title className="" level={4}>
                                Bid Submission
                              </Typography.Title>

                              <div className="grid grid-cols-2 gap-20">
                                {/* Bid information */}
                                {buildSubmissionForm}
                              </div>
                            </div>
                            <div className="flex flex-row space-x-1 ml-3 mt-5 items-center">
                              <Form.Item>
                                <Button
                                  type="primary"
                                  htmlType="submit"
                                  size="small"
                                >
                                  Submit
                                </Button>
                              </Form.Item>
                            </div>
                          </Form>
                        </>
                      )}
                  </div>
                </Spin>
              ) : (
                <Empty />
              )}
            </Tabs.TabPane>
            {user?.userType !== "VENDOR" && (
              <>
                <Tabs.TabPane tab="Bids list" key="2">
                  <div className="flex flex-col space-y-2 p-3">
                    {buildTabHeader()}
                    {/* Evaluators section */}
                    {data?.invitees && (
                      <div className="ml-3 flex flex-col space-y-2">
                        {
                          <>
                            <div className="text-lg flex flex-row items-center space-x-5">
                              <div>Evaluators List </div>
                              {data?.evaluationReportId && (
                                <a
                                  href={`${url}/file/evaluationReports/${data?.evaluationReportId}.pdf`}
                                  target="_blank"
                                  className="text-sm"
                                  // onClick={() => {
                                  //   setAttachmentId(
                                  //     `evaluationReports/${data?.evaluationReportId}.pdf`
                                  //   );
                                  //   setPreviewAttachment(true);
                                  // }}
                                >
                                  <FileTextOutlined /> Evaluation report
                                </a>
                              )}
                            </div>
                            <div className="flex flex-row space-x-2">
                              {iBelongToEvaluators() &&
                                !iHaveApprovedEvalReport() &&
                                data?.evaluationReportId && (
                                  <>
                                    <Button
                                      size="small"
                                      type="primary"
                                      icon={<LikeOutlined />}
                                      onClick={() => {
                                        let invitees = [...data?.invitees];
                                        let inv = invitees?.filter(
                                          (i) => i?.approver === user?.email
                                        );
                                        let invIndex = invitees?.filter(
                                          (i, index) => index
                                        );
                                        let objToUpdate =
                                          inv?.length >= 1 ? inv[0] : {};
                                        objToUpdate.approved = true;
                                        objToUpdate.approvedAt =
                                          moment().toDate();
                                        invitees[invIndex] = objToUpdate;
                                        handleSendEvalApproval(data, invitees);
                                      }}
                                    >
                                      I agree with the recomendations
                                    </Button>
                                    <Button
                                      size="small"
                                      type="text"
                                      danger
                                      icon={<DislikeOutlined />}
                                    >
                                      I disagree
                                    </Button>
                                  </>
                                )}
                            </div>
                          </>
                        }

                        <div className="flex flex-row space-x-3 text-gray-600">
                          {data?.invitees?.map((c) => {
                            return (
                              <div
                                key={c.approver}
                                className="flex flex-row items-center space-x-1"
                              >
                                <div>
                                  {c?.approved ? (
                                    <Popover
                                      content={`approved: ${moment(
                                        c?.approvedAt
                                      ).format("DD MMM YYYY")} at ${moment(
                                        c?.approvedAt
                                      )
                                        .tz("Africa/Kigali")
                                        .format("h:mm a z z")}`}
                                    >
                                      <span>
                                        <LockClosedIcon className="h-5 text-green-500" />
                                      </span>
                                    </Popover>
                                  ) : (
                                    <Popover content="Approval still pending">
                                      <span>
                                        <LockOpenIcon className="h-5 text-yellow-500" />
                                      </span>
                                    </Popover>
                                  )}
                                </div>
                                <div className="flex flex-col text-gray-600 text-sm">
                                  <div>{c?.approver}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {!data?.invitationSent &&
                      user.permissions.canApproveAsPM && (
                        <div className="ml-3 flex">
                          <div className="">
                            <div>Invite Evaluators</div>

                            <div className="flex flex-row space-x-1">
                              <Form
                                onFinish={() => sendInvitation()}
                                className="flex flex-row space-x-1"
                              >
                                <div>
                                  <Form.Item name="ivitees" required>
                                    <Select
                                      showSearch
                                      showArrow
                                      onChange={(value) =>
                                        setSelectionComitee(value)
                                      }
                                      style={{ width: "400px" }}
                                      mode="multiple"
                                      options={users.map((user) => {
                                        return {
                                          label: user?.email,
                                          value: user?.email,
                                        };
                                      })}
                                    />
                                  </Form.Item>
                                </div>
                                <div>
                                  <Form.Item>
                                    <Button
                                      htmlType="submit"
                                      disabled={selectionComitee?.length < 1}
                                      icon={
                                        <PaperAirplaneIcon className="h-5 w-5" />
                                      }
                                    />
                                  </Form.Item>
                                </div>
                              </Form>
                            </div>
                          </div>
                        </div>
                      )}
                    <Divider></Divider>
                    <div className="text-lg ml-3">Bids List</div>
                    <div>
                      <BidList
                        tenderId={data?._id}
                        handleSelectBid={handleSelectBid}
                        handleAwardBid={handleAwardBid}
                        refresh={refresh}
                        canSelectBid={
                          data?.invitationSent &&
                          moment(data?.submissionDeadLine).isSameOrBefore(
                            moment()
                          )
                        }
                        handleSetBidList={setBidList}
                        comitee={data?.invitees}
                        user={user}
                        // previewAttachment={previewAttachment}
                        setPreviewAttachment={setPreviewAttachment}
                        // attachmentId={attachmentId}
                        setAttachmentId={setAttachmentId}
                        tenderData={data}
                      />
                    </div>
                  </div>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Tender award" key="3">
                  <div className="flex flex-col space-y-5 p-3">
                    {buildTabHeader()}
                    <Divider></Divider>

                    {
                      // (contract?.status === "reviewed" ||
                      //   (contract?.status === "draft" &&
                      //     user?.permissions?.canEditContracts) ||
                      //   !contract) &&
                      bidList?.filter((d) => d.status === "awarded").length >=
                      1 ? (
                        !poCreated || !contractCreated ? (
                          <div>
                            <div className="text-xl ml-3">
                              <FolderOpenOutlined /> Selected Bid
                            </div>
                            {bidList
                              ?.filter((d) => d.status === "awarded")
                              ?.map((item) => {
                                return (
                                  <List size="small" key={item?.number}>
                                    <List.Item>
                                      <List.Item.Meta
                                        //   avatar={<Avatar src={item.picture.large} />}
                                        title={<a href="#">{item.number}</a>}
                                        description={
                                          <div className="grid grid-cols-6">
                                            <div>
                                              <div className="text-xs text-gray-600">
                                                {item?.createdBy?.companyName}
                                              </div>

                                              <div className="flex flex-col">
                                                <Link
                                                  href={`${url}/file/bidDocs/${item?.proposalDocId}.pdf`}
                                                  target="_blank"
                                                >
                                                  <Typography.Link className="flex flex-row items-center space-x-2">
                                                    <div>Proposal</div>{" "}
                                                    <div>
                                                      <PaperClipIcon className="h-4 w-4" />
                                                    </div>
                                                  </Typography.Link>
                                                </Link>

                                                <Link
                                                  href={`${url}/file/bidDocs/${item?.otherDocId}.pdf`}
                                                  target="_blank"
                                                >
                                                  <Typography.Link className="flex flex-row items-center space-x-2">
                                                    <div>
                                                      Other supporting doc
                                                    </div>{" "}
                                                    <div>
                                                      <PaperClipIcon className="h-4 w-4" />
                                                    </div>
                                                  </Typography.Link>
                                                </Link>
                                              </div>
                                            </div>

                                            <div className="">
                                              <div className="text-xs text-gray-400">
                                                Price
                                              </div>
                                              <div className="text-xs text-gray-600">
                                                {item?.price.toLocaleString() +
                                                  " " +
                                                  item?.currency}
                                              </div>
                                            </div>

                                            <div className="">
                                              <div className="text-xs text-gray-400">
                                                Discount
                                              </div>
                                              <div className="text-xs text-gray-600">
                                                {item?.discount}%
                                              </div>
                                            </div>

                                            <div className="">
                                              <div className="text-xs text-gray-400">
                                                Delivery date
                                              </div>
                                              <div className="text-xs text-gray-600">
                                                {moment(
                                                  item?.deliveryDate
                                                ).fromNow()}
                                              </div>
                                            </div>

                                            <div className="flex flex-row">
                                              <Form
                                                // size="small"
                                                className="flex flex-row space-x-1"
                                              >
                                                {/* <Form.Item>
                                          <UploadFiles label="Contract" />
                                        </Form.Item> */}

                                                {contract ? (
                                                  <Form.Item>
                                                    <Button
                                                      type="default"
                                                      icon={
                                                        <FileTextOutlined />
                                                      }
                                                      onClick={() => {
                                                        setOpenViewContract(
                                                          true
                                                        );
                                                        setVendor(
                                                          item?.createdBy
                                                        );
                                                        setTendor(item?.tender);
                                                      }}
                                                    >
                                                      View Contract{" "}
                                                      {contract?.status ===
                                                        "draft" &&
                                                        `(under review)`}
                                                    </Button>
                                                  </Form.Item>
                                                ) : (
                                                  <Form.Item>
                                                    <Button
                                                      // size="small"
                                                      disabled={
                                                        !user?.permissions
                                                          ?.canCreateContracts
                                                      }
                                                      type="primary"
                                                      icon={
                                                        <FileDoneOutlined />
                                                      }
                                                      onClick={() => {
                                                        let _signatories = [
                                                          {
                                                            onBehalfOf:
                                                              "Irembo Ltd",
                                                            title:
                                                              "Procurement Manager",
                                                            names: "",
                                                            email: "",
                                                          },
                                                          {
                                                            onBehalfOf:
                                                              "Irembo Ltd",
                                                            title:
                                                              "Director of Finance",
                                                            names: "",
                                                            email: "",
                                                          },

                                                          {
                                                            onBehalfOf:
                                                              item?.createdBy
                                                                ?.companyName,
                                                            title:
                                                              item?.createdBy
                                                                ?.title,
                                                            names:
                                                              item?.createdBy
                                                                ?.contactPersonNames,
                                                            email:
                                                              item?.createdBy
                                                                ?.email,
                                                          },
                                                        ];
                                                        setSignatories(
                                                          _signatories
                                                        );
                                                        setOpenCreateContract(
                                                          true
                                                        );
                                                        setVendor(
                                                          item?.createdBy
                                                        );
                                                        setTendor(item?.tender);
                                                      }}
                                                    >
                                                      Create Contract
                                                    </Button>
                                                  </Form.Item>
                                                )}

                                                {contractCreated &&
                                                  documentFullySigned(
                                                    contract
                                                  ) && (
                                                    <Form.Item>
                                                      <Button
                                                        // size="small"
                                                        type="primary"
                                                        icon={
                                                          <FileDoneOutlined />
                                                        }
                                                        onClick={() => {
                                                          let _signatories = [
                                                            {
                                                              onBehalfOf:
                                                                "Irembo Ltd",
                                                              title:
                                                                "Procurement Manager",
                                                              names: "",
                                                              email: "",
                                                            },
                                                            {
                                                              onBehalfOf:
                                                                "Irembo Ltd",
                                                              title:
                                                                "Director of Finance",
                                                              names: "",
                                                              email: "",
                                                            },

                                                            {
                                                              onBehalfOf:
                                                                item?.createdBy
                                                                  ?.companyName,
                                                              title:
                                                                item?.createdBy
                                                                  ?.title,
                                                              names:
                                                                item?.createdBy
                                                                  ?.contactPersonNames,
                                                              email:
                                                                item?.createdBy
                                                                  ?.email,
                                                            },
                                                          ];

                                                          setSignatories(
                                                            _signatories
                                                          );
                                                          setOpenCreatePO(true);
                                                          setVendor(
                                                            item?.createdBy
                                                          );
                                                          setTendor(
                                                            item?.tender
                                                          );
                                                        }}
                                                      >
                                                        Create PO
                                                      </Button>
                                                    </Form.Item>
                                                  )}
                                              </Form>
                                            </div>
                                          </div>
                                        }
                                      />
                                    </List.Item>
                                  </List>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="mx-3 flex flex-row space-x-5 items-center justify-center">
                            <div className="flex flex-col items-center justify-center">
                              <Typography.Title level={5}>
                                Contract
                              </Typography.Title>
                              {/* <Popover content={'PO: '+po?.number}> */}
                              <Image
                                onClick={() => setOpenViewContract(true)}
                                className=" cursor-pointer hover:opacity-60"
                                width={40}
                                height={40}
                                src="/icons/icons8-file-64.png"
                              />
                              {/* </Popover> */}
                            </div>

                            <div className="flex flex-col items-center justify-center">
                              <Typography.Title level={5}>
                                Purchase order
                              </Typography.Title>
                              {/* <Popover content={po?.number}> */}
                              <Image
                                onClick={() => setOpenViewPO(true)}
                                className=" cursor-pointer hover:opacity-60"
                                width={40}
                                height={40}
                                src="/icons/icons8-file-64.png"
                              />
                              {/* </Popover> */}
                            </div>
                          </div>
                        )
                      ) : (
                        <Empty />
                      )
                    }
                  </div>
                </Tabs.TabPane>
              </>
            )}

            {user?.userType === "VENDOR" && (
              <Tabs.TabPane tab="My Bid" key="2">
                <div className="flex flex-col space-y-5 p-3">
                  {buildTabHeader()}
                  {bidList?.filter((d) => d?.createdBy?._id === user?._id)
                    .length >= 1 ? (
                    <div>
                      {bidList
                        ?.filter((d) => d?.createdBy?._id === user?._id)
                        ?.map((item) => {
                          return (
                            <>
                              <div className="p-3 grid md:grid-cols-8 ">
                                <div className="self-center">
                                  <a href="#">{item.number}</a>
                                  <div className="text-xs text-gray-400">
                                    Vendor
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item?.createdBy?.companyName}
                                  </div>
                                </div>

                                <div className="self-center">
                                  <div className="text-xs text-gray-400">
                                    Bank Info
                                  </div>
                                  <div className="flex flex-col">
                                    {/* <div className="text-xs text-gray-400">
                                      Bank Name:
                                    </div> */}
                                    <div className="text-xs text-gray-600">
                                      {item?.bankName}
                                    </div>
                                  </div>

                                  <div className="flex flex-col">
                                    {/* <div className="text-xs text-gray-400">
                                      Account Name:
                                    </div> */}
                                    <div className="text-xs text-gray-600">
                                      {item?.bankAccountName}
                                    </div>
                                  </div>

                                  <div className="flex flex-col">
                                    {/* <div className="text-xs text-gray-400">
                                      Account Number
                                    </div> */}
                                    <div className="text-xs text-gray-600">
                                      {item?.bankAccountNumber}
                                    </div>
                                  </div>
                                </div>

                                <div className="self-center">
                                  <div className="text-xs text-gray-400">
                                    Price
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item?.price.toLocaleString() +
                                      " " +
                                      item?.currency}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Comment
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item?.comment}
                                  </div>
                                </div>

                                <div className="self-center">
                                  <div className="text-xs text-gray-400">
                                    Discount
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {item?.discount}%
                                  </div>
                                </div>

                                <div className="self-center">
                                  <div className="text-xs text-gray-400">
                                    Warranty
                                  </div>
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
                                  <div className="text-xs text-gray-400">
                                    Docs
                                  </div>
                                  {item?.proposalDocId && (
                                    <div className="flex flex-row items-center space-x-2">
                                      <a
                                        href={`${url}/file/bidDocs/${item?.proposalDocId}.pdf`}
                                        className="text-xs"
                                        target="_blank"
                                      >
                                        Proposal{" "}
                                        <PaperClipIcon className="h-3 w-3" />
                                      </a>
                                      <UploadBidDoc
                                        iconOnly={true}
                                        setSelected={() => {}}
                                        // label="Update the doc"
                                        uuid={item?.proposalDocId}
                                      />
                                    </div>
                                  )}
                                  {!item?.proposalDocId && (
                                    <div className="text-xs">
                                      No proposal doc found!
                                    </div>
                                  )}
                                  {item?.otherDocId && (
                                    <div className="flex flex-row items-center space-x-2">
                                      <a
                                        href={`${url}/file/bidDocs/${item?.otherDocId}.pdf`}
                                        className="text-xs"
                                        target="_blank"
                                      >
                                        Other Doc{" "}
                                        <PaperClipIcon className="h-3 w-3" />
                                      </a>
                                      <UploadBidDoc
                                        iconOnly={true}
                                        // label="Update the doc"
                                        setSelected={() => {}}
                                        uuid={item?.otherDocId}
                                      />
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
                            </>
                          );
                        })}
                    </div>
                  ) : (
                    <Empty />
                  )}
                </div>
              </Tabs.TabPane>
            )}

            {user?.userType === "VENDOR" &&
              contract?.vendor?._id === user?._id && (
                <Tabs.TabPane tab="Tender award" key="3">
                  <div className="flex flex-col space-y-5 p-3">
                    {buildTabHeader()}
                    {bidList?.filter((d) => d.status === "awarded").length >=
                    1 ? (
                      (!poCreated || !contractCreated) &&
                      contract?.status !== "draft" &&
                      documentFullySignedInternally(contract) &&
                      documentFullySignedInternally(po) ? (
                        <div>
                          {bidList
                            ?.filter(
                              (d) =>
                                d.status === "awarded" &&
                                d?.createdBy?._id === user?._id
                            )
                            ?.map((item) => {
                              return (
                                <List size="small" key={item?.number}>
                                  <List.Item>
                                    <List.Item.Meta
                                      //   avatar={<Avatar src={item.picture.large} />}
                                      title={<a href="#">{item.number}</a>}
                                      description={
                                        <>
                                          <div className="text-xs text-gray-400">
                                            {item?.createdBy?.companyName}
                                          </div>
                                          <a href="#">
                                            <FileTextOutlined />{" "}
                                          </a>
                                        </>
                                      }
                                    />
                                    <div className="flex flex-row items-start space-x-10 justify-between">
                                      <div className="flex flex-row space-x-2">
                                        <div className="flex flex-col">
                                          <div className="flex flex-row space-x-2">
                                            <div className="text-xs font-bold text-gray-500">
                                              Price:
                                            </div>
                                            <div className="text-xs text-gray-400">
                                              {item?.price.toLocaleString()}
                                            </div>
                                          </div>

                                          <div className="flex flex-row space-x-2">
                                            <div className="text-xs font-bold text-gray-500">
                                              Discount:
                                            </div>
                                            <div className="text-xs text-gray-400">
                                              {item?.discount}%
                                            </div>
                                          </div>

                                          <div className="flex flex-row space-x-2">
                                            <div className="text-xs font-bold text-gray-500">
                                              Delivery date:
                                            </div>
                                            <div className="text-xs text-gray-400">
                                              {moment(
                                                item?.deliveryDate
                                              ).format("YYYY-MMM-DD")}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <Form
                                        // size="small"
                                        className="flex flex-row space-x-1"
                                      >
                                        {/* <Form.Item>
                                          <UploadFiles label="Contract" />
                                        </Form.Item> */}

                                        {contract && (
                                          <Form.Item>
                                            <Button
                                              type="default"
                                              icon={<FileTextOutlined />}
                                              onClick={() => {
                                                setOpenViewContract(true);
                                                setVendor(item?.createdBy);
                                                setTendor(item?.tender);
                                              }}
                                            >
                                              View Contract
                                            </Button>
                                          </Form.Item>
                                        )}
                                      </Form>
                                    </div>
                                  </List.Item>
                                </List>
                              );
                            })}
                        </div>
                      ) : contract?.vendor?._id === user?._id &&
                        contract?.status !== "draft" &&
                        documentFullySignedInternally(contract) &&
                        documentFullySignedInternally(po) ? (
                        <div className="mx-3 flex flex-row space-x-5 items-center justify-center">
                          <div className="flex flex-col items-center justify-center">
                            <Typography.Title level={5}>
                              Contract
                            </Typography.Title>
                            {/* <Popover content={'PO: '+po?.number}> */}
                            <Image
                              onClick={() => setOpenViewContract(true)}
                              className=" cursor-pointer hover:opacity-60"
                              width={40}
                              height={40}
                              src="/icons/icons8-file-64.png"
                            />
                            {/* </Popover> */}
                          </div>

                          <div className="flex flex-col items-center justify-center">
                            <Typography.Title level={5}>
                              Purchase order
                            </Typography.Title>
                            {/* <Popover content={po?.number}> */}
                            <Image
                              onClick={() => setOpenViewPO(true)}
                              className=" cursor-pointer hover:opacity-60"
                              width={40}
                              height={40}
                              src="/icons/icons8-file-64.png"
                            />
                            {/* </Popover> */}
                          </div>
                        </div>
                      ) : (
                        <Empty />
                      )
                    ) : (
                      <Empty />
                    )}
                  </div>
                </Tabs.TabPane>
              )}
          </Tabs>
        </div>

        <CloseOutlined className="cursor-pointer" onClick={handleClose} />
      </div>

      {createPOMOdal()}
      {viewPOMOdal()}
      {createContractMOdal()}
      {viewContractMOdal()}
      {previewAttachmentModal()}
    </div>
  );
};
export default TenderDetails;
