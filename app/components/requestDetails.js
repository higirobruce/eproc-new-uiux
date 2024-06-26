"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Button,
  DatePicker,
  Empty,
  Form,
  Popconfirm,
  Spin,
  Steps,
  Tabs,
  Tag,
  TimePicker,
  Typography,
  Upload,
  Input,
  Divider,
  Alert,
  InputNumber,
  Popover,
  Rate,
  Select,
  Modal,
  Table,
  message,
  Tooltip,
  Timeline,
  Progress,
  Radio,
  Switch,
} from "antd";
import {
  CheckOutlined,
  DislikeOutlined,
  LikeOutlined,
  FileDoneOutlined,
  FileProtectOutlined,
  LoadingOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileAddOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  EditOutlined,
  EyeOutlined,
  UserOutlined,
  CloseOutlined,
  PlaySquareOutlined,
} from "@ant-design/icons";
import moment from "moment";
import dayjs from "dayjs";
import Image from "next/image";
import ItemsTable from "./itemsTable";
import ItemsTableB1 from "./itemsTableB1";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  FolderOpenIcon,
  PaperClipIcon,
  RectangleStackIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { v4 } from "uuid";
import UploadTenderDoc from "./uploadTenderDoc";
import UploadReqAttach from "./uploadReqAttach";
// import MyPdfViewer from "./pdfViewer";
import _ from "lodash";
import Link from "next/link";
import { RiArrowDropDownLine } from "react-icons/ri";
import { FiShoppingBag } from "react-icons/fi";
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdFileCopy, MdAttachFile } from "react-icons/md";
import { BiPurchaseTagAlt } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import { TiInfoLarge } from "react-icons/ti";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import UploadOtherFiles from "./uploadOtherFiles";
import { Dialog, Transition } from "@headlessui/react";
import { activityUser } from "../utils/helpers";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

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

function buildSingatory(onBehalfOf, repTitle, repNames, repEmail) {
  return (
    <div className="flex flex-col ring-1 ring-gray-300 rounded pt-5 space-y-3">
      <div className="px-5">
        <div className="flex flex-col">
          <Typography.Text type="secondary">
            <div className="text-xs">On Behalf of</div>
          </Typography.Text>
          <Typography.Text strong>Irembo ltd</Typography.Text>
        </div>

        <div className="flex flex-col">
          <Typography.Text type="secondary">
            <div className="text-xs">Representative Title</div>
          </Typography.Text>
          <Typography.Text strong>Procurement Manager</Typography.Text>
        </div>

        <div className="flex flex-col">
          <Typography.Text type="secondary">
            <div className="text-xs">Company Representative</div>
          </Typography.Text>
          <Typography.Text strong>Manirakiza Edouard</Typography.Text>
        </div>

        <div className="flex flex-col">
          <Typography.Text type="secondary">
            <div className="text-xs">Email</div>
          </Typography.Text>
          <Typography.Text strong>e.manirakiza@irembo.com</Typography.Text>
        </div>
      </div>

      <Popconfirm title="Confirm PO Signature">
        <div className="flex flex-row justify-center space-x-5 items-center border-t-2 bg-blue-50 p-5 cursor-pointer hover:opacity-75">
          <Image width={40} height={40} src="/icons/icons8-signature-80.png" />

          <div className="text-blue-400 text-lg">Sign with one click</div>
        </div>
      </Popconfirm>
    </div>
  );
}

function addSingatory() {
  return (
    <div className="flex flex-col ring-1 ring-gray-100  rounded pt-5 space-y-3 items-center justify-center p-2">
      <Image width={60} height={60} src="/icons/icons8-add-file-64.png" />
    </div>
  );
}

function contractParty(companyName, companyAdress, companyTin, partyType) {
  return (
    <div className="flex flex-col ring-1 ring-gray-300 rounded p-5 space-y-3">
      <div className="flex flex-col">
        <Typography.Text type="secondary">
          <div className="text-xs">Company Name</div>
        </Typography.Text>
        <Typography.Text strong>{companyName}</Typography.Text>
      </div>

      <div className="flex flex-col">
        <Typography.Text type="secondary">
          <div className="text-xs">Company Address</div>
        </Typography.Text>
        <Typography.Text strong>{companyAdress}</Typography.Text>
      </div>

      <div className="flex flex-col">
        <Typography.Text type="secondary">
          <div className="text-xs">Company TIN no.</div>
        </Typography.Text>
        <Typography.Text strong>{companyTin}</Typography.Text>
      </div>

      <div className="flex flex-col">
        <Typography.Text type="secondary">
          <div className="text-xs">Hereinafter refferd to as</div>
        </Typography.Text>
        <Typography.Text strong>{partyType}</Typography.Text>
      </div>
    </div>
  );
}

function buildTenderForm(
  setDeadLine,
  user,
  docId,
  submitTenderData,
  setTendeDocSelected,
  tenderDocSelected
) {
  return (
    <>
      <div className="items-center">
        <Typography.Title level={5}>Create Tender</Typography.Title>
        <Form.Item
          className="mb-2"
          name="tenderDocUrl"
          label={
            <div className="flex flex-col justify-start items-start">
              Upload Tender Documents
              <i className="text-xxs">(expected in PDF format)</i>
            </div>
          }
        ></Form.Item>
        <UploadTenderDoc
          uuid={docId}
          setTendeDocSelected={setTendeDocSelected}
          updateTender={() => {}}
        />
        <div className="py-3">
          <label>Indicate Bid Submission Deadline</label>
          <Form.Item
            name="deadLine"
            label=""
            rules={[
              {
                required: true,
                message: "Please enter the submission deadline!",
              },
            ]}
            className="my-3"
          >
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime
              showNow={false}
              disabledDate={(current) => current.isBefore(moment())}
              onChange={(v, str) => {
                // console.log(moment(str).toISOString());
                setDeadLine(moment(str).toISOString());
              }}
              className="w-full"
            />
          </Form.Item>
        </div>
      </div>
      <div className="flex flex-row space-x-1 items-center">
        <Form.Item className="w-full">
          <Button
            icon={<FileDoneOutlined />}
            type="primary"
            htmlType="submit"
            onClick={submitTenderData}
            disabled={
              !user?.permissions?.canCreateTenders || !tenderDocSelected
            }
            className="w-full"
          >
            Publish Tender
          </Button>
        </Form.Item>
      </div>
    </>
  );
}

function buildPOForm(
  setSelectedContract,
  contracts,
  user,
  submitPOData,
  setVendor,
  selectedContract,
  documentFullySigned
) {
  return (
    <div className="">
      <Typography.Title level={5}>Select existing contract</Typography.Title>
      <Form.Item>
        <Form.Item
          // label="Contract"
          name="contract"
        >
          <Select
            allowClear
            style={{ width: "100%" }}
            placeholder="search by vendor name, contract #"
            showSearch
            onChange={(value, option) => {
              setSelectedContract(option?.payload);
              setVendor(option?.payload.vendor);
            }}
            filterSort={(optionA, optionB) =>
              (optionA?.name ?? "")
                .toLowerCase()
                .localeCompare((optionB?.name ?? "").toLowerCase())
            }
            filterOption={(inputValue, option) =>
              option?.name.toLowerCase().includes(inputValue.toLowerCase())
            }
            // defaultValue="RWF"
            options={contracts
              .filter(
                (c) =>
                  documentFullySigned(c) &&
                  moment().isBefore(moment(c.endDate)) &&
                  c?.vendor?.status == "approved"
              )
              .map((c) => {
                return {
                  value: c._id,
                  label: (
                    <div className="flex flex-col">
                      <div>
                        <UserOutlined /> {c.vendor?.companyName}
                      </div>
                      <div className="text-gray-300">{c?.number}</div>
                    </div>
                  ),
                  name: c.vendor?.companyName + c?.number,

                  payload: c,
                };
              })}
          ></Select>
        </Form.Item>

        <Button
          // size="small"
          type="primary"
          className="w-full"
          icon={<FileDoneOutlined />}
          onClick={submitPOData}
          disabled={
            !user?.permissions?.canCreatePurchaseOrders || !selectedContract
          }
          htmlType="submit"
        >
          Create PO
        </Button>
      </Form.Item>
    </div>
  );
}

const RequestDetails = ({
  data,
  handleUpdateStatus,
  handleReject,
  loading,
  handleCreateTender,
  setConfirmRejectLoading,
  confirmRejectLoading,
  handleUpdateProgress,
  reload,
  handleCreatePO,
  handleCreateContract,
  edit,
  handleUpdateRequest,
  handleRateDelivery,
  refDoc,
  setRefDoc,
  setFilePaths,
  fileList,
  files,
  setFileList,
  setFiles,
  handleUpload,
  filesAreSet,
  show,
  handleClose,
}) => {
  const [form] = Form.useForm();
  const router = useRouter();
  let [confirmLoading, setConfirmLoading] = useState(false);
  const [size, setSize] = useState("small");
  const [currentCode, setCurrentCode] = useState(-1);
  let [deadLine, setDeadLine] = useState(null);
  const [open, setOpen] = useState(false);
  const [openConfirmDeliv, setOpenConfirmDeliv] = useState([]);
  const [openApprove, setOpenApprove] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  let [reason, setReason] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== "undefined" && localStorage.getItem("token");

  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let fendUrl = process.env.NEXT_PUBLIC_FTEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let [tender, setTender] = useState(null);
  let [po, setPO] = useState(null);
  let [contract, setContract] = useState(null);
  let [currentStep, setCurrentStep] = useState(-1);
  let [progress, setProgress] = useState(0);
  // let [refDoc, setRefDoc] = useState(false);
  let [contracts, setContracts] = useState([]);
  let [selectedContract, setSelectedContract] = useState(null);
  let [vendor, setVendor] = useState(null);
  let [openCreatePO, setOpenCreatePO] = useState(false);
  let [openCreateContract, setOpenCreateContract] = useState(false);
  let [sections, setSections] = useState([]);
  let [poItems, setPOItems] = useState([]);
  let [items, setItems] = useState([]);
  let [totalVal, setTotVal] = useState(0);
  let [totalTax, setTotTax] = useState(0);
  let [grossTotal, setGrossTotal] = useState(0);
  let [startingDelivery, setStartingDelivery] = useState(false);
  const [values, setValues] = useState([]);

  const [signatories, setSignatories] = useState([]);
  const [docDate, setDocDate] = useState(moment());
  const [docType, setDocType] = useState("dDocument_Service");
  const [previewAttachment, setPreviewAttachment] = useState(false);
  const [attachmentId, setAttachmentId] = useState("TOR-id.pdf");
  const [docId, setDocId] = useState(v4());
  const [vendors, setVendors] = useState([]);
  let [contractStartDate, setContractStartDate] = useState(null);
  let [contractEndDate, setContractEndDate] = useState(null);
  let [reqAttachId, setReqAttachId] = useState(v4());
  const [creatingPO, setCreatingPO] = useState(false);
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(0);
  const [prActivityData, setprActivityData] = useState([]);

  const [assetOptions, setAssetOptions] = useState([]);

  const [users, setUsers] = useState([]);

  const [poCurrency, setPoCurrency] = useState(null);
  const [assets, setAssets] = useState([]);

  let [tendor, setTendor] = useState("");
  const [deliveredQty, setDeliveredQty] = useState(0);
  const [deliveredQties, setDeliveredQties] = useState([]);
  const [tenderDocSelected, setTendeDocSelected] = useState(false);
  const [attachSelected, setAttachSelected] = useState(false);
  const [approvalShow, setApprovalShow] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [emptySignatory, setEmptySignatory] = useState([]);
  const [tab, setTab] = useState(0);
  const contentHeight = useRef();
  const scrollRef = useRef();
  const [contractTitle, setContractTitle] = useState("Contract title");
  const [contractSender, setContractSender] = useState("Irembo Ltd");
  const [contractReceiver, setContractReceiver] = useState("");
  const [contractSenderParty, setContractSenderParty] = useState("Sender");
  const [contractReceiverParty, setContractReceiverParty] =
    useState("Receiver");

  const showPopconfirm = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmRejectLoading(true);
    handleReject(data?._id, reason, `${user?.firstName} ${user?.lastName}`);
    setOpen(false);
    setConfirmRejectLoading(false);
  };
  const handleCancel = () => {
    setOpen(false);
  };

  const columns = [
    {
      title: "Item title",
      dataIndex: "title",
      key: "title",
      editable: true,
      width: "20%",
      // maxWidth: 250,
      render: (_, item) => (
        <div style={{ maxHeight: 80, overflowY: "scroll" }}>{item?.title}</div>
      ),
    },

    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      editable: true,
      render: (_, item) => <>{(item?.quantity).toLocaleString()}</>,
    },
    {
      title: "Unit Price",
      dataIndex: "estimatedUnitCost",
      key: "estimatedUnitCost",
      editable: true,
      render: (_, item) => (
        <>
          {item?.currency} {(item?.estimatedUnitCost * 1).toLocaleString()}{" "}
        </>
      ),
    },

    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, item) => (
        <>
          {item?.currency}{" "}
          {(item?.quantity * item?.estimatedUnitCost).toLocaleString()}
        </>
      ),
    },

    !data?.supportingDocs && {
      title: "Supporting docs",
      dataIndex: "title",
      key: "title",
      render: (_, item) => (
        <div className="flex flex-col">
          {item?.paths?.map((p, i) => {
            return (
              <div key={p}>
                {p && (
                  <Link
                    // href={`${url}/file/termsOfReference/${p}`}
                    href={`${fendUrl}/api/?folder=termsOfReference&name=${p}`}
                    target="_blank"
                  >
                    <Typography.Link
                      className="flex flex-row items-center space-x-2"
                      // onClick={() => {
                      //   setPreviewAttachment(!previewAttachment);
                      //   setAttachmentId(p);
                      // }}
                    >
                      <div>supporting doc{i + 1} </div>{" "}
                      <div>
                        <PaperClipIcon className="h-4 w-4" />
                      </div>
                    </Typography.Link>
                  </Link>
                )}
              </div>
            );
          })}
          {(!item?.paths || item?.paths?.length < 1) && (
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

  let [servCategories, setServCategories] = useState([]);
  let [budgetLines, setBudgetLines] = useState([]);

  useEffect(() => {
    setContractReceiver(vendor?.companyName);
  }, [vendor]);

  useEffect(() => {
    refresh();
    let _openConfirmDeliv = [...openConfirmDeliv];
    let _deliveredQties = [...deliveredQties];
    data?.items?.map((d, i) => {
      _openConfirmDeliv.push(false);
      _deliveredQties.push(0);

      setOpenConfirmDeliv(_openConfirmDeliv);
      setDeliveredQties(_deliveredQties);
    });

    setValues(data?.items);
    setPoCurrency(data?.currency || "RWF");

    // let _p = data?.items?.map((item) => {
    //   let _files = [];
    //   let paths = item?.paths?.map((doc, i) => {
    //     if (doc) {
    //       let uid = `rc-upload-${moment().milliseconds()}-${i}`;
    //       let _url = `${url}/file/termsOfReference/${doc}`;
    //       let status = "done";
    //       let name = `supporting doc${i + 1}.pdf`;

    //       return {
    //         uid,
    //         url: _url,
    //         status,
    //         name,
    //       };
    //     }
    //   });

    //   return paths
    // });

    // setFiles(_p)
    // setFilePaths(_p)

    // console.log('Seeeeet Files', _p)

    fetch(`${url}/serviceCategories/?visible=1`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setServCategories(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });

    fetch(`${url}/budgetLines`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
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
          content: "Connection Error!",
        });
      });
  }, [data]);

  useEffect(() => {
    getInternalUsers();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
  }, []);

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
  }, [poItems, items]);

  useEffect(() => {
    setProgress(po?.deliveryProgress);
  }, [po]);

  useEffect(() => {
    let list = [];
    assets.map((alist) => {
      alist.map((a) => {
        list.push(a);
      });
    });
  }, [assets]);

  useEffect(() => {
    refresh();
  }, [reload]);

  useEffect(() => {
    let t = 0;
    selectedContract?.purchaseRequest?.items?.map((i) => {
      t = t + i?.quantity * i?.estimatedUnitCost;
    });
    setTotVal(t);
    // updateBidList();
  }, [selectedContract]);

  useEffect(() => {
    setDocId(v4());
    setAttachSelected(false);
    setTendeDocSelected(false);
  }, [refDoc]);

  function getFixedAssets() {
    fetch(`${url}/b1/fixedAssets`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
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
              label: (
                <div className="flex flex-col">
                  <div>{v?.ItemCode}</div>
                  <div className="text-gray-400 text-sm">{v?.ItemName}</div>
                </div>
              ),
            };
          });
          setAssetOptions(assetOptions);
        }
      })
      .catch((err) => {
        messageApi.error({
          content: "Could not connect to SAP B1!",
        });
      });
  }

  function refresh() {
    let statusCode = getRequestStatusCode(data?.status);
    setCurrentCode(statusCode);
    getContracts();
    setPOItems(data?.items);
    setItems(data?.items);
    checkDirectPOExists(data);
    setReqAttachId(v4());
    getFixedAssets();
    getPrActivity(data?._id);
    if (data) {
      checkContractExists();
      checkTenderExists(data);
    }

    fetch(`${url}/users/vendors`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setVendors(res);
      })
      .catch((err) => {});
  }

  useEffect(() => {
    if (tender) checkPOExists(tender);
    else checkDirectPOExists(data);
  }, [tender]);

  useEffect(() => {
    if (po && po.status !== "started") setCurrentStep(1);
    else if (po && po.status === "started") setCurrentStep(1);
    else if (tender) setCurrentStep(0);

    if (po?.deliveryProgress >= 100) setCurrentStep(3);
  }, [tender, po]);

  function getPrActivity(id) {
    fetch(`${url}/requests/logs/${id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setprActivityData(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }
  function getRequestStatus(code) {
    // if (code === 0) return "verified";
    if (code === 0) return "pending";
    else if (code === 1) return "approved (hod)";
    else if (code === 2) return "approved (fd)";
    else if (code === 3) return "approved (pm)";
    else if (code === 4) return "approved";
    else if (code === 5) return "withdrawn";
    else if (code === 6) return "declined";
    else if (code === 7) return "archived";
    else return "pending for approval";
  }

  function getRequestStatusCode(status) {
    // if (status === "verified") return 0;
    if (status === "pending") return 0;
    else if (status === "approved (hod)") return 1;
    else if (status === "approved (fd)") return 2;
    else if (status === "approved (pm)") return 3;
    else if (status === "approved") return 4;
    else if (status === "withdrawn") return 5;
    else if (status === "declined") return 6;
    else if (status === "archived") return 7;
    else return -1;
  }

  function changeStatus(statusCode) {
    setCurrentCode(statusCode);
    handleUpdateStatus(data?._id, getRequestStatus(statusCode));
  }

  function createTender(tenderData) {
    form.validateFields().then(
      (onfullfilled) => {
        handleCreateTender(tenderData);
      },
      (onRejected) => {}
    );
  }

  function submitTenderData(values) {
    // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));

    let tData = {
      createdBy: user._id,
      items: data?.items,
      dueDate: data?.dueDate,
      status: "open",
      attachementUrls: [""],
      submissionDeadLine: new Date(deadLine),
      torsUrl: "url",
      purchaseRequest: data?._id,
      docId,
      reqAttachmentDocId: refDoc === "Direct Contracting" ? reqAttachId : "",
    };
    createTender(tData);
  }

  function submitPOData(values) {
    let _signatories = [
      {
        onBehalfOf: "Irembo Ltd",
        title: "Procurement Manager",
        names: "",
        email: "",
      },
      {
        onBehalfOf: "Irembo Ltd",
        title: "Director of Finance",
        names: "",
        email: "",
      },
      {
        onBehalfOf: vendor.companyName,
        title: vendor.title,
        names: vendor.contactPersonNames,
        email: vendor.email,
      },
    ];

    setSignatories(_signatories);
    setOpenCreatePO(true);
  }

  function submitContractData() {
    let _signatories = [
      {
        onBehalfOf: "Irembo Ltd",
        title: "Procurement Manager",
        names: "",
        email: "",
      },
      {
        onBehalfOf: vendor.companyName,
        title: vendor.title,
        names: vendor.contactPersonNames,
        email: vendor.email,
      },
    ];

    // router.push({
    //   pathname: '/system/contracts/new',
    //   query: { data: {name: 'Kevin'} },
    // });

    setSignatories(_signatories);
    setOpenCreateContract(true);
  }

  function getContracts() {
    fetch(`${url}/contracts/`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) setContracts(res);
        else setContracts([]);
      });
  }

  function getInternalUsers() {
    fetch(`${url}/users/internal`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res) setUsers(res);
        else setUsers([]);
      });
  }

  function checkTenderExists(data) {
    fetch(`${url}/tenders/byRequest/${data?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.length >= 1) {
          setTender(res[0]);
        } else {
          setTender(null);
        }
      });
  }

  function checkPOExists(tender) {
    fetch(`${url}/purchaseOrders/byTenderId/${tender?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        // alert(JSON.stringify(res));
        if (res?.length >= 1) {
          setPO(res?.filter((p) => p?.status !== "withdrawn")[0]);
        } else {
          setPO(null);
        }
      });
  }

  function checkContractExists() {
    fetch(`${url}/contracts/byRequestId/${data?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.length >= 1) {
          setContract(res[0]);
        } else {
          setContract(null);
        }
      });
  }

  function checkDirectPOExists(data) {
    fetch(`${url}/purchaseOrders/byRequestId/${data?._id}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res?.length >= 1)
          setPO(res?.filter((p) => p?.status !== "withdrawn")[0]);
        else setPO(null);
      });
  }

  function handleGetProgress(value) {
    let t = 0;
    let totalItems = data?.items?.map((i) => {
      t = parseInt(t) + parseInt(i?.quantity);
    });

    setProgress((value / t) * 100);
  }

  function buildApprovalFlow(
    currentCode,
    changeStatus,
    submitTenderData,
    setDeadLine,
    open,
    handleOk,
    setReason,
    confirmRejectLoading,
    handleCancel,
    showPopconfirm,
    date,
    refDoc,
    setRefDoc,
    contracts,
    submitPOData,
    setSelectedContract,
    data,
    submitContractData,
    setTendeDocSelected,
    form
  ) {
    return (
      <>
        <Divider></Divider>
        <div className="grid md:grid-cols-2">
          <div>
            {/* Approval flow */}
            <div className="mx-3">
              <Steps
                direction="vertical"
                current={currentCode}
                items={[
                  {
                    title: `Level 1 (Department - ${
                      data?.level1Approver?.firstName +
                      " " +
                      data?.level1Approver?.lastName
                    })`,
                    icon: <UserGroupIcon className="h-6" />,
                    subTitle: currentCode > 0 && (
                      <div className="flex flex-row items-center space-x-1 text-xs font-semibold">
                        <div>
                          {currentCode === 6 && !data?.hod_approvalDate && (
                            <CloseOutlined className="h-5 w-5 text-red-500" />
                          )}
                          {currentCode > 0 && data?.hod_approvalDate && (
                            <CheckOutlined className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          {currentCode === 6 &&
                            !data?.hod_approvalDate &&
                            `Declined ` + moment(data?.rejectionDate).fromNow()}
                          {currentCode > 0 &&
                            data?.hod_approvalDate &&
                            `Approved ` +
                              moment(data?.hod_approvalDate).fromNow()}
                        </div>
                      </div>
                    ),
                    description: currentCode == 0 && (
                      <div className="flex flex-col">
                        <div className="text-[#8392AB] mb-4">
                          Kindly check if the request is relevant and take
                          action accordingly.
                        </div>
                        <div className="flex flex-row space-x-3">
                          <div>
                            <Popconfirm
                              title="Are you sure?"
                              open={openApprove}
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: "red" }}
                                />
                              }
                              onConfirm={() => {
                                changeStatus(1);
                                setOpenApprove(false);
                              }}
                              // okButtonProps={{
                              //   loading: confirmRejectLoading,
                              // }}
                              onCancel={() => setOpenApprove(false)}
                            >
                              <Button
                                icon={<LikeOutlined />}
                                disabled={
                                  !user?.permissions?.canApproveAsHod ||
                                  user?._id !== data?.level1Approver?._id ||
                                  currentCode > 0
                                }
                                onClick={() => setOpenApprove(true)}
                                type="primary"
                                className="pb-4 pt-1.5 border-none"
                              >
                                Approve
                              </Button>
                            </Popconfirm>
                          </div>
                          <div>
                            <Popconfirm
                              title="Are you sure?"
                              open={open}
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: "red" }}
                                />
                              }
                              onConfirm={() => {
                                if (reason?.length >= 3) handleOk();
                              }}
                              description={
                                <>
                                  <Input
                                    onChange={(v) => setReason(v.target.value)}
                                    placeholder="Please insert a reason for the rejection"
                                  ></Input>
                                </>
                              }
                              okButtonProps={{
                                disabled: reason?.length < 3,
                                loading: confirmRejectLoading,
                              }}
                              onCancel={handleCancel}
                            >
                              <Button
                                icon={<DislikeOutlined />}
                                disabled={
                                  !user?.permissions?.canApproveAsHod ||
                                  user?._id !== data?.level1Approver?._id ||
                                  currentCode > 0
                                }
                                danger
                                type="primary"
                                onClick={showPopconfirm}
                                className="pb-4 pt-1.5 border-none"
                              >
                                Reject
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    ),
                    disabled:
                      !user?.permissions?.canApproveAsHod || currentCode > 0,
                  },
                  {
                    title: "Level 2 (Finance)",
                    icon: <BanknotesIcon className="h-6" />,
                    subTitle: currentCode > 1 && data?.hod_approvalDate && (
                      <div className="flex flex-row items-center space-x-1 text-xs font-semibold">
                        <div>
                          {currentCode === 6 && !data?.hof_approvalDate && (
                            <CloseOutlined className="h-5 w-5 text-red-500" />
                          )}
                          {currentCode > 1 && data?.hof_approvalDate && (
                            <CheckOutlined className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          {currentCode === 6 &&
                            !data?.hof_approvalDate &&
                            `Declined ` + moment(data?.rejectionDate).fromNow()}
                          {currentCode > 1 &&
                            data?.hof_approvalDate &&
                            `Approved ` +
                              moment(data?.hof_approvalDate).fromNow()}
                        </div>
                      </div>
                    ),
                    description: currentCode === 1 && (
                      <div className="flex flex-col">
                        <div className="text-[#8392AB] mb-4">
                          Kindly check if the request is relevant and take
                          action accordingly.
                        </div>
                        <div className="flex flex-row space-x-3">
                          <div>
                            <Popconfirm
                              title="Are you sure?"
                              open={openApprove}
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: "red" }}
                                />
                              }
                              onConfirm={() => {
                                changeStatus(2);
                                setOpenApprove(false);
                              }}
                              // okButtonProps={{
                              //   loading: confirmRejectLoading,
                              // }}
                              onCancel={() => setOpenApprove(false)}
                            >
                              <Button
                                icon={<LikeOutlined />}
                                disabled={
                                  !user?.permissions?.canApproveAsHof ||
                                  currentCode > 1 ||
                                  currentCode < 0
                                }
                                onClick={() => setOpenApprove(true)}
                                type="primary"
                                className="pb-4 pt-1.5 border-none"
                              >
                                Approve
                              </Button>
                            </Popconfirm>
                          </div>
                          <div>
                            <Popconfirm
                              title="Are you sure?"
                              open={open}
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: "red" }}
                                />
                              }
                              onConfirm={() => {
                                if (reason?.length >= 3) handleOk();
                              }}
                              okButtonProps={{
                                disabled: reason?.length < 3,
                                loading: confirmRejectLoading,
                              }}
                              onCancel={handleCancel}
                              description={
                                <>
                                  <Input
                                    onChange={(v) => setReason(v.target.value)}
                                    placeholder="Reason for rejection"
                                  ></Input>
                                </>
                              }
                            >
                              <Button
                                icon={<DislikeOutlined />}
                                disabled={
                                  !user?.permissions?.canApproveAsHof ||
                                  currentCode > 1 ||
                                  currentCode < 0
                                }
                                type="primary"
                                danger
                                className="pb-4 pt-1.5 border-none"
                                onClick={showPopconfirm}
                              >
                                Reject
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    ),
                    disabled:
                      !user?.permissions?.canApproveAsHof ||
                      currentCode > 1 ||
                      currentCode < 0,
                  },
                  {
                    // title: "Waiting",
                    title: "Level 3 (Procurement)",
                    icon: <ClipboardDocumentCheckIcon className="h-6" />,
                    subTitle: currentCode > 2 && data.hof_approvalDate && (
                      <div className="flex flex-row items-center space-x-1 text-xs font-semibold">
                        <div>
                          {currentCode === 6 && !data?.pm_approvalDate && (
                            <CloseOutlined className="h-5 w-5 text-red-500" />
                          )}
                          {currentCode > 2 && data?.pm_approvalDate && (
                            <CheckOutlined className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          {currentCode === 6 &&
                            !data?.pm_approvalDate &&
                            `Declined ` + moment(data?.rejectionDate).fromNow()}
                          {currentCode > 2 &&
                            data?.pm_approvalDate &&
                            `Approved ` +
                              moment(data?.pm_approvalDate).fromNow()}
                        </div>
                      </div>
                    ),
                    description: currentCode === 2 && (
                      <div className="flex flex-col">
                        <div className="text-[#8392AB] mb-4">
                          Kindly check if the request is relevant and take
                          action accordingly.
                        </div>
                        <div className="flex flex-row space-x-5">
                          <div>
                            <Popconfirm
                              title="Are you sure?"
                              open={openApprove}
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: "red" }}
                                />
                              }
                              onConfirm={() => {
                                changeStatus(3);
                                setOpenApprove(false);
                              }}
                              // okButtonProps={{
                              //   loading: confirmRejectLoading,
                              // }}
                              onCancel={() => setOpenApprove(false)}
                            >
                              <Button
                                icon={<LikeOutlined />}
                                disabled={
                                  !user?.permissions?.canApproveAsPM ||
                                  currentCode > 3 ||
                                  currentCode < 2
                                }
                                onClick={() => setOpenApprove(true)}
                                type="primary"
                                className="pb-4 pt-1.5 border-none"
                              >
                                Approve
                              </Button>
                            </Popconfirm>
                          </div>
                          <div>
                            <Popconfirm
                              title="Are you sure?"
                              open={open}
                              icon={
                                <QuestionCircleOutlined
                                  style={{ color: "red" }}
                                />
                              }
                              onConfirm={() => {
                                if (reason?.length >= 3) handleOk();
                              }}
                              description={
                                <>
                                  <Input
                                    onChange={(v) => setReason(v.target.value)}
                                    placeholder="Reason for rejection"
                                  ></Input>
                                </>
                              }
                              okButtonProps={{
                                disabled: reason?.length < 3,
                                loading: confirmRejectLoading,
                              }}
                              onCancel={handleCancel}
                            >
                              <Button
                                icon={<DislikeOutlined />}
                                disabled={
                                  !user?.permissions?.canApproveAsPM ||
                                  currentCode > 3 ||
                                  currentCode < 2
                                }
                                type="primary"
                                danger
                                className="pb-4 pt-1.5 border-none"
                                onClick={showPopconfirm}
                              >
                                Reject
                              </Button>
                            </Popconfirm>
                          </div>
                        </div>
                      </div>
                    ),
                    disabled:
                      !user?.permissions?.canApproveAsPM ||
                      currentCode > 3 ||
                      currentCode < 2,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  function buildWorkflow(currentStep, tender, po) {
    return (
      <>
        <Divider></Divider>
        <div className="flex flex-col mx-3 space-y-3">
          <Typography.Title className="self-center -mt-2" level={5}>
            Workflow tracker
          </Typography.Title>
          <Steps
            // direction="horizontal"
            labelPlacement="vertical"
            size="small"
            current={currentStep}
            items={
              tender
                ? [
                    {
                      title: `Tender ${tender?.number}`,
                      description: `${tender?.status}`,
                    },
                    {
                      title: po ? `PO ${po?.number}` : "PO",
                    },
                    {
                      title: `${
                        po?.status === "started"
                          ? "Delivery started"
                          : "Delivery"
                      }`,
                      description: po
                        ? `${parseFloat(po?.deliveryProgress).toFixed(1)}%`
                        : "",
                    },
                    {
                      title: `Fully Delivered`,
                      description: `${
                        po?.deliveryProgress < 100 ? "In progress" : ""
                      }`,
                    },
                  ]
                : [
                    {
                      title: po ? `PO ${po?.number}` : "PO",
                    },
                    {
                      title: `${
                        po?.status === "started"
                          ? "Delivery started"
                          : "Delivery"
                      }`,
                      description: po
                        ? `${parseFloat(po?.deliveryProgress).toFixed(1)}%`
                        : "",
                    },
                    {
                      title: `Fully Delivered`,
                      description: `${
                        po?.deliveryProgress < 100 ? "In progress" : ""
                      }`,
                    },
                  ]
            }
          />
        </div>
      </>
    );
  }

  function buildConfirmDeliveryForm(
    po,
    handleGetProgress,
    handleUpdateProgress,
    progress,
    index,
    qty
  ) {
    // let [op, setOp] = useState(false);
    let _deliverdQty = po?.items[index]?.deliveredQty || 0;
    const disable =
      po?.status !== "started" ||
      deliveredQties[index] > qty ||
      (data?.createdBy?._id !== user?._id && !user?.permissions.canApproveAsPM);
    return (
      <div>
        {
          // po?.status === "started" && po?.deliveryProgress < 100 && (
          <div>
            {/* <div>
              <Form layout="inline" size="small">
                <Form.Item required>
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="qty delivered"
                    onChange={(value) => handleGetProgress(value)}
                  />
                </Form.Item>

                <Form.Item>
                  <Popover content="Confirm delivery">
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => {
                        handleUpdateProgress(
                          po?._id,
                          parseFloat(progress) +
                            parseFloat(po?.deliveryProgress)
                        );
                      }}
                    ></Button>
                  </Popover>
                </Form.Item>
              </Form>
            </div> */}

            <div>
              <Form className="flex gap-x-3">
                <Form.Item required>
                  <InputNumber
                    disabled={po?.status !== "started"}
                    style={{ width: "100%" }}
                    placeholder="qty delivered"
                    onChange={(value) => {
                      handleGetProgress(value);
                      setDeliveredQty(_deliverdQty + value);
                      let _deliveredQties = [...deliveredQties];
                      _deliveredQties[index] = _deliverdQty + value;
                      setDeliveredQties(_deliveredQties);
                    }}
                  />
                </Form.Item>

                <Form.Item>
                  {/* <Popover content="Confirm Quantity approved"> */}
                  <Popconfirm
                    title="Confirm Delivered Quantity"
                    open={openConfirmDeliv[index]}
                    onCancel={() => {
                      let _openConfirmDeliv = [...openConfirmDeliv];
                      _openConfirmDeliv[index] = false;
                      setOpenConfirmDeliv(_openConfirmDeliv);
                    }}
                    onConfirm={() => {
                      handleUpdateProgress(
                        po,
                        parseFloat(progress) + parseFloat(po?.deliveryProgress),
                        deliveredQties[index],
                        index
                      );

                      let _openConfirmDeliv = [...openConfirmDeliv];
                      _openConfirmDeliv[index] = false;
                      setOpenConfirmDeliv(_openConfirmDeliv);
                    }}
                  >
                    <Button
                      size="middle"
                      className={`border-none ${
                        disable ? `bg-[#9a9b9b]` : `bg-[#00CE82]`
                      } text-[#FFF] rounded-lg`}
                      icon={<CheckOutlined />}
                      onClick={() => {
                        let _openConfirmDeliv = [...openConfirmDeliv];
                        _openConfirmDeliv[index] = true;
                        setOpenConfirmDeliv(_openConfirmDeliv);
                      }}
                      disabled={disable}
                    >
                      Confirm
                    </Button>
                  </Popconfirm>
                  {/* </Popover> */}
                </Form.Item>
              </Form>
            </div>
          </div>
          // )
        }
      </div>
    );
  }

  function createPOMOdal() {
    return (
      <Modal
        title="New Purchase Order"
        centered
        open={openCreatePO}
        confirmLoading={creatingPO}
        onOk={async () => {
          setCreatingPO(true);
          let assetItems = [];
          let nonAssetItems = [];
          let docCurrency = poCurrency || "RWF";
          let assetsNeeded = false;

          items
            .filter((i) => i.itemType === "asset")
            .map((i, index) => {
              assetsNeeded = true;
              i.currency = poCurrency;
              i?.assetCodes?.map((a) => {
                assetItems?.push({
                  ItemCode: a,
                  Quantity: i.quantity / i?.assetCodes?.length,
                  UnitPrice: i.estimatedUnitCost,
                  VatGroup: i.taxGroup ? i.taxGroup : "X1",
                  Currency: poCurrency || "RWF",
                });
              });
            });

          items
            .filter((i) => i.itemType === "non-asset" || !i.itemType)
            .map((i, index) => {
              i.currency = poCurrency;
              nonAssetItems?.push({
                ItemDescription: i.title,
                Quantity: i.quantity,
                UnitPrice: i.estimatedUnitCost,
                VatGroup: i.taxGroup ? i.taxGroup : "X1",
                Currency: poCurrency || "RWF",
              });
            });

          // if (docType === "dDocument_Item") {
          //   items?.map((i, index) => {
          //     assets[index]?.map((a) => {
          //       assetItems?.push({
          //         ItemCode: a,
          //         Quantity: i.quantity / assets[index]?.length,
          //         UnitPrice: i.estimatedUnitCost,
          //         VatGroup: i.taxGroup ? i.taxGroup : "X1",
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
            setCreatingPO(false);
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
            setCreatingPO(false);
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
            setCreatingPO(false);
          } else if (assetsNeeded && assetItems.length < 1) {
            messageApi.open({
              type: "error",
              content: "PO can not be submitted. Please select an asset!",
            });
            setCreatingPO(false);
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
              signatories,
              data?._id,
              refDoc === "Direct Contracting" ? reqAttachId : ""
            );
            setCreatingPO(false);
            setOpenCreatePO(false);
          }
        }}
        okText="Save and Submit"
        onCancel={() => setOpenCreatePO(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
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
            <div>
              <div className="mb-3">
                <label>Purchase Order Currency</label>
              </div>
              <Form.Item
                name="currency"
                rules={[
                  {
                    required: true,
                    message: "Currency is required",
                  },
                ]}
              >
                <Select
                  defaultValue={data?.currency}
                  value={poCurrency}
                  // disabled={disable}
                  size="large"
                  className="w-full"
                  onChange={(value) => setPoCurrency(value)}
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
                />
              </Form.Item>
            </div>
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
                  KG 9 Avenue, Nyarutarama Kigali Rwanda
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
          <div className="flex flex-col space-y-5">
            {docType === "dDocument_Item" && (
              <div className="flex flex-col">
                <Typography.Title level={4}>Asset assignment</Typography.Title>
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
            <ItemsTableB1
              dataSource={items}
              setDataSource={setItems}
              assetOptions={assetOptions}
              currency={poCurrency}
            />
            <Typography.Title level={5} className="self-end">
              Total (Tax Excl.): {poCurrency + " " + totalVal?.toLocaleString()}
            </Typography.Title>
            <Typography.Title level={5} className="self-end">
              Total Tax: {poCurrency + " " + totalTax?.toLocaleString()}
            </Typography.Title>
            <Typography.Title level={4} className="self-end">
              Gross Total: {poCurrency + " " + grossTotal?.toLocaleString()}
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
                            <div className="text-xs">Email</div>
                          </Typography.Text>
                          {s?.onBehalfOf === "Irembo Ltd" && (
                            <Select
                              showSearch={true}
                              className="w-full"
                              onChange={(e) => {
                                let _signatories = [...signatories];
                                _signatories[index].email = e;
                                _signatories[index].names =
                                  users?.find((user) => user?.email == e)
                                    ?.firstName +
                                  " " +
                                  users?.find((user) => user?.email == e)
                                    ?.lastName;

                                setSignatories(_signatories);
                              }}
                              options={users?.map((user, i) => {
                                return {
                                  value: user?.email,
                                  label: user?.email,
                                };
                              })}
                            />
                          )}
                          {s?.onBehalfOf !== "Irembo Ltd" && (
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
                          )}
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
                    let nSignatories = signs.length;
                    let lastSignatory = signs[nSignatories - 1];
                    let lastIsIrembo =
                      lastSignatory?.onBehalfOf === "Irembo Ltd";
                    if (lastIsIrembo) signs.push(newSignatory);
                    else {
                      signs.splice(lastSignatory - 1, 0, newSignatory);
                    }
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

              {/* <div
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
              </div> */}
            </div>
          </div>
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
        // onOk={() => {
        //   if (!signatories || signatories?.length < 2) {
        //     messageApi.open({
        //       type: "error",
        //       content:
        //         "Contract can not be submitted. Please specify at least 2 signatories!",
        //     });
        //   } else if (
        //     signatories?.filter((s) => {
        //       return !s?.onBehalfOf || !s?.title || !s?.names || !s?.email;
        //     })?.length >= 1
        //   ) {
        //     messageApi.open({
        //       type: "error",
        //       content:
        //         "Contract can not be submitted. Please fill in the relevant signatories' details!",
        //     });
        //   } else if (
        //     signatories?.filter((s) => {
        //       return !s?.onBehalfOf.includes("Irembo");
        //     })?.length < 1
        //   ) {
        //     messageApi.open({
        //       type: "error",
        //       content:
        //         "Contract can not be submitted. Please supply the Vendor's information!",
        //     });
        //   } else if (!contractStartDate || !contractEndDate) {
        //     messageApi.open({
        //       type: "error",
        //       content:
        //         "Contract can not be submitted. Please set start and end dates!",
        //     });
        //   } else {
        //     handleCreateContract(
        //       vendor?._id,
        //       null,
        //       user?._id,
        //       sections,
        //       contractStartDate,
        //       contractEndDate,
        //       signatories,
        //       refDoc === "Direct Contracting" ? reqAttachId : ""
        //     );
        //     setOpenCreateContract(false);
        //   }
        // }}
        footer={[
          <Button
            key="2"
            onClick={() => {
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
                setEmptySignatory([
                  {
                    email: "",
                    names: "",
                    onBehalfOf: "Irembo Ltd",
                    title: "Procurement Manager",
                  },
                ]);
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
                  null,
                  user?._id,
                  sections,
                  contractStartDate,
                  contractEndDate,
                  signatories,
                  refDoc === "Direct Contracting" ? reqAttachId : "",
                  "draft",
                  contractTitle,
                  contractSenderParty,
                  contractReceiverParty
                );
                setOpenCreateContract(false);
              }
            }}
          >
            Save draft
          </Button>,
          <Popconfirm
            title="Are you sure?"
            onConfirm={() => {
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
                setEmptySignatory([
                  {
                    email: "",
                    names: "",
                    onBehalfOf: "Irembo Ltd",
                    title: "Procurement Manager",
                  },
                ]);
                messageApi.open({
                  type: "error",
                  duration: 10,
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
                  null,
                  user?._id,
                  sections,
                  contractStartDate,
                  contractEndDate,
                  signatories,
                  refDoc === "Direct Contracting" ? reqAttachId : "",
                  "legal-review",
                  contractTitle,
                  contractSenderParty,
                  contractReceiverParty
                );
                setOpenCreateContract(false);
              }
            }}
          >
            <Button key="3" type="primary">
              Submit for review
            </Button>
          </Popconfirm>,
        ]}
        // okText="Submit for review"
        onCancel={() => setOpenCreateContract(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <div className="space-y-10 px-20 py-5">
          {contextHolder}
          <Typography.Title
            level={4}
            className="flex flex-row"
            editable={{
              text: contractTitle,
              onChange: (e) => {
                // let _signatories = [...signatories];
                // _signatories[index].title = e;
                // setSignatories(_signatories);
                setContractTitle(e);
              },
            }}
          >
            {contractTitle}
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
              <div className="flex flex-col space-y-1">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Name</div>
                </Typography.Text>
                <Typography.Text
                  strong
                  // editable={{
                  //   text: contractSender,
                  //   onChange: (e) => {
                  //     setContractSender(e);
                  //   },
                  // }}
                >
                  Irembo Ltd
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  KG 9 Avenue, Nyarutarama Kigali Rwanda
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>102911562</Typography.Text>
              </div>

              <div className="flex flex-col space-y-1">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text
                  strong
                  editable={{
                    text: contractSenderParty,
                    onChange: (e) => {
                      setContractSenderParty(e);
                    },
                  }}
                >
                  {contractSenderParty}
                </Typography.Text>
              </div>
            </div>

            <div className="flex flex-col ring-1 ring-gray-300 rounded p-5 space-y-3">
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Name</div>
                </Typography.Text>
                <Typography.Text
                  strong
                  // editable={{
                  //   text: contractReceiver,
                  //   onChange: (e) => {
                  //     setContractReceiver(e);
                  //   },
                  // }}
                >
                  {vendor?.companyName}
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  {vendor?.hdAddress}-{vendor?.country}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>{vendor?.tin}</Typography.Text>
              </div>
              <div className="flex flex-col space-y-1">
                <Typography.Text type="secondary">
                  <div className="text-xs">Hereinafter refferd to as</div>
                </Typography.Text>
                <Typography.Text
                  strong
                  editable={{
                    text: contractReceiverParty,
                    onChange: (e) => {
                      setContractReceiverParty(e);
                    },
                  }}
                >
                  {contractReceiverParty}
                </Typography.Text>
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
            {/* {signatories.map((s, index) => {
              return (
                <div
                  key={index}
                  className={`flex flex-col ring-2 ${
                    emptySignatory &&
                    emptySignatory[0]?.onBehalfOf == s?.onBehalfOf
                      ? `ring-red-500`
                      : `ring-gray-300`
                  } rounded py-5`}
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
            })} */}

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
                          <div className="text-xs">Email</div>
                        </Typography.Text>
                        {s?.onBehalfOf === "Irembo Ltd" && (
                          <Select
                            showSearch={true}
                            className="w-full"
                            onChange={(e) => {
                              let _signatories = [...signatories];
                              _signatories[index].email = e;
                              _signatories[index].names =
                                users?.find((user) => user?.email == e)
                                  ?.firstName +
                                " " +
                                users?.find((user) => user?.email == e)
                                  ?.lastName;

                              setSignatories(_signatories);
                            }}
                            options={users?.map((user, i) => {
                              return {
                                value: user?.email,
                                label: user?.email,
                              };
                            })}
                          />
                        )}
                        {s?.onBehalfOf !== "Irembo Ltd" && (
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
                        )}
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
                  let nSignatories = signs.length;
                  let lastSignatory = signs[nSignatories - 1];
                  let lastIsIrembo = lastSignatory?.onBehalfOf === "Irembo Ltd";
                  if (lastIsIrembo) signs.push(newSignatory);
                  else {
                    signs.splice(lastSignatory - 1, 0, newSignatory);
                  }
                  // signs.push(newSignatory);
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

  function getPoTotalVal() {
    let t = 0;
    let tax = 0;
    poItems?.map((i) => {
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
    //     <MyPdfViewer fileUrl={`${url}/file/termsOfReference/${attachmentId}`} />
    //   </Modal>
    // );
  }

  function documentFullySigned(document) {
    let totSignatories = document?.signatories;
    let signatures = document?.signatories?.filter((s) => s.signed);

    return totSignatories?.length === signatures?.length;
  }

  function handleStartDelivery(po) {
    setStartingDelivery(true);
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
      .then((res) => res.json())
      .then((res) => {
        setStartingDelivery(false);
        if (res?.error) {
        } else {
          if (tender) checkPOExists(tender);
          else checkDirectPOExists(data);
        }
      });
  }

  function _setFileList(list) {
    setFileList(list);
  }

  function _setFiles(newFileList) {
    setFiles(newFileList);
    setFilePaths(newFileList);
  }

  const handleItemClick = (value) => {
    setActiveIndex((prevIndex) =>
      value && prevIndex == -1 && approvalShow
        ? ""
        : value && prevIndex == "" && !approvalShow
        ? value
        : prevIndex === value
        ? ""
        : value
    );
    setApprovalShow(false);
  };

  function updateRequest(_files) {
    setLoadingRowData(true);
    let newStatus =
      rowData?.status == "withdrawn" || rowData?.status == "declined"
        ? "pending"
        : rowData?.status;

    rowData.status = newStatus;

    let reqItems = [...rowData.items];
    reqItems?.map((v, index) => {
      if (_files?.length > index) {
        if (_files[index]?.every((item) => typeof item === "string")) {
          v.paths = _files[index];
          return v;
        } else {
          // console.log("Uploooooodiiing", _files[index]);
          // messageApi.error("Something went wrong! Please try again.");\
          v.paths = null;
          return v;
        }
      } else {
        v.paths = null;
        return v;
      }
    });

    // rowData.items = reqItems;

    fetch(`${url}/requests/${rowData?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        updates: rowData,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        // setFileList([])
        // setFiles([])
        loadData();
        setLoadingRowData(false);
      })
      .catch((err) => {
        setLoadingRowData(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      })
      .finally(() => {
        setEditRequest(false);
      });
  }

  const disable =
    ((data?.level1Approver?._id === user?._id ||
      data?.createdBy?._id === user?._id) &&
      data?.status.startsWith("approved")) ||
    data?.status === "withdrawn" ||
    data?.status === "archived" ||
    data?.status === "approved" ||
    data?.status === "approved (pm)";

  const bounceVariants = {
    initial: {
      opacity: 0,
      y: 100,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 3,
        stiffness: 40,
      },
    },
  };

  return (
    <div className="request-details grid lg:grid-cols-5 gap-4 items-start h-screen mb-2 overflow-y-auto">
      {contextHolder}
      <div className="lg:col-span-4">
        <div className="flex flex-col ring-1 ring-gray-200 lg:pl-5 lg:pr-8 rounded-lg bg-white border-0">
          {data && (
            <Form form={form}>
              <div className="flex items-center justify-between m-3 mb-2">
                <h4>Request Details</h4>
                <div className="flex gap-x-2">
                  <Tag
                    color={
                      data?.status === "declined" ||
                      data?.status === "withdrawn" ||
                      data?.status === "archived"
                        ? "red"
                        : data?.status === "approved" ||
                          data?.status === "approved (pm)"
                        ? "geekblue"
                        : "orange"
                    }
                  >
                    {data?.status === "declined" ||
                    data?.status === "approved" ||
                    data?.status === "approved (pm)" ||
                    data?.status === "withdrawn" ||
                    data?.status === "archived"
                      ? data?.status
                      : "pending"}
                  </Tag>
                  {data?.status == "declined" && (
                    <Tooltip
                      title={data?.reasonForRejection}
                      className="cursor-pointer bg-transparent p-0.5 rounded-full mt-0.5"
                    >
                      <TiInfoLarge className="text-[#344767] w-6 h-6" />
                    </Tooltip>
                  )}
                </div>
              </div>
              <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-5 ml-3">
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-[#000000e0] text-[14px]">
                      Request Title
                    </label>
                    <div className="text-red-500">*</div>
                  </div>
                  <Form.Item
                    initialValue={data?.title}
                    name="title"
                    rules={[
                      {
                        required: true,
                        message: "Request Title is required",
                      },
                    ]}
                  >
                    <Input
                      // defaultValue={data.title}
                      value={data?.title}
                      onChange={({ target }) => {
                        let r = { ...data };
                        r.title = target.value;
                        handleUpdateRequest(r);
                      }}
                      className="h-11 mt-3"
                      disabled={disable}
                    />
                  </Form.Item>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-[#000000e0] text-[14px]">
                      Request Number
                    </label>
                    <div className="text-red-500">*</div>
                  </div>
                  <p className="pt-1 text-[17px]">
                    <small>{data?.number}</small>
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-[#000000e0] text-[14px]">
                      Initiator
                    </label>
                    <div className="text-red-500">*</div>
                  </div>
                  <p className="pt-1 text-[17px]">
                    <small>
                      {data?.createdBy?.firstName +
                        " " +
                        data?.createdBy?.lastName}
                    </small>
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <label className="text-[#000000e0] text-[14px]">
                      Department
                    </label>
                    <div className="text-red-500">*</div>
                  </div>
                  <p className="pt-1 text-[17px]">
                    <small>{data?.createdBy?.department?.description}</small>
                  </p>
                </div>
              </div>
              <div className="grid lg:grid-cols-4 gap-5 ml-3">
                <div>
                  <label className="text-[#000000e0] text-[14px]">
                    Service category:
                  </label>
                  <Form.Item
                    initialValue={data?.serviceCategory}
                    name="ServiceCategory"
                    rules={[
                      {
                        required: true,
                        message: "Service Category is required",
                      },
                    ]}
                  >
                    <Select
                      // mode="multiple"
                      // allowClear
                      className="mt-3 w-full"
                      size="large"
                      value={data?.serviceCategory}
                      placeholder="Please select"
                      onChange={(value) => {
                        let r = { ...data };
                        r.serviceCategory = value;
                        handleUpdateRequest(r);
                      }}
                      disabled={disable}
                    >
                      {servCategories?.map((s) => {
                        return (
                          <Select.Option key={s._id} value={s.description}>
                            {s.description}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </div>
                <div>
                  <label className="text-[#000000e0] text-[14px]">
                    Purchase Request Currency:
                  </label>
                  <div className="text-xs text-gray-400">
                    <Form.Item
                      initialValue={data?.currency}
                      name="currency"
                      rules={[
                        {
                          required: true,
                          message: "Currency is required",
                        },
                      ]}
                    >
                      <Select
                        // defaultValue={budgetLine}
                        className="mt-3 w-full"
                        size="large"
                        placeholder="Select currency"
                        showSearch
                        value={data?.currency}
                        disabled={disable}
                        onChange={(value, option) => {
                          let r = { ...data };
                          r.currency = value;
                          let items = r.items.map((i) => {
                            i.currency = value;
                            return i;
                          });
                          r.items = items;
                          handleUpdateRequest(r);
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
                        options={[
                          { label: "RWF", value: "RWF" },
                          { label: "USD", value: "USD" },
                          { label: "EUR", value: "EUR" },
                          { label: "GBP", value: "GBP" },
                        ]}
                      ></Select>
                    </Form.Item>
                  </div>
                </div>
                <div className="flex flex-col col-span-2">
                  <label className="text-[#000000e0] text-[14px]">
                    Description:
                  </label>
                  <Form.Item
                    initialValue={data?.description}
                    name="description"
                    rules={[
                      {
                        required: true,
                        message: "Description is required",
                      },
                    ]}
                  >
                    <Input.TextArea
                      value={data.description}
                      className={`w-full mt-3 text-red-500`}
                      onChange={({ target }) => {
                        let r = { ...data };
                        r.description = target.value;
                        handleUpdateRequest(r);
                      }}
                      placeholder="Briefly describe your request"
                      showCount
                      maxLength={100}
                      rows={4}
                      disabled={disable}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-5 ml-3">
                <div>
                  <label className="text-[#000000e0] text-[14px]">
                    Request Budgeted?
                  </label>
                  <div>
                    <Form.Item
                      name="budgeted"
                      initialValue={data?.budgeted}
                      // wrapperCol={{ offset: 8, span: 16 }}
                    >
                      <Radio.Group
                        onChange={({ target }) => {
                          let r = { ...data };
                          r.budgeted = target.value;
                          handleUpdateRequest(r);
                        }}
                        className="mt-3"
                        defaultValue={data.budgeted}
                        disabled={disable}
                      >
                        <Radio value={true} className="mr-3">
                          <span className="ml-2 text-[18px]">Yes</span>
                        </Radio>
                        <Radio value={false} className="mx-3">
                          <span className="ml-2 text-[18px]">No</span>
                        </Radio>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                </div>
                {data.budgeted && (
                  <div>
                    <label className="text-[#000000e0] text-[14px]">
                      Budgeted Line:
                    </label>
                    <div className="text-xs text-gray-400">
                      <Select
                        // defaultValue={budgetLine}
                        className="mt-3 w-full"
                        size="large"
                        placeholder="Select service category"
                        showSearch
                        value={data?.budgetLine?._id}
                        disabled={disable}
                        onChange={(value, option) => {
                          alert(value);
                          let r = { ...data };
                          r.budgetLine = value;
                          handleUpdateRequest(r);
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
                        options={budgetLines
                          .filter((s) => s.visible == true)
                          .map((s) => {
                            return {
                              label: s.description.toUpperCase(),
                              options: s.budgetlines
                                .filter((s) => s.visible == true)
                                .map((sub) => {
                                  return {
                                    label: sub.description,
                                    value: sub._id,
                                    title: sub.description,
                                  };
                                }),
                            };
                          })}
                      ></Select>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[#000000e0] text-[14px]">
                    Due Date:
                  </label>
                  <Form.Item
                    initialValue={dayjs(data?.dueDate)}
                    name="dueDate"
                    rules={[
                      {
                        required: true,
                        message: "Due date is required",
                      },
                    ]}
                  >
                    <DatePicker
                      className="mt-3 h-11 w-full"
                      // defaultValue={dayjs(data?.dueDate)}
                      disabledDate={(current) =>
                        current.isBefore(dayjs().subtract(1, "day"))
                      }
                      value={dayjs(data?.dueDate)}
                      onChange={(v, dstr) => {
                        let _d = data;
                        _d.dueDate = dstr;
                        handleUpdateRequest(_d);
                      }}
                      disabled={disable}
                    />
                  </Form.Item>
                </div>
              </div>

              <h3 className="mt-5 font-bold text-[15px]">
                Request specifications
              </h3>
              <div className="mb-10 border-2 border-[#732083]">
                <ItemsTable
                  setDataSource={(v) => {
                    setValues(v);
                    let r = { ...data };
                    r.items = v;
                    handleUpdateRequest(r);
                  }}
                  dataSource={values}
                  currency={data.currency}
                  fileList={fileList}
                  setFileList={_setFileList}
                  files={files}
                  setFiles={_setFiles}
                  editingRequest={true}
                  disable={disable ? true : false}
                  noItemDocs={
                    data?.supportingDocs && data?.supportingDocs?.length >= 1
                  }
                />
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-[#000000e0] text-[14px]">
                  Supporting Documents
                </label>
                {
                  disable &&
                    (data?.supportingDocs ||
                      data?.supportingDocs?.length >= 1) && (
                      <div className="flex flex-col">
                        {data?.supportingDocs?.map((p, i) => {
                          return (
                            <div key={p}>
                              {
                                <Link
                                  // href={`${url}/file/termsOfReference/${p}`}
                                  href={`${fendUrl}/api?folder=termsOfReference&name=${p}`}
                                  target="_blank"
                                >
                                  <Typography.Link
                                    className="flex flex-row items-center space-x-2"
                                    // onClick={() => {
                                    //   setPreviewAttachment(!previewAttachment);
                                    //   setAttachmentId(p);
                                    // }}
                                  >
                                    <div>{p} </div>{" "}
                                    <div>
                                      <PaperClipIcon className="h-4 w-4" />
                                    </div>
                                  </Typography.Link>
                                </Link>
                              }
                            </div>
                          );
                        })}
                      </div>
                    )
                  // (
                  //   <div className="items-center justify-center flex flex-col">
                  //     <div>
                  //       <RectangleStackIcon className="h-5 w-5 text-gray-200" />
                  //     </div>
                  //     <div className="text-xs text-gray-400">No docs found</div>
                  //   </div>
                  // ))
                }
                {!disable && data?.supportingDocs && (
                  <UploadOtherFiles files={files} setFiles={setFiles} />
                )}

                {(!data?.supportingDocs ||
                  data?.supportingDocs?.length == 0) && (
                  <div className="items-center justify-center flex flex-col">
                    <div>
                      <RectangleStackIcon className="h-5 w-5 text-gray-200" />
                    </div>
                    <div className="text-xs text-gray-400">No docs found</div>
                  </div>
                )}

                {/* {!filesAreSet  && data?.supportingDocs || data?.supportingDocs?.length >= 1 && <Spin indicator={antIcon} />} */}
                {/* {files?.length == 0 && (
                  <div className="items-center justify-center flex flex-col">
                    <div>
                      <RectangleStackIcon className="h-5 w-5 text-gray-200" />
                    </div>
                    <div className="text-xs text-gray-400">No docs found</div>
                  </div>
                )} */}
              </div>
              {!disable && (
                <div className="flex justify-end gap-5 mb-5">
                  {data?.createdBy?._id === user?._id && (
                    <Popconfirm
                      title="Are you sure?"
                      open={openWithdraw}
                      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                      onConfirm={() => {
                        changeStatus(5);
                        setOpenWithdraw(false);
                      }}
                      // okButtonProps={{
                      //   loading: confirmRejectLoading,
                      // }}
                      onCancel={() => setOpenWithdraw(false)}
                    >
                      <Button
                        type="primary"
                        danger
                        onClick={() => setOpenWithdraw(true)}
                        className="rounded-lg px-5 pt-0.5s pb-6 bg-[#F5365C] border-none"
                      >
                        Withdraw request
                      </Button>
                    </Popconfirm>
                  )}

                  <Popconfirm
                    title="Are you sure?"
                    open={openUpdate}
                    icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    onConfirm={() => {
                      handleUpload();
                      setOpenUpdate(false);
                    }}
                    // okButtonProps={{
                    //   loading: confirmRejectLoading,
                    // }}
                    onCancel={() => setOpenUpdate(false)}
                  >
                    <button
                      className="bg-[#0065DD] rounded-lg px-5 py-2 border-none cursor-pointer"
                      onClick={async () => {
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
                            setOpenUpdate(true);
                          }
                        } else {
                          messageApi.error("Please add atleast one item!");
                        }
                      }}
                    >
                      <small className="py-5 text-[15px] text-white">
                        Update
                      </small>
                    </button>
                  </Popconfirm>
                </div>
              )}

              {user?.permissions?.canApproveAsPM &&
                data?.status == "approved (pm)" && (
                  <div className="flex justify-end gap-5 mb-5">
                    <Popconfirm
                      title="Are you sure?"
                      open={openArchive}
                      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                      onConfirm={() => {
                        changeStatus(7);
                        setOpenArchive(false);
                      }}
                      // okButtonProps={{
                      //   loading: confirmRejectLoading,
                      // }}
                      onCancel={() => setOpenArchive(false)}
                    >
                      <Button
                        type="primary"
                        danger
                        onClick={() => setOpenArchive(true)}
                        className="rounded-lg px-5 pt-0.5s pb-6 bg-[#F5365C] border-none"
                      >
                        Archive request
                      </Button>
                    </Popconfirm>
                  </div>
                )}
            </Form>
          )}
          {createPOMOdal()}
          {previewAttachmentModal()}
          {createContractMOdal()}
        </div>
        <div className="md:col-span-4 flex pb-8 flex-col px-6 rounded-lg bg-white lg:mb-24 mb-10">
          <Divider />
          <h4 className="mb-1 text-[15px] mt-0 pt-0">Request Process</h4>
          <div className="-my-3.5">
            <button
              className={`cursor-pointer w-full pr-5 flex justify-between items-center bg-transparent border-none ${
                activeIndex == "delivery" ? "active" : ""
              }`}
              onClick={() => handleItemClick("request")}
            >
              <div className="flex flex-col items-start justify-start gap-4">
                <h6 className="text-[#344767] font-semibold text-[14px] -mb-1">
                  Request Approval Process
                </h6>
                <span className="text-[#8392AB]">
                  Proceed with approving the above request by adding your stamp
                  mark where needed
                </span>
              </div>
              <RiArrowDropDownLine
                size={34}
                className={`text-[48px] text-[#344767] arrow ${
                  activeIndex == "request" || (data && approvalShow)
                    ? "active"
                    : ""
                }`}
              />
            </button>
            <div
              ref={contentHeight}
              className="answer-container"
              style={
                activeIndex == "request" || (data && approvalShow)
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              <div>
                {
                  // data?.status !== "approved" &&
                  //   data?.status !== "po created" &&
                  //   data?.status !== "declined" &&
                  currentCode !== 5 &&
                    buildApprovalFlow(
                      currentCode,
                      changeStatus,
                      submitTenderData,
                      setDeadLine,
                      open,
                      handleOk,
                      setReason,
                      confirmRejectLoading,
                      handleCancel,
                      showPopconfirm,
                      data?.approvalDate,
                      refDoc,
                      setRefDoc,
                      contracts,
                      submitPOData,
                      setSelectedContract,
                      data,
                      submitContractData,
                      setTendeDocSelected,
                      form
                    )
                }
              </div>
            </div>
          </div>
          <div ref={scrollRef} className="my-0">
            <button
              className={`w-full pr-5 flex justify-between items-center bg-transparent cursor-pointer border-none ${
                activeIndex == "delivery" ? "active" : ""
              }`}
              onClick={() => handleItemClick("delivery")}
            >
              <div className="flex flex-col items-start justify-start gap-4">
                <h6 className="text-[#344767] text-[14px] font-semibold -mb-1">
                  Delivery Tracking
                </h6>
                <span className="text-[#8392AB]">
                  Proceed with approving the above request by adding your stamp
                  mark where needed
                </span>
              </div>
              <RiArrowDropDownLine
                size={34}
                className={`text-[48px] text-[#344767] arrow ${
                  activeIndex == "delivery" ? "active" : ""
                }`}
              />
            </button>
            <div
              ref={contentHeight}
              className="answer-container"
              style={
                activeIndex == "delivery"
                  ? { display: "block" }
                  : { display: "none" }
              }
            >
              {currentCode !== 5 && (
                <div className="w-full">
                  <div className="ml-3 mt-6">
                    <Button
                      className="bg-[#F3F5FF] px-4 border-none rounded-xl text-[#3287FF]"
                      disabled={
                        !documentFullySigned(po) ||
                        po?.status == "started" ||
                        !po?.status ||
                        user._id !== data?.createdBy?._id
                      }
                      size="middle"
                      loading={startingDelivery}
                      // icon={<PlaySquareOutlined />}
                      onClick={() => handleStartDelivery(po)}
                    >
                      Delivery has started
                    </Button>
                  </div>

                  {data?.items?.map((i, index) => {
                    let deliveredQty = po?.items[index]?.deliveredQty || 0;
                    return (
                      <div
                        key={i.key}
                        className="flex justify-between w-full mt-5"
                      >
                        <div className="ml-5">
                          {i.title}: {deliveredQty || 0} delivered out of{" "}
                          {i?.quantity}
                        </div>
                        <div>
                          {deliveredQty < parseInt(i?.quantity) &&
                            buildConfirmDeliveryForm(
                              po,
                              handleGetProgress,
                              handleUpdateProgress,
                              progress,
                              index,
                              i?.quantity
                            )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="ml-3 w-1/3">
                    {/* <div>Delivery progress</div> */}
                    <Progress
                      percent={_.round(po?.deliveryProgress, 1) || 0}
                      size="small"
                      status="active"
                    />
                  </div>

                  {/* {data?.status === "approved" &&
                      (tender || po) &&
                      buildWorkflow(currentStep, tender, po)} */}

                  {po &&
                    _.round(po?.deliveryProgress, 1) >= 100 &&
                    !po.rate && (
                      <div className="justify-center items-center w-full flex flex-col space-y-3">
                        <Divider></Divider>
                        <Typography.Title level={5}>
                          Supplier & Delivery Rate
                        </Typography.Title>
                        <Rate
                          // allowHalf
                          disabled={user?._id !== data?.createdBy?._id}
                          defaultValue={po?.rate || rate}
                          tooltips={[
                            "Very bad",
                            "Bad",
                            "Good",
                            "Very good",
                            "Excellent",
                          ]}
                          onChange={(value) => setRate(value)}
                          // onChange={(value) => handleRateDelivery(po, value)}
                        />

                        <Typography.Title level={5}>
                          Give a comment on your rating
                        </Typography.Title>
                        <Input.TextArea
                          className="w-1/3"
                          value={comment}
                          onChange={(v) => setComment(v.target.value)}
                        />

                        <div>
                          <Button
                            type="primary"
                            onClick={() =>
                              handleRateDelivery(po, rate, comment)
                            }
                          >
                            Submit my rate and review
                          </Button>
                        </div>
                      </div>
                    )}

                  {po && _.round(po?.deliveryProgress, 1) >= 100 && po.rate && (
                    <div className="w-full flex flex-col space-y-3">
                      <Divider></Divider>
                      <Typography.Title level={5}>
                        Supplier & Delivery Rate
                      </Typography.Title>
                      <Rate
                        // allowHalf
                        disabled={true}
                        defaultValue={po?.rate || rate}
                        tooltips={[
                          "Very bad",
                          "Bad",
                          "Good",
                          "Very good",
                          "Excellent",
                        ]}
                      />

                      <div className="flex flex-row">
                        <Typography.Text>
                          {data?.createdBy?.firstName}{" "}
                          {data?.createdBy?.lastName} commented:
                        </Typography.Text>
                        <Typography.Text code>{po.rateComment}</Typography.Text>
                      </div>
                    </div>
                  )}

                  {/* {po && po.deliveryProgress >= 100 && po.rate && (
                      <div className="justify-center items-center w-full flex flex-col space-y-3">
                        <Divider></Divider>
                        <Typography.Title level={5}>
                          Supplier & Delivery Rate
                        </Typography.Title>
                        <Rate
                          // allowHalf
                          disabled
                          defaultValue={po?.rate}
                          tooltips={[
                            "Very bad",
                            "Bad",
                            "Good",
                            "Very good",
                            "Excellent",
                          ]}
                          // onChange={(value) => setRate(value)}
                          // onChange={(value) => handleRateDelivery(po, value)}
                        />

                        <Typography.Text level={5}>
                          {po?.comment}
                        </Typography.Text>
                      </div>
                    )} */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col rounded bg-white px-5 shadow">
          <Typography.Title level={5} className="pb-4">
            Workflow tracker
          </Typography.Title>
          <Timeline
            // mode="alternate"
            items={[
              {
                children: (
                  <div className="flex flex-col mb-1">
                    <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                      Purchase Requisition
                    </h6>
                    <small className="text-[#A3AEB4]">
                      Initiate your purchase request
                    </small>
                  </div>
                ),
                color: data?.status !== "declined" ? "blue" : "red",
                dot: data?.status !== "declined" && (
                  <FiShoppingBag className=" text-[#01AF65]" />
                ),
              },
              {
                children: (
                  <div className="flex flex-col mb-1">
                    <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                      Request Approval
                    </h6>
                    <small className="text-[#A3AEB4]">
                      Review the submitted request
                    </small>
                  </div>
                ),
                color:
                  data?.status === "approved (pm)" ||
                  data?.status === "approved" ||
                  tender
                    ? "blue"
                    : "gray",
                dot: (data?.status === "approved (pm)" ||
                  tender ||
                  data?.status === "approved") && (
                  <IoMdCheckboxOutline className=" text-[#01AF65]" />
                ),
              },
              {
                children: (
                  <div className="flex flex-col mb-1">
                    <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                      Tendering
                    </h6>
                    <small className="text-[#A3AEB4]">
                      Find qualified vendors
                    </small>
                  </div>
                ),
                color: tender ? "blue" : "gray",
                dot: tender && <MdFileCopy className=" text-[#01AF65]" />,
              },
              {
                color: contract ? "blue" : "gray",
                children: (
                  <div className="flex flex-col mb-1">
                    <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                      Contracting
                    </h6>
                    <small className="text-[#A3AEB4]">
                      Choose the best vendor for your needs
                    </small>
                  </div>
                ),
                dot: contract && <MdAttachFile className=" text-[#01AF65]" />,
              },
              {
                children: (
                  <div className="flex flex-col mb-1">
                    <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                      Purchase Order
                    </h6>
                    <small className="text-[#A3AEB4]">
                      Order the needed items
                    </small>
                  </div>
                ),
                color: po ? "blue" : "gray",
                dot: po && <BiPurchaseTagAlt className=" text-[#01AF65]" />,
              },
              {
                children: (
                  <div className="flex flex-col mb-1">
                    <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                      Delivery
                    </h6>
                    <small className="text-[#A3AEB4]">
                      Track the delivery of your items
                    </small>
                  </div>
                ),
                color: progress >= 100 ? "blue" : "gray",
                dot: po && progress >= 100 && (
                  <TbTruckDelivery className=" text-[#01AF65]" />
                ),
              },
            ]}
          />
        </div>
        <Transition.Root show={show} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={handleClose}>
            <Transition.Child
              as={Fragment}
              enter="ease-in-out duration-500"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in-out duration-500"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                  <Transition.Child
                    as={Fragment}
                    enter="transform transition ease-in-out duration-500 sm:duration-700"
                    enterFrom="translate-x-full"
                    enterTo="translate-x-0"
                    leave="transform transition ease-in-out duration-500 sm:duration-700"
                    leaveFrom="translate-x-0"
                    leaveTo="translate-x-full"
                  >
                    <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4"></div>
                      </Transition.Child>
                      <div className="flex h-full flex-col bg-white py-6 shadow-xl w-full">
                        <div className="flex justify-between pl-4 -pr-10 sm:px-6">
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Details
                          </Dialog.Title>
                          <button
                            type="button"
                            className="border-0 rounded-md bg-transparent text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => handleClose()}
                          >
                            <XMarkIcon
                              className="h-5 w-5 text-red-500"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                        <div className="border-x-0 border-b-0 border-t border-[#BBBBBBEE] border-solid px-4 sm:px-6 mt-5">
                          <div className="flex items-center gap-x-5">
                            <button
                              className={`bg-transparent py-3 my-3 ${
                                tab == 0
                                  ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 border-solid text-[#263238] px-4`
                                  : `border-none text-[#8392AB]`
                              } text-[14px] cursor-pointer`}
                              onClick={() => setTab(0)}
                            >
                              Related Docs
                            </button>
                            <button
                              className={`bg-transparent py-3 my-3 ${
                                tab == 1
                                  ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 border-solid text-[#263238] px-4`
                                  : `border-none text-[#8392AB]`
                              } text-[14px] cursor-pointer`}
                              onClick={() => setTab(1)}
                            >
                              Audit Tracking
                            </button>
                          </div>
                        </div>
                        {tab == 0 ? (
                          <div>
                            {tender && data?.sourcingMethod === "Tendering" && (
                              <>
                                <h4 className="mb-2 mt-4 font-semibold ml-6">
                                  Tender Reference
                                </h4>
                                <div className="flex flex-col gap-y-1 ml-5 bg-[#F8F9FA] p-3 my-1">
                                  <Link
                                    href={`/system/tenders/${tender?._id}`}
                                    className="font-bold text-[16px] no-underline text-blue-600"
                                  >
                                    {tender?.number}
                                  </Link>
                                </div>
                              </>
                            )}
                            {contract &&
                              (data?.sourcingMethod === "Direct Contracting" ||
                                data?.sourcingMethod ===
                                  "From Existing Contract") && (
                                <>
                                  <h4 className="mb-2 mt-4 font-semibold ml-6">
                                    Contract Reference
                                  </h4>
                                  <div className="flex flex-col gap-y-1 ml-5 bg-[#F8F9FA] p-3 my-1">
                                    <Link
                                      href={`/system/contracts/${contract?._id}`}
                                      className="font-bold text-[16px] no-underline text-blue-600"
                                    >
                                      {contract?.number}
                                    </Link>
                                  </div>
                                </>
                              )}
                            {po &&
                              (data?.sourcingMethod === "Direct Contracting" ||
                                data?.sourcingMethod ===
                                  "From Existing Contract") && (
                                <>
                                  <h4 className="mb-2 mt-4 font-semibold ml-6">
                                    PO Reference
                                  </h4>
                                  <div className="flex flex-col gap-y-1 ml-5 bg-[#F8F9FA] p-3 my-1">
                                    <Link
                                      href={`/system/purchase-orders/${po?._id}`}
                                      className="font-bold text-[16px] no-underline text-blue-600"
                                    >
                                      {po?.number}
                                    </Link>
                                  </div>
                                </>
                              )}
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg pb-4 px-5">
                            {contextHolder}
                            {}
                            <Timeline
                              className="mt-8"
                              // mode="alternate"
                              items={
                                prActivityData.length > 0 ? (
                                  prActivityData
                                    .filter((item) => item?.meta?.moduleMessage)
                                    .map((item, k) => ({
                                      children: (
                                        <div className="flex flex-col mb-1">
                                          {
                                            <>
                                              <div className="flex gap-x-3 items-center">
                                                <Link
                                                  className="text-blue-600"
                                                  href={
                                                    `/system/requests` +
                                                    `/${item?.meta?.referenceId}`
                                                  }
                                                >
                                                  Document
                                                </Link>
                                                <span className="text-[13px] text-[#80878b]">
                                                  {" "}
                                                  {item?.meta?.moduleMessage}
                                                </span>
                                                <Link
                                                  className="text-blue-600"
                                                  href={
                                                    activityUser[
                                                      item?.meta?.module
                                                    ]?.path +
                                                    `/${item?.meta?.doneBy?._id}`
                                                  }
                                                >
                                                  {item?.meta?.doneBy
                                                    ?.lastName +
                                                    " " +
                                                    item?.meta?.doneBy
                                                      ?.firstName}
                                                </Link>
                                              </div>
                                              <Tooltip
                                                title={moment(
                                                  item?.doneAt
                                                ).format(
                                                  "MMMM Do YYYY, h:mm:ss a"
                                                )}
                                              >
                                                <small className="text-[#80878b]">
                                                  {moment(item?.doneAt)
                                                    .endOf()
                                                    .fromNow()}
                                                </small>
                                              </Tooltip>
                                            </>
                                          }
                                        </div>
                                      ),
                                      color: "blue",
                                      dot: activityUser[item?.module]?.icon,
                                    }))
                                ) : (
                                  <p className="my-10 text-center text-black">
                                    No Data
                                  </p>
                                )
                              }
                            />
                          </div>
                        )}
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
        {(currentCode == 3 || tender || po || contract) && (
          <motion.div
            variants={bounceVariants}
            initial="initial"
            animate="animate"
            className="bg-white rounded shadow py-1.5"
          >
            <div className="request px-4 xl:max-h-[calc(100vh-265px)] max-h-[calc(100vh-65px)] overflow-y-auto">
              <div
                // Transition duration
                className="pt-3"
              >
                {/* Sourcing Method */}
                {currentCode !== 3 && (
                  <div className="mb-5">
                    <div className="text-[16px] font-bold">Sourcing Method</div>
                    <div className="mt-4 text-[14px] line text-[#A3AEB4] leading-6">
                      {(data?.sourcingMethod && (
                        <Tag>{data?.sourcingMethod}</Tag>
                      )) ||
                        "No sourcing method selected at the moment."}
                    </div>
                  </div>
                )}
                {currentCode === 3 &&
                  (!tender || !po || !contract) &&
                  (user?.permissions?.canCreateTenders ||
                    user?.permissions?.canCreatePurchaseOrders ||
                    user?.permissions?.canCreateContracts) && (
                    <>
                      <Form form={form}>
                        <div className="text-[16px] font-bold">
                          Sourcing Method Selection
                        </div>
                        <div className="mt-5 items-center">
                          <div className="mb-2">
                            Please select a sourcing method
                          </div>
                          <Form.Item name="refDoc">
                            <Select
                              onChange={(value) => setRefDoc(value)}
                              style={{
                                width: "100%",
                                borderRadius: "6px",
                                outline: refDoc ? "" : "1.8px solid #4297FF",
                              }}
                              defaultValue={false}
                              options={[
                                {
                                  value: "From Existing Contract",
                                  label: "Sourcing from Existing Contract",
                                },

                                {
                                  value: "Direct Contracting",
                                  label: "Direct contracting",
                                },
                                {
                                  value: "Tendering",
                                  label: "Tendering",
                                },
                              ]}
                            />
                          </Form.Item>
                        </div>
                        {refDoc === "Tendering" &&
                          !tender &&
                          buildTenderForm(
                            setDeadLine,
                            user,
                            docId,
                            submitTenderData,
                            setTendeDocSelected,
                            tenderDocSelected
                          )}

                        {refDoc === "From Existing Contract" &&
                          !contract &&
                          buildPOForm(
                            setSelectedContract,
                            contracts,
                            user,
                            submitPOData,
                            setVendor,
                            selectedContract,
                            documentFullySigned
                          )}

                        {refDoc === "Direct Contracting" && !contract && (
                          <div>
                            <div className="items-center">
                              <div className="mb-2">
                                Select registered vendor
                              </div>
                              <Form.Item name="vendor">
                                <Select
                                  onChange={(value, option) => {
                                    setVendor(option?.payload);
                                  }}
                                  style={{ width: "100%" }}
                                  showSearch
                                  filterSort={(optionA, optionB) =>
                                    (optionA?.label ?? "")
                                      .toLowerCase()
                                      .localeCompare(
                                        (optionB?.label ?? "").toLowerCase()
                                      )
                                  }
                                  filterOption={(inputValue, option) =>
                                    option?.label
                                      .toLowerCase()
                                      .includes(inputValue.toLowerCase())
                                  }
                                  options={vendors
                                    ?.filter(
                                      (v) => v?.vendor?.status === "approved"
                                    )
                                    ?.map((v) => {
                                      return {
                                        value: v?.vendor?._id,
                                        label: v?.vendor?.companyName,
                                        payload: v?.vendor,
                                      };
                                    })}
                                />
                              </Form.Item>
                            </div>
                            <div className="items-center">
                              <div>
                                Upload reference document{" "}
                                <i className="text-xs">
                                  (expected in PDF format)
                                </i>
                              </div>
                              <Form.Item name="vendor">
                                <UploadReqAttach
                                  uuid={reqAttachId}
                                  setAttachSelected={setAttachSelected}
                                />
                              </Form.Item>
                            </div>
                            <div>
                              <div className="flex flex-col w-full">
                                <div className="flex flex-row space-x-1 items-center w-full mt-4">
                                  <Form.Item className="w-full my-2">
                                    <Button
                                      icon={<FileDoneOutlined />}
                                      type="primary"
                                      htmlType="submit"
                                      onClick={submitContractData}
                                      disabled={
                                        !user?.permissions
                                          ?.canCreateContracts ||
                                        !vendor ||
                                        !attachSelected
                                      }
                                      className="space-x-0 pt-1 pb-3 gap-2 px-2 mx-1 w-full"
                                    >
                                      Create Contract
                                    </Button>
                                  </Form.Item>
                                </div>

                                <div className="flex flex-row space-x-1 items-center w-full mb-3">
                                  <Form.Item className="w-full my-2">
                                    <Button
                                      icon={<FileDoneOutlined />}
                                      type="primary"
                                      htmlType="submit"
                                      onClick={submitPOData}
                                      disabled={
                                        !user?.permissions
                                          ?.canCreatePurchaseOrders ||
                                        !vendor ||
                                        !attachSelected
                                      }
                                      className="space-x-0 pt-1 pb-3 gap-2 px-2 mx-1 w-full"
                                    >
                                      Create PO
                                    </Button>
                                  </Form.Item>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Form>
                    </>
                  )}

                {tender && data?.sourcingMethod === "Tendering" && (
                  <div className="mb-5">
                    <Typography.Text type="secondary">
                      Tender reference:{" "}
                      <Link href={`/system/tenders/${tender?._id}`}>
                        {tender?.number}
                      </Link>
                    </Typography.Text>
                  </div>
                )}

                {contract &&
                  (data?.sourcingMethod === "Direct Contracting" ||
                    data?.sourcingMethod === "From Existing Contract") && (
                    <div className="ml-3 mb-5">
                      <Typography.Text type="secondary">
                        Contract reference:{" "}
                        <Link href={`/system/contracts/${contract?._id}`}>
                          {contract?.number}
                        </Link>
                      </Typography.Text>
                    </div>
                  )}

                {po &&
                  (data?.sourcingMethod === "Direct Contracting" ||
                    data?.sourcingMethod === "From Existing Contract") && (
                    <div className="ml-3 mb-5">
                      <Typography.Text type="secondary">
                        PO reference:{" "}
                        <Link href={`/system/purchase-orders/${po?._id}`}>
                          {po?.number}
                        </Link>
                      </Typography.Text>
                    </div>
                  )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RequestDetails;
