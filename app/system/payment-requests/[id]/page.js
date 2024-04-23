"use client";
import React, { Fragment, useEffect, useRef, useState } from "react";
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
  Popconfirm,
  Radio,
  Select,
  Steps,
  Switch,
  Tag,
  Timeline,
  Typography,
  Tooltip,
} from "antd";
import {
  LikeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CiCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  DislikeOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PaperClipOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
  FileSyncOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import moment from "moment";
import UploadOtherFiles from "@/app/components/uploadOtherFiles";
import {
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  UserGroupIcon,
  LightBulbIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import UploadPaymentReq from "@/app/components/uploadPaymentReq";
import UpdatePaymentReqDoc from "@/app/components/updatePaymentReqDoc";
import { FaCheck } from "react-icons/fa6";
import { MdApproval, MdOutlinePayments } from "react-icons/md";
import { RiForbidLine, RiArrowDropDownLine } from "react-icons/ri";
import { MdAccountBalance } from "react-icons/md";
import { FaMobileAlt } from "react-icons/fa";
import { TiInfoLarge } from "react-icons/ti";
import { useUser } from "@/app/context/UserContext";
import { Dialog, Transition } from "@headlessui/react";
import { usePaymentContext } from "@/app/context/PaymentContext";
import { isMobile } from "react-device-detect";
import NotificationComponent from "@/app/hooks/useMobile";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let fend_url = process.env.NEXT_PUBLIC_FTEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getPaymentRequestDetails(id, router) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");

  const res = await fetch(`${url}/paymentRequests/${id}`, {
    headers: {
      Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(
        `/auth?goTo=/system/payment-requests/${id}&sessionExpired=true`
      );
    }
    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getPoPaymentProgress(id, router) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");

  if (id) {
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
  } else {
    return null;
  }
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

async function getApprovers() {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/users/level1Approvers`, {
    method: "GET",
    headers: {
      Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),

      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary

    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getAccounts() {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/b1/accounts`, {
    method: "GET",
    headers: {
      Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),

      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary

    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getDistributionRules() {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/b1/distributionRules`, {
    method: "GET",
    headers: {
      Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),

      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary

    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

async function getBudgetLines() {}

async function getFile(path) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(path, {
    method: "GET",
    headers: {
      Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),

      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary

    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.blob();
}

export default function PaymentRequest({ params }) {
  const { user, login, logout } = useUser();
  // let user = JSON.parse(
  //   typeof window !== "undefined" && localStorage.getItem("user")
  // );
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const [show, setShow] = useState(false);
  let [paymentRequest, setPaymentRequest] = useState(null);
  let router = useRouter();
  let [form] = Form.useForm();
  let [paymentForm] = Form.useForm();
  let [title, setTitle] = useState("");
  let [description, setDescription] = useState("");
  let [amount, setAmount] = useState(null);
  let [docId, setDocId] = useState(null);
  let [files, setFiles] = useState([]);
  let [filesProof, setFilesProof] = useState([]);
  let [showAddApproverForm, setShowAddApproverForm] = useState(false);
  let [level1Approvers, setLevel1Approvers] = useState([]);
  let [level1Approver, setLevel1Approver] = useState(null);
  let [currency, setCurrency] = useState("RWF");
  let [overrideAmount, setOverrideAmount] = useState(false);
  let [amountOverride, setAmountOverride] = useState(0);

  let [editRequest, setEditRequest] = useState(false);
  let [updateFiles, setUpdateFiles] = useState(false);

  const [open, setOpen] = useState(false);
  const [openConfirmDeliv, setOpenConfirmDeliv] = useState([]);
  const [openApprove, setOpenApprove] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  let [reason, setReason] = useState("");

  const [currentCode, setCurrentCode] = useState(-1);

  const [messageApi, contextHolder] = message.useMessage();
  const [confirmRejectLoading, setConfirmRejectLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  let [budgetLines, setBudgetLines] = useState([]);
  let [budgetLine, setBudgetLine] = useState(null);
  let [budgeted, setBudgeted] = useState(false);
  let [accounts, setAccounts] = useState([]);
  let [debitAccount, setDebitAccount] = useState(null);
  let [creditAccount, setCreditAccount] = useState(null);
  let [distributionRules, setDistributionRules] = useState([]);
  let [distributionRuleCr, setDistributionRuleCr] = useState(null);
  let [distributionRuleDb, setDistributionRuleDb] = useState(null);

  let [po, setPo] = useState(null);
  let [poVal, setPoVal] = useState(0);
  let [totalPaymentVal, setTotalPaymentVal] = useState(0);
  let [totalPaid, setTotalPaid] = useState(0);
  const [activeIndex, setActiveIndex] = useState("request");
  const contentHeight = useRef();
  const [bankPay, setBankPay] = useState(true);
  let [bankName, setBankName] = useState("");
  let [accountName, setAccountName] = useState("");
  let [accountNumber, setAccountNumber] = useState("");
  let [phoneName, setPhoneName] = useState("");
  let [phoneNumber, setPhoneNumber] = useState("");
  const [tab, setTab] = useState(0)
  const {page, filter} = usePaymentContext()

  useEffect(() => {
    getPaymentRequestDetails(params.id, router).then((res) => {
      if (res?.status == "reviewed") res.status = "pending-approval";
      setPaymentRequest(res);
      let _files = [...files];

      let _paymentRequest = res;

      _paymentRequest?.docIds?.map(async (doc, i) => {
        let uid = `rc-upload-${moment().milliseconds()}-${i}`;
        let _url = `${url}/file/paymentRequests/${encodeURI(doc)}`;
        let status = "done";
        let name = `${doc}`;

        let response = await fetch(_url);
        let data = await response.blob();
        getBase64(data).then((res) => {
          let newFile = new File([data], name, {
            uid,
            url: _url,
            status,
            name,
            // type:'pdf'
          });

          _files.push(newFile);
          setFiles(_files);
        });
      });
      setPo(res?.purchaseOrder);

      res?.purchaseOrder?._id &&
        getPoPaidRequests(res?.purchaseOrder?._id, router).then((res) => {
          // setPoVal(res?.poVal);
          setTotalPaid(res?.totalPaymentVal);
        });

      setAmount(res?.amount);
      let statusCode = getRequestStatusCode(res?.status);
      setCurrentCode(statusCode);
      setBudgeted(res?.budgeted);
      setCurrency(_paymentRequest?.currency);
    });

    const getBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    getApprovers()
      .then((res) => {
        let approversList = res?.filter((a) => a?._id !== user?._id);
        setLevel1Approvers(res);
        let hod = approversList?.filter(
          (a) => a?.department?._id === user?.department
        );
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });

    getAccounts().then((res) => {
      setAccounts(res?.value);
    });

    getDistributionRules().then((res) => {
      setDistributionRules(res?.value);
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
  }, [params]);

  useEffect(() => {
    po &&
      getPoPaymentProgress(po?._id, router).then((res) => {
        setPoVal(res?.poVal);
        setTotalPaymentVal(res?.totalPaymentVal);
      });
  }, [po]);

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

  const handleUpload = (action) => {
    if (files?.length < 1) {
      messageApi.error("Please add at least one doc?.");
    } else {
      setSaving(true);

      let _files = [];
      if (action === "paymentProof") _files = [...filesProof];
      if (action === "update") _files = [...files];

      const formData = new FormData();
      _files.forEach((fileToSave, rowIndex) => {
        formData.append("files[]", fileToSave);
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

          action == "paymentProof" && sendProofForRequest(_filenames);
          action == "update" && updateRequest(_filenames);
        })
        .catch((err) => {
          console.log(err);
          messageApi.error("upload failed.");
        })
        .finally(() => {
          setSaving(false);
        });
    }
  };

  const save = (_fileList) => {
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
        createdBy: user?._id,
        purchaseOrder: params?.poId,
        docIds: _fileList,
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
      });
  };

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

  function getRequestStatus(code) {
    // if (code === 0) return "verified";
    if (code === 0) return "pending-review";
    else if (code === 1) return "pending-approval";
    else if (code === 2) return "approved (hod)";
    else if (code === 3) return "approved";
    else if (code === 4) return "paid";
    else if (code === 5) return "declined";
    else if (code === 6) return "withdrawn";
    else return "pending-review";
  }

  function getRequestStatusCode(status) {
    // if (status === "verified") return 0;
    if (status === "pending-review") return 0;
    else if (status === "pending-approval") return 1;
    else if (status === "approved (hod)") return 2;
    else if (status === "approved") return 3;
    else if (status === "paid") return 4;
    else if (status === "declined") return 5;
    else if (status === "withdrawn") return 6;
    else return -1;
  }

  function changeStatus(statusCode) {
    setCurrentCode(statusCode);
    handleUpdateStatus(data?._id, getRequestStatus(statusCode));
  }

  function sendReview() {
    paymentRequest.approver = level1Approver || paymentRequest?.approver?._id;
    paymentRequest.reviewedBy = user?._id;
    paymentRequest.reviewedAt = moment();
    paymentRequest.status = "reviewed";
    paymentRequest.notifyApprover = true;
    fetch(`${url}/paymentRequests/${paymentRequest?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: paymentRequest,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setShowAddApproverForm(false);
        setOpen(false);
        refresh();
      });
  }

  function updateRequest(docIds) {
    // docIds[0] = null;
    // alert(docIds)
    setUpdateFiles(false);
    paymentRequest.amount = amount;
    if (
      !docIds.includes(null) &&
      !docIds.includes(undefined) &&
      !docIds.includes("")
    ) {
      paymentRequest.docIds = docIds;
    }
    if (
      paymentRequest.status == "declined" ||
      paymentRequest.status == "withdrawn"
    ) {
      paymentRequest.hod_approvalDate = null;
      paymentRequest.hof_approvalDate = null;
      paymentRequest.rejectionDate = null;
      paymentRequest.reasonForRejection = null;
      // paymentRequest.approver = null;
      paymentRequest.reviewedAt = null;
      paymentRequest.reviewedBy = null;
    }
    paymentRequest.paymentDetails = {
      bankName: paymentRequest?.paymentDetails?.bankName || "",
      accountName: paymentRequest?.paymentDetails?.accountName || "",
      accountNumber: paymentRequest?.paymentDetails?.accountNumber || "",
      phoneName: paymentRequest?.paymentDetails?.phoneName || "",
      phoneNumber: paymentRequest?.paymentDetails?.phoneNumber || "",
    };
    paymentRequest.status =
      paymentRequest.status == "declined" ||
      paymentRequest.status == "withdrawn"
        ? "pending-review"
        : paymentRequest.status;

    fetch(`${url}/paymentRequests/${paymentRequest?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: paymentRequest,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        refresh();
      });
  }

  function approveRequest(approvalStage) {
    if (getRequestStatusCode(approvalStage) == 2)
      paymentRequest.hod_approvalDate = moment();
    if (getRequestStatusCode(approvalStage) == 3)
      paymentRequest.hof_approvalDate = moment();

    paymentRequest.status = approvalStage;
    fetch(`${url}/paymentRequests/${paymentRequest?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: paymentRequest,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        refresh();
      });
  }

  function declineRequest() {
    paymentRequest.status = "declined";
    paymentRequest.rejectionDate = moment();
    paymentRequest.reasonForRejection = reason;
    fetch(`${url}/paymentRequests/${paymentRequest?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: paymentRequest,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        refresh();
      });
  }
  function withdrawRequest() {
    paymentRequest.status = "withdrawn";
    paymentRequest.rejectionDate = moment();
    paymentRequest.reasonForRejection = reason;
    fetch(`${url}/paymentRequests/${paymentRequest?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: paymentRequest,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        refresh();
      });
  }

  function sendProofForRequest(docIds) {
    let _amount = overrideAmount ? amountOverride : paymentRequest?.amount;
    let _currency = overrideAmount ? "RWF" : paymentRequest?.currency;

    // if (paymentRequest?.category === "internal")
    //   paymentRequest.journalEntry = {
    //     Memo: paymentRequest?.title,
    //     ReferenceDate: moment(),
    //     JournalEntryLines: [
    //       {
    //         AccountCode: debitAccount,

    //         // FCCurrency: paymentRequest?.currency,
    //         LineMemo: paymentRequest?.title,
    //         CostingCode: distributionRuleDb,
    //         ...(_currency !== "RWF" && {
    //           FCCurrency: _currency,
    //           FCDebit: _amount,
    //         }),
    //         ...(_currency == "RWF" && {
    //           Debit: _amount,
    //         }),
    //       },
    //       {
    //         AccountCode: creditAccount,

    //         // FCCurrency: _currency,
    //         LineMemo: paymentRequest?.title,
    //         CostingCode: distributionRuleCr,
    //         ...(_currency !== "RWF" && {
    //           FCCurrency: _currency,
    //           FCCredit: _amount,
    //         }),
    //         ...(_currency == "RWF" && {
    //           Credit: _amount,
    //         }),
    //       },
    //     ],
    //   };

    let updates = { ...paymentRequest };

    updates.status = "paid";
    updates.paymentProofDocs = docIds;
    fetch(`${url}/paymentRequests/${paymentRequest?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        if (res?.error) {
          // paymentRequest.status = "approved";
          message.error(res?.message, 10);
        } else {
          paymentRequest.paymentProofDocs = docIds;
          refresh();
        }
      })
      .catch((err) => {
        message.error(err);
      });
  }

  function refresh() {
    getPaymentRequestDetails(params.id, router).then((res) => {
      if (res?.status == "reviewed") res.status = "pending-approval";
      setPaymentRequest(res);
      let _files = [];

      let _paymentRequest = res;

      _paymentRequest?.docIds?.map(async (doc, i) => {
        let uid = `rc-upload-${moment().milliseconds()}-${i}`;
        let _url = `${url}/file/paymentRequests/${encodeURI(doc)}`;
        let status = "done";
        let name = `${doc}`;

        let response = await fetch(_url);
        let data = await response.blob();
        getBase64(data).then((res) => {
          let newFile = new File([data], name, {
            uid,
            url: _url,
            status,
            name,
            // type:'pdf'
          });
          _files.push(newFile);
          setFiles(_files);
        });
      });
      setAmount(res?.amount);
      setPo(res?.purchaseOrder);
      let statusCode = getRequestStatusCode(res?.status);
      setCurrentCode(statusCode);
      setBudgeted(res?.budgeted);
      setCurrency(_paymentRequest?.currency);
    });

    const getBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    getApprovers()
      .then((res) => {
        let approversList = res?.filter((a) => a?._id !== user?._id);
        setLevel1Approvers(res);
        let hod = approversList?.filter(
          (a) => a?.department?._id === user?.department
        );
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });

    getAccounts().then((res) => {
      setAccounts(res?.value);
    });

    getDistributionRules().then((res) => {
      setDistributionRules(res?.value);
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
  }

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(
        `/auth?goTo=/system/payment-requests/${params?.id}/&sessionExpired=true`
      );
    } else {
      return res.json();
    }
  }

  const handleItemClick = (value) => {
    setActiveIndex((prevIndex) => (prevIndex === value ? "" : value));
  };

  const handleGoBack = () => {
    const queryParams = window.location.href.split("?")[1];

    router.push("/system/payment-requests?" + queryParams);
  };

  const conditions =
    (paymentRequest?.createdBy?._id === user?._id &&
      (paymentRequest?.status == "pending-review" ||
        paymentRequest?.status == "declined" ||
        paymentRequest?.status == "withdrawn" ||
        paymentRequest?.status?.includes("pending-approval"))) ||
    ((paymentRequest?.approver?._id === user?._id ||
      user?.permissions?.canApproveAsHof) &&
      (paymentRequest?.status?.includes("pending-review") ||
        paymentRequest?.status?.includes("pending-approval")));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: paymentRequest ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
        type: "tween",
        ease: "circOut",
      }}
      className="flex flex-col mr-5 transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 h-screen mb-10"
    >
      {isMobile && <NotificationComponent />}
      <Transition.Root show={show || false} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setShow(false)}>
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
                          onClick={() => setShow(false)}
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
                                ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                                : `border-none text-[#8392AB]`
                            } text-[14px] cursor-pointer`}
                            onClick={() => setTab(0)}
                          >
                            Related Docs
                          </button>
                        </div>
                      </div>
                      {paymentRequest?.purchaseOrder && (
                          <>
                            <h4 className="mb-2 mt-4 font-semibold ml-6">
                              PO Reference
                            </h4>
                            <div className="flex flex-col gap-y-1 ml-5 bg-[#F8F9FA] p-3 my-1">
                              <Link
                                href={`/system/purchase-orders/${paymentRequest?.purchaseOrder?._id}/?page=${page}&filter=${filter}`}
                                className="font-bold text-[16px] no-underline text-blue-600"
                              >
                                {paymentRequest?.purchaseOrder?.number}
                              </Link>
                            </div>
                          </>
                        )}
                      <div />
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {contextHolder}
      <div className="flex items-center justify-between mr-6 mb-4">
        <Button
          className="bg-white h-9 px-5 text-[13px] font-semibold rounded text-[#0063CF]"
          icon={<ArrowLeftOutlined className="font-[15px]" />}
          onClick={handleGoBack}
        >
          Return to List
        </Button>
        {user?.userType !== "VENDOR" && <button onClick={() => setShow(true)} className="cursor-pointer bg-transparent px-1.5 py-1 rounded-full border-solid border-2 border-[#FFF]">
          <TiInfoLarge className="text-[#FFF]" />
        </button>}
      </div>
      <div className="request-details gap-4 mb-6 items-start h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid md:grid-cols-5 gap-1 items-start">
          <div className="md:col-span-4 flex flex-col bg-white p-5 space-y-5 pb-5 rounded-xl">
            <div className="flex flex-row justify-between items-center">
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row space-x-10 items-center">
                  {/* <div>
                    <Button
                      icon={<ArrowLeftOutlined />}
                      type="primary"
                      onClick={() => {
                        router.back();
                      }}
                    >
                      Back
                    </Button>
                  </div> */}

                  <div className="flex items-start gap-x-5">
                    <h4 className="text-[21px] text-[#344767] mb-3">
                      Payment request {paymentRequest?.number}
                    </h4>
                    <sup className="bg-[#F1F3FF] px-3 py-1 rounded-full mt-2 ml-3 text-[#1677FF] font-semibold">
                      {paymentRequest?.category == "internal"
                        ? "INTERNAL"
                        : "EXTERNAL"}
                    </sup>
                  </div>
                </div>
              </div>
              {/* {(
                <Switch
                  checked={editRequest}
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren={<EyeOutlined />}
                  onChange={(e) => setEditRequest(e)}
                />
              )} */}
            </div>
            <div className="flex flex-col pr-8">
              {/* Overview */}
              <div className="flex flex-row items-center justify-between mb-5">
                <h5 className="text-[18px] text-[#344767] mb-4">
                  Request Details
                </h5>
                <div className="flex items-center gap-x-2">
                  <div>
                    <Tag
                      className="shadow"
                      color={
                        paymentRequest?.status == "pending-review"
                          ? "yellow"
                          : paymentRequest?.status?.includes("approved (")
                          ? "orange"
                          : paymentRequest?.status == "approved" ||
                            paymentRequest?.status == "paid"
                          ? "green"
                          : paymentRequest?.status == "reviewed" ||
                            paymentRequest?.status == "pending-approval"
                          ? "yellow"
                          : "red"
                      }
                    >
                      {paymentRequest?.status}
                    </Tag>
                  </div>
                  {paymentRequest?.status == 'declined' && <Tooltip title={paymentRequest?.reasonForRejection} className="cursor-pointer bg-transparent p-0.5 rounded-full mt-0.5">
                    <TiInfoLarge className="text-[#344767] w-6 h-6" />
                  </Tooltip>}
                  {/* <div className="space-x-3 ">
                    {!paymentRequest?.status?.includes("approved") &&
                      paymentRequest?.status !== "declined" &&
                      paymentRequest?.status !== "withdrawn" &&
                      paymentRequest?.status !== "paid" &&
                      user?._id == paymentRequest?.createdBy?._id && (
                        <Popconfirm
                          title="Are you sure?"
                          open={openWithdraw}
                          icon={
                            <QuestionCircleOutlined style={{ color: "red" }} />
                          }
                          onConfirm={() => {
                            withdrawRequest();
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
                          >
                            Withdraw this request
                          </Button>
                        </Popconfirm>
                      )}
                  </div> */}
                </div>
              </div>

              {paymentRequest && (
                <Form
                  form={form}
                  initialValues={{
                    currency: currency,
                    bankName: paymentRequest?.paymentDetails?.bankName,
                    accountName: paymentRequest?.paymentDetails?.accountName,
                    accountNumber:
                      paymentRequest?.paymentDetails?.accountNumber,
                    phoneName: paymentRequest?.paymentDetails?.phoneName,
                    phoneNumber: paymentRequest?.paymentDetails?.phoneNumber,
                  }}
                >
                  <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-6">
                    {/* Request Title */}
                    <div className="flex flex-col space-y-2">
                      <div className="mb-2">
                        <label className="text-[14px] text-[#344767]">
                          Title
                        </label>
                      </div>
                      <div className="">
                        <Form.Item
                          name="title"
                          rules={[
                            {
                              required: true,
                              message: "Title is required",
                            },
                          ]}
                          initialValue={paymentRequest?.title}
                        >
                          <Input
                            // size="small"

                            className="h-11 text-xs"
                            // placeholder={paymentRequest?.title}
                            // defaultValue={paymentRequest?.title}
                            value={paymentRequest?.title}
                            onChange={(e) => {
                              let _p = { ...paymentRequest };
                              _p.title = e.target.value;
                              setPaymentRequest(_p);
                            }}
                            disabled={!conditions}
                          />
                        </Form.Item>
                      </div>
                    </div>

                    {/* Request Amount due*/}
                    <div className="flex flex-col  space-y-2 ">
                      <div className="mb-2">
                        <label className="text-[14px] text-[#344767]">
                          Amount due
                        </label>
                      </div>
                      <div className="">
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
                                  return new Promise((resolve, reject) => {
                                    if (
                                      ((poVal > -1 &&
                                        value >
                                          getPoTotalVal()?.grossTotal -
                                            totalPaymentVal +
                                            paymentRequest?.amount) ||
                                        (poVal == -1 &&
                                          value >
                                            getPoTotalVal()?.grossTotal)) &&
                                      paymentRequest?.category === "external"
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
                            initialValue={paymentRequest.amount}
                          >
                            <InputNumber
                              className="h-10 w-full pt-1.5"
                              addonBefore={
                                <Form.Item
                                  noStyle
                                  name="currencyEd"
                                  initialValue={currency}
                                  rules={[
                                    {
                                      validator(rule, value) {
                                        return new Promise(
                                          (resolve, reject) => {
                                            if (
                                              value !== currency &&
                                              paymentRequest?.category ===
                                                "external"
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
                                  <Select
                                    onChange={(value) =>
                                      (paymentRequest.currency = value)
                                    }
                                    size="large"
                                    value={paymentRequest.currency}
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
                                    disabled={!conditions}
                                  ></Select>
                                </Form.Item>
                              }
                              // defaultValue={paymentRequest.amount}
                              value={paymentRequest.amount}
                              onChange={(e) => {
                                setAmount(e);
                                // paymentRequest.amount = e;
                              }}
                              disabled={!conditions}
                            />
                          </Form.Item>
                        </Form.Item>
                      </div>
                    </div>

                    {/* Request Attached Invoice*/}
                    {/* Request Attached Invoice*/}
                    <div className="flex flex-col  space-y-2 ">
                      <div className="flex flex-row items-center space-x-2">
                        <div className="text-[14px] text-[#344767] mb-2">
                          Attached Invoice(s)
                        </div>
                        {((user?.permissions?.canApproveAsHod &&
                          user?._id === paymentRequest?.approver?._id) ||
                          (paymentRequest?.status == "pending-review" &&
                            user?._id == paymentRequest?.createdBy?._id) ||
                          user?.permissions?.canApproveAsHof) &&
                          !updateFiles && (
                            // <div
                            //   onClick={() => setUpdateFiles(true)}
                            //   className="text-grey-500 hover:text-blue-500 cursor-pointer flex flex-row items-center space-x-1"
                            // >
                            //   <CloudArrowUpIcon className="h-5 w-5 " />{" "}
                            //   <div>update</div>
                            // </div>

                            <Button
                              // className="bg-blue-50"
                              size="small"
                              type="text"
                              onClick={() => setUpdateFiles(true)}
                              icon={<FileSyncOutlined width="10px" />}
                            >
                              {/* Update */}
                            </Button>
                            // <UpdatePaymentReqDoc
                            //   iconOnly={true}
                            //   uuid={doc}
                            //   label="update"
                            //   reloadFileList={refresh}
                            // />
                          )}
                        {updateFiles && (
                          <>
                            <Button
                              // className="bg-orange-50"
                              size="small"
                              type="text"
                              onClick={() => setUpdateFiles(false)}
                              icon={<CloseOutlined width="10px" />}
                            >
                              {/* Cancel */}
                            </Button>
                          </>
                          // <div
                          //   onClick={() => setUpdateFiles(false)}
                          //   className="rounded border border-gray-500 text-grey-500 hover:text-blue-500 cursor-pointer flex flex-row items-center space-x-1"
                          // >
                          //   <XCircleIcon className="h-5 w-5 "/> <div>cancle</div>
                          // </div>
                        )}
                      </div>
                      {!editRequest && !updateFiles && (
                        <div className="grid grid-cols-2 gap-y-2">
                          {paymentRequest?.docIds?.map((doc, i) => {
                            const truncatedFileName =
                              doc?.length >= 11
                                ? `${doc?.slice(0, 7)}... ${doc?.slice(
                                    doc?.lastIndexOf(".")
                                  )}`
                                : doc;
                            return (
                              <div className="flex flex-col border-b-2 border-b-slate-600">
                                <Tooltip title={doc}>
                                  <Typography.Text ellipsis>
                                    <Link
                                      href={`${fend_url}/api/?folder=paymentRequests&name=${encodeURIComponent(
                                        doc
                                      )}`}
                                      target="_blank"
                                    >
                                      <div className="text-xs">
                                        <div className="flex flex-row space-x-1 items-center">
                                          {" "}
                                          <PaperClipOutlined />{" "}
                                          {truncatedFileName}
                                        </div>
                                      </div>
                                    </Link>
                                  </Typography.Text>
                                </Tooltip>

                                {/* <Link
                            href={`${fend_url}/api/?folder=paymentRequests&name=${encodeURIComponent(doc)}`}
                            target="_blank"
                          >
                            <div className="text-xs">
                              <div className="flex flex-row space-x-1 items-center">
                                {" "}
                                <PaperClipOutlined /> Invoice {i + 1}
                              </div>
                            </div>
                          </Link> */}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(editRequest || updateFiles) && (
                        <UploadOtherFiles files={files} setFiles={setFiles} />
                      )}
                    </div>

                    {/* Budgeted */}
                    {user?.userType !== "VENDOR" && paymentRequest && (
                      <div className="flex flex-col space-y-1 items-start">
                        <div className="mb-2">
                          <label className="text-[14px] text-[#344767]">
                            Budgeted
                          </label>
                        </div>
                        {paymentRequest && (
                          <div>
                            <Form.Item
                              name="budgeted"
                              valuePropName="checked"
                              // wrapperCol={{ offset: 8, span: 16 }}
                            >
                              <Radio.Group
                                onChange={({ target }) => {
                                  paymentRequest.budgeted = target.value;
                                  if (target.value === false)
                                    paymentRequest.budgetLine = null;
                                  setBudgeted(target.value);
                                }}
                                className="mt-3"
                                defaultValue={
                                  paymentRequest?.budgeted ? true : false
                                }
                                value={paymentRequest?.budgeted ? true : false}
                                disabled={!conditions}
                              >
                                <Radio value={true} className="mr-3">
                                  <span className="ml-2">Yes</span>
                                </Radio>
                                <Radio value={false} className="mx-3">
                                  <span className="ml-2">No</span>
                                </Radio>
                              </Radio.Group>
                            </Form.Item>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Budget Line */}
                    {user?.userType !== "VENDOR" && budgeted && (
                      <div className="flex flex-col space-y-1 items-start">
                        {budgeted && (
                          <div className="mb-2">
                            <label className="text-[14px] text-[#344767]">
                              Budget Line
                            </label>
                          </div>
                        )}

                        {paymentRequest && budgeted && (
                          // <Select
                          //   // mode="multiple"
                          //   // allowClear
                          //   className="ml-3"
                          //   defaultValue={data?.budgetLine}
                          //   style={{ width: "100%" }}
                          //   placeholder="Please select"
                          //   onChange={(value) => {
                          //     let r = { ...data };
                          //     r.budgetLine = value;
                          //     handleUpdateRequest(r);
                          //   }}
                          // >
                          //   {servCategories?.map((s) => {
                          //     return (
                          //       <Select.Option
                          //         key={s._id}
                          //         value={s.description}
                          //       >
                          //         {s.description}
                          //       </Select.Option>
                          //     );
                          //   })}
                          // </Select>

                          <Form.Item
                            name="budgetLine"
                            rules={[
                              {
                                required: true,
                                message: "Budget Line is required",
                              },
                            ]}
                            className="w-full"
                            initialValue={paymentRequest?.budgetLine?._id}
                          >
                            <Select
                              // defaultValue={budgetLine}

                              // className="ml-3"
                              placeholder="Select service category"
                              showSearch
                              size="large"
                              className="w-full"
                              // defaultValue={paymentRequest?.budgetLine?._id}
                              value={paymentRequest?.budgetLine?._id}
                              onChange={(value, option) => {
                                paymentRequest.budgetLine = value;
                              }}
                              // disabled={paymentRequest?.category === "external"}
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
                              disabled={!conditions}
                            ></Select>
                          </Form.Item>
                        )}
                      </div>
                    )}

                    {/* Request Comment/addtional note */}
                    <div className="flex flex-col space-y-2">
                      <div className="mb-2">
                        <label className="text-[14px] text-[#344767]">
                          Comment
                        </label>
                      </div>
                      {paymentRequest && (
                        <div className="">
                          <Form.Item
                            name="description"
                            rules={[
                              {
                                required: true,
                                message: "Description is required",
                              },
                            ]}
                            initialValue={paymentRequest?.description}
                          >
                            <Input.TextArea
                              className="w-full"
                              rows={4}
                              placeholder={paymentRequest?.description}
                              // defaultValue={paymentRequest?.description}
                              value={paymentRequest?.description}
                              onChange={(e) => {
                                paymentRequest.description = e.target.value;
                              }}
                              disabled={!conditions}
                            />
                          </Form.Item>
                        </div>
                      )}
                    </div>
                  </div>
                  {paymentRequest && (
                    <div className="edit-requests mb-10 pt-5 border-4 border-[#203783]">
                      <h5 className="text-[18px] text-[#344767] mb-4">
                        Payment Details
                      </h5>
                      <div className="bg-[#EFF4F8] px-5 rounded-lg">
                        <div className="flex items-center">
                          <Form.Item
                            name="budgeted"
                            valuePropName="checked"
                            initialValue={bankPay}
                            // wrapperCol={{ offset: 8, span: 16 }}
                          >
                            <Radio.Group
                              onChange={(e) => {
                                setBankPay(e.target.value);
                                if (e.target.value === false)
                                  setBudgetLine(null);
                              }}
                              value={bankPay}
                              className="mb-2 mt-5"
                            >
                              <div className="flex gap-x-10">
                                <div className="my-1 border-t-2 border-x-2 border-[#BFC5C5]">
                                  <Radio
                                    value={true}
                                    className="flex gap-x-1 items-center"
                                  >
                                    <MdAccountBalance /> &nbsp;
                                    <span>Bank Info</span>
                                  </Radio>
                                </div>
                                <div className="my-1 border-2 border-[#BFC5C5]">
                                  <Radio
                                    value={false}
                                    className="flex gap-x-1 items-center"
                                  >
                                    <FaMobileAlt /> &nbsp;
                                    <span>Mobile Pay</span>
                                  </Radio>
                                </div>
                              </div>
                            </Radio.Group>
                          </Form.Item>
                        </div>
                        <div className="grid grid-cols-3 space-x-6">
                          {bankPay ? (
                            <>
                              <div>
                                <div className="text-[14px] text-[#344767] mb-2">
                                  Bank Name
                                </div>
                                <div>
                                  <Form.Item
                                    name="bankName"
                                    initialValue={
                                      paymentRequest?.paymentDetails?.bankName
                                    }
                                    rules={[
                                      {
                                        required:
                                          paymentRequest?.category ==
                                          "external",
                                        message:
                                          "Request Bank name is required",
                                      },
                                    ]}
                                  >
                                    <Input
                                      className="h-11"
                                      onChange={(e) => {
                                        let _p = { ...paymentRequest };

                                        _p.paymentDetails.bankName =
                                          e.target.value;
                                        setPaymentRequest(_p);
                                        // setBankName(e.target.value)
                                      }}
                                      value={
                                        paymentRequest?.paymentDetails?.bankName
                                      }
                                      // defaultValue={
                                      //   paymentRequest?.paymentDetails?.bankName
                                      // }
                                      placeholder="Type in Bank name"
                                      disabled={!conditions}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                              <div>
                                <div className="text-[14px] text-[#344767] mb-2">
                                  Account Name
                                </div>
                                <div>
                                  <Form.Item
                                    name="accountName"
                                    rules={[
                                      {
                                        required:
                                          paymentRequest?.category ==
                                          "external",
                                        message:
                                          "Request account name is required",
                                      },
                                    ]}
                                  >
                                    <Input
                                      value={
                                        paymentRequest?.paymentDetails
                                          ?.accountName
                                      }
                                      className="h-11"
                                      onChange={(e) => {
                                        let _p = { ...paymentRequest };
                                        _p.paymentDetails.accountName =
                                          e.target.value;
                                        setPaymentRequest(_p);
                                        // setAccountName(e.target.value)
                                      }}
                                      placeholder="Type in User account name"
                                      disabled={!conditions}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                              <div>
                                <div className="text-[14px] text-[#344767] mb-2">
                                  Account Number
                                </div>
                                <div>
                                  <Form.Item
                                    name="accountNumber"
                                    rules={[
                                      {
                                        required:
                                          paymentRequest?.category ==
                                          "external",
                                        message:
                                          "Request account number is required",
                                      },
                                    ]}
                                  >
                                    <Input
                                      value={
                                        paymentRequest?.paymentDetails
                                          ?.accountNumber
                                      }
                                      className="h-11"
                                      onChange={(e) => {
                                        let _p = { ...paymentRequest };
                                        _p.paymentDetails.accountNumber =
                                          e.target.value;
                                        setPaymentRequest(_p);
                                        // setAccountNumber(e.target.value)
                                      }}
                                      placeholder="Type in User account number"
                                      disabled={!conditions}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <div className="text-[14px] text-[#344767] mb-2">
                                  Phone Name
                                </div>
                                <div>
                                  <Form.Item
                                    name="phoneName"
                                    rules={[
                                      {
                                        required:
                                          paymentRequest?.category ==
                                          "external",
                                        message:
                                          "Request Phone name is required",
                                      },
                                    ]}
                                  >
                                    <Input
                                      value={
                                        paymentRequest?.paymentDetails
                                          ?.phoneName
                                      }
                                      defaultValue={
                                        paymentRequest?.paymentDetails
                                          ?.phoneName
                                      }
                                      className="h-11"
                                      onChange={(e) => {
                                        let _p = { ...paymentRequest };
                                        _p.paymentDetails.phoneName =
                                          e.target.value;
                                        setPaymentRequest(_p);
                                      }}
                                      placeholder="Type in Phone name"
                                      disabled={!conditions}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                              <div>
                                <div className="text-[14px] text-[#344767] mb-2">
                                  Phone Number
                                </div>
                                <div>
                                  <Form.Item
                                    name="phoneNumber"
                                    rules={[
                                      {
                                        required:
                                          paymentRequest?.category ==
                                          "external",
                                        message:
                                          "Request Phone number required",
                                      },
                                    ]}
                                  >
                                    <Input
                                      value={
                                        paymentRequest?.paymentDetails
                                          ?.phoneNumber
                                      }
                                      defaultValue={
                                        paymentRequest?.paymentDetails
                                          ?.phoneNumber
                                      }
                                      className="h-11"
                                      onChange={(e) => {
                                        let _p = { ...paymentRequest };
                                        _p.paymentDetails.phoneNumber =
                                          e.target.value;
                                        setPaymentRequest(_p);
                                      }}
                                      placeholder="Type in phone number"
                                      disabled={!conditions}
                                    />
                                  </Form.Item>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-x-5 my-4">
                    <div className="space-x-3 ">
                      {!paymentRequest?.status?.includes("approved") &&
                        paymentRequest?.status !== "declined" &&
                        paymentRequest?.status !== "withdrawn" &&
                        paymentRequest?.status !== "paid" &&
                        user?._id == paymentRequest?.createdBy?._id && (
                          <Popconfirm
                            title="Are you sure?"
                            open={openWithdraw}
                            icon={
                              <QuestionCircleOutlined
                                style={{ color: "red" }}
                              />
                            }
                            onConfirm={() => {
                              withdrawRequest();
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
                              className="rounded-lg px-8 pt-3 pb-8 bg-[#F5365C] border-none"
                            >
                              Withdraw this request
                            </Button>
                          </Popconfirm>
                        )}
                    </div>
                    {conditions && (
                      <div>
                        <Button
                          loading={saving}
                          icon={<SaveOutlined />}
                          type="primary"
                          className="rounded-lg px-8 pt-3 pb-8 bg-[#0065DD] border-none"
                          onClick={async () => {
                            form.validateFields().then(() => {
                              if (files?.length < 1) {
                                messageApi.error(
                                  "Please attach atleast one file!"
                                );
                              } else {
                                setEditRequest(false);
                                handleUpload("update");
                              }
                            });
                          }}
                        >
                          Update
                        </Button>
                      </div>
                    )}
                  </div>
                </Form>
              )}

              {paymentRequest?.category === "external" && editRequest && (
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
                            getPoTotalVal().grossTotal -
                              totalPaymentVal +
                              paymentRequest?.amount && "text-red-500"
                        }
                    `}
                    >
                      {po?.items[0]?.currency +
                        " " +
                        (
                          totalPaymentVal +
                          amount -
                          paymentRequest?.amount
                        )?.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {paymentRequest?.status == "withdrawn" && (
                <div className="text-sm text-red-600 p-3 bg-red-50 rounded-md flex flex-col justify-center items-center">
                  <LockClosedIcon className="h-10 w-10 text-red-400" />
                  <p>This request has been withrawn!</p>
                </div>
              )}

              {paymentRequest?.status !== "withdrawn" && (
                <>
                  {/* Approval flow */}
                  {user?.userType !== "VENDOR" && (
                    <div>
                      <Typography.Title level={4}>
                        Request Approval
                      </Typography.Title>
                    </div>
                  )}

                  <div className="-mt-3.5 mb-5">
                    <button
                      className={`cursor-pointer w-full pr-5 flex justify-between items-center bg-transparent border-none ${
                        activeIndex == "delivery" ? "active" : ""
                      }`}
                      onClick={() => handleItemClick("request")}
                    >
                      <div className="flex flex-col items-start justify-start gap-4">
                        <h6 className="text-[#344767] text-[15px] -mb-1">
                          Request Approval Process
                        </h6>
                        <span className="text-[#8392AB]">
                          Proceed with approving the above request by adding
                          your stamp mark where needed
                        </span>
                      </div>
                      <RiArrowDropDownLine
                        className={`text-[36px] text-[#344767] arrow ${
                          activeIndex == "request" ? "active" : ""
                        }`}
                      />
                    </button>
                    <div
                      ref={contentHeight}
                      className="answer-container"
                      style={
                        activeIndex == "request"
                          ? { display: "block" }
                          : { display: "none" }
                      }
                    >
                      {paymentRequest?.approver &&
                        user?.userType !== "VENDOR" && (
                          <div className="mx-3 mt-5 ">
                            <Steps
                              direction="vertical"
                              current={currentCode}
                              items={[
                                // {
                                //   title: `Reviewed by ${paymentRequest?.reviewedBy?.firstName} ${paymentRequest?.reviewedBy?.lastName}`,
                                //   icon: <DocumentMagnifyingGlassIcon className="h-5" />,
                                //   subTitle: currentCode > 0 && (
                                //     <div className="flex flex-row items-center space-x-1 text-xs font-semibold">
                                //       <div>
                                //         {currentCode > 0 &&
                                //           paymentRequest?.reviewedAt && (
                                //             <CheckOutlined className="h-5 w-5 text-green-500" />
                                //           )}
                                //       </div>
                                //       <div>
                                //         {currentCode > 0 &&
                                //           paymentRequest?.reviewedAt &&
                                //           `Reviewed ` +
                                //             moment(paymentRequest?.reviewedAt).fromNow()}
                                //       </div>
                                //     </div>
                                //   ),

                                //   disabled:
                                //     !user?.permissions?.canApproveAsHod ||
                                //     currentCode > 0,
                                // },
                                {
                                  title: `Level 1 (${
                                    paymentRequest?.approver?.firstName +
                                    " " +
                                    paymentRequest?.approver?.lastName
                                  })`,
                                  icon: (
                                    <ClipboardDocumentCheckIcon className="h-5" />
                                  ),
                                  subTitle: currentCode > 1 && (
                                    <div className="flex flex-row items-center space-x-1 text-xs font-semibold">
                                      <div>
                                        {currentCode === 5 &&
                                          !paymentRequest?.hod_approvalDate && (
                                            <CloseOutlined className="h-5 w-5 text-red-500" />
                                          )}
                                        {currentCode > 1 &&
                                          paymentRequest?.hod_approvalDate && (
                                            <CheckOutlined className="h-5 w-5 text-green-500" />
                                          )}
                                      </div>
                                      <div>
                                        {currentCode === 5 &&
                                          !paymentRequest?.hod_approvalDate &&
                                          `Declined ` +
                                            moment(
                                              paymentRequest?.rejectionDate
                                            ).fromNow()}
                                        {currentCode > 1 &&
                                          paymentRequest?.hod_approvalDate &&
                                          `Approved ` +
                                            moment(
                                              paymentRequest?.hod_approvalDate
                                            ).fromNow()}
                                      </div>
                                    </div>
                                  ),
                                  description: currentCode == 1 && (
                                    <div className="flex flex-col">
                                      <div className="text-[#8392AB] mb-4">
                                        Kindly check if the request is relevant
                                        and take action accordingly.
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
                                              // changeStatus(2);
                                              approveRequest(
                                                getRequestStatus(2)
                                              );
                                              setOpenApprove(false);
                                            }}
                                            // okButtonProps={{
                                            //   loading: confirmRejectLoading,
                                            // }}
                                            onCancel={() =>
                                              setOpenApprove(false)
                                            }
                                          >
                                            <Button
                                              icon={<LikeOutlined />}
                                              disabled={
                                                !user?.permissions
                                                  ?.canApproveAsHod ||
                                                user?._id !==
                                                  paymentRequest?.approver
                                                    ?._id ||
                                                currentCode > 1
                                              }
                                              onClick={() =>
                                                setOpenApprove(true)
                                              }
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
                                              if (reason?.length >= 3)
                                                declineRequest();
                                            }}
                                            description={
                                              <>
                                                <Input
                                                  onChange={(v) =>
                                                    setReason(v.target.value)
                                                  }
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
                                                !user?.permissions
                                                  ?.canApproveAsHod ||
                                                user?._id !==
                                                  paymentRequest?.approver
                                                    ?._id ||
                                                currentCode > 1
                                              }
                                              danger
                                              type="primary"
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
                                    !user?.permissions?.canApproveAsHod ||
                                    currentCode > 1,
                                },
                                {
                                  title: "Level 2 (Finance)",
                                  icon: <CreditCardIcon className="h-5" />,
                                  subTitle: currentCode > 2 &&
                                    paymentRequest?.hod_approvalDate && (
                                      <div className="flex flex-row items-center space-x-1 text-xs font-semibold">
                                        <div>
                                          {currentCode === 5 &&
                                            !paymentRequest?.hof_approvalDate && (
                                              <CloseOutlined className="h-5 w-5 text-red-500" />
                                            )}
                                          {currentCode > 2 &&
                                            paymentRequest?.hof_approvalDate && (
                                              <CheckOutlined className="h-5 w-5 text-green-500" />
                                            )}
                                        </div>
                                        <div>
                                          {currentCode === 5 &&
                                            !paymentRequest?.hof_approvalDate &&
                                            `Declined ` +
                                              moment(
                                                paymentRequest?.rejectionDate
                                              ).fromNow()}
                                          {currentCode > 2 &&
                                            paymentRequest?.hof_approvalDate &&
                                            `Approved ` +
                                              moment(
                                                paymentRequest?.hof_approvalDate
                                              ).fromNow()}
                                        </div>
                                      </div>
                                    ),
                                  description: currentCode === 2 && (
                                    <div className="flex flex-col">
                                      <div className="text-[#8392AB] mb-4">
                                        Kindly check if the request is relevant
                                        and take action accordingly.
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
                                              approveRequest("approved");
                                              setOpenApprove(false);
                                            }}
                                            // okButtonProps={{
                                            //   loading: confirmRejectLoading,
                                            // }}
                                            onCancel={() =>
                                              setOpenApprove(false)
                                            }
                                          >
                                            <Button
                                              icon={<LikeOutlined />}
                                              disabled={
                                                !user?.permissions
                                                  ?.canApproveAsHof ||
                                                currentCode > 2 ||
                                                currentCode < 0
                                              }
                                              onClick={() =>
                                                setOpenApprove(true)
                                              }
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
                                              if (reason?.length >= 3)
                                                declineRequest();
                                            }}
                                            okButtonProps={{
                                              disabled: reason?.length < 3,
                                              loading: confirmRejectLoading,
                                            }}
                                            onCancel={handleCancel}
                                            description={
                                              <>
                                                <Input
                                                  onChange={(v) =>
                                                    setReason(v.target.value)
                                                  }
                                                  placeholder="Reason for rejection"
                                                ></Input>
                                              </>
                                            }
                                          >
                                            <Button
                                              icon={<DislikeOutlined />}
                                              disabled={
                                                !user?.permissions
                                                  ?.canApproveAsHof ||
                                                currentCode > 2 ||
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
                                    currentCode > 2 ||
                                    currentCode < 0,
                                },
                              ]}
                            />
                            {paymentRequest?.reasonForRejection && (
                              <div className="bg-red-50 p-2 rounded-md">
                                {paymentRequest?.reasonForRejection}
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  {!paymentRequest?.approver &&
                    user?.userType !== "VENDOR" &&
                    user?.permissions?.canReviewPaymentRequests && (
                      <div className="flex flex-col space-y-2">
                        {/* <div className="text-xs text-gray-500">
                    {showAddApproverForm ? "" : "No approver selected yet"}
                  </div> */}
                        {!showAddApproverForm &&
                          user?.permissions?.canReviewPaymentRequests &&
                          !user?.approver && (
                            <div className="flex flex-row items-center space-x-1">
                              <Button
                                type="primary"
                                onClick={() => {
                                  setShowAddApproverForm(!showAddApproverForm);
                                  setLevel1Approver(null);
                                }}
                              >
                                Add approver
                              </Button>
                            </div>
                          )}
                        {showAddApproverForm && (
                          <div className="flex flex-row items-center space-x-1">
                            <div
                              onClick={() => {
                                setShowAddApproverForm(!showAddApproverForm);
                                setLevel1Approver(null);
                              }}
                            >
                              <CloseCircleOutlined className="text-red-500" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {(showAddApproverForm ||
                    (paymentRequest?.approver &&
                      paymentRequest?.status == "pending-review")) && (
                    <div className="w-1/3">
                      <Form layout="vertical">
                        <Form.Item
                          label="Select level 1 approver"
                          name="level1Approver"
                          rules={[
                            {
                              required: true,
                              message: "Level 1 approver is required",
                            },
                          ]}
                        >
                          <Select
                            // defaultValue={defaultApprover}
                            defaultValue={paymentRequest?.approver?._id}
                            placeholder="Select Approver"
                            showSearch
                            size="large"
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

                        <Form.Item>
                          <Button
                            onClick={sendReview}
                            type="primary"
                            disabled={
                              !level1Approver && !paymentRequest?.approver?._id
                            }
                          >
                            Submit
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>
                  )}

                  {/* Payment process */}
                  {
                    <div className="flex flex-row justify-between items-center">
                      <Typography.Title level={4}>
                        Payment process
                      </Typography.Title>
                      <div>
                        {paymentRequest?.status == "approved" && (
                          <Tag color="orange">payment is due</Tag>
                        )}
                      </div>
                    </div>
                  }

                  {paymentRequest?.status === "approved" &&
                    user?.permissions.canApproveAsHof &&
                    paymentRequest?.category === "internal" && (
                      <>
                        <Form form={paymentForm}>
                          <div className="grid lg:grid-cols-2 items-center mt-5 gap-6 divide-x">
                            <UploadOtherFiles
                              files={filesProof}
                              setFiles={setFilesProof}
                              label="Select Payment proof"
                            />
                            {/* <div className="flex flex-col">
                                <div>DistributionRule</div>
                                <Form.Item
                                  // label="Select level 1 approver"
                                  name="distributionRule"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Can not be empty!",
                                    },
                                  ]}
                                >
                                  <Select
                                    // defaultValue={defaultApprover}
                                    placeholder="Select rule"
                                    showSearch
                                    onChange={(value) => {
                                      // setLevel1Approver(value);
                                      setDistributionRule(value);
                                    }}
                                    filterOption={(input, option) =>
                                      (option?.label ?? "")
                                        .toLowerCase()
                                        .includes(input.toLowerCase())
                                    }
                                    options={distributionRules?.map((l) => {
                                      return {
                                        label: l?.FactorDescription,
                                        value: l?.FactorCode,
                                      };
                                    })}
                                  ></Select>
                                </Form.Item>
                              </div> 
                            */}
                            {/* <Form.Item
                              label="Distribution Rule - Debit Acc"
                              name="currency"
                              rules={[
                                {
                                  required: true,
                                  message: "Can not be empty!",
                                },
                              ]}
                            >
                              <Select
                                // style={{ marginLeft: 8, maxWidth: 200 }}
                                showSearch
                                size="large"
                                onChange={(value) => {
                                  // setLevel1Approver(value);
                                  setDistributionRuleDb(value);
                                  setDistributionRuleCr(value);
                                }}
                                placeholder="Distribution rule"
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                options={distributionRules?.map((l) => {
                                  return {
                                    label: l?.FactorDescription,
                                    value: l?.FactorCode,
                                  };
                                })}
                              ></Select>
                            </Form.Item> */}

                            {/* <div className="flex flex-row items-center"></div> */}

                            {/*<div className="flex flex-row items-center">
                          <Form.Item
                            label="Distribution Rule - Credit Acc"
                            name="currency"
                            rules={[
                              {
                                required: true,
                                message: "Can not be empty!",
                              },
                            ]}
                          >
                            <Select
                              // style={{ marginLeft: 8, maxWidth: 200 }}
                              showSearch
                              placeholder="Distribution rule"
                              onChange={(value) => {
                                // setLevel1Approver(value);
                                setDistributionRuleCr(value);
                              }}
                              filterOption={(input, option) =>
                                (option?.label ?? "")
                                  .toLowerCase()
                                  .includes(input.toLowerCase())
                              }
                              options={distributionRules?.map((l) => {
                                return {
                                  label: l?.FactorDescription,
                                  value: l?.FactorCode,
                                };
                              })}
                            ></Select>
                          </Form.Item> 
                        </div>*/}

                            <div className="mr-10 space-y-2 flex flex-col">
                              {/* <InputNumber
                                size="small"
                                name="title"
                                className="text-xs w-full"
                                placeholder={paymentRequest?.amount}
                                onChange={(e) => {
                                  paymentRequest.amount = e;
                                }}
                              /> */}
                            </div>
                          </div>

                          {/* <div className="grid lg:grid-cols-2 items-center gap-x-6 mt-2">
                            <Form.Item
                              label="Debit Account"
                              name="accountToDebit"
                              rules={[
                                {
                                  required: true,
                                  message: "Can not be empty!",
                                },
                              ]}
                            >
                              <Select
                                // defaultValue={defaultApprover}
                                // style={{ marginLeft: 8, maxWidth: 250 }}
                                // style={{ marginLeft: 8 }}
                                placeholder="Account to debit"
                                size="large"
                                showSearch
                                onChange={(value) => {
                                  // setLevel1Approver(value);
                                  setDebitAccount(value);
                                }}
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                options={accounts?.map((l) => {
                                  return {
                                    label: l?.Name,
                                    value: l?.Code,
                                  };
                                })}
                              ></Select>
                            </Form.Item>
                            <Form.Item
                              label="Credit Account"
                              name="accountToCredit"
                              rules={[
                                {
                                  required: true,
                                  message: "Can not be empty!",
                                },
                              ]}
                            >
                              <Select
                                // style={{ marginLeft: 8, maxWidth: 250 }}
                                // defaultValue={defaultApprover}
                                // style={{ marginLeft: 8 }}
                                placeholder="Account to Credit"
                                showSearch
                                size="large"
                                onChange={(value) => {
                                  // setLevel1Approver(value);
                                  setCreditAccount(value);
                                }}
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                options={accounts?.map((l) => {
                                  return {
                                    label: l?.Name,
                                    value: l?.Code,
                                  };
                                })}
                              ></Select>
                            </Form.Item>
                          </div> */}
                          {/* <div className="flex flex-row space-x-2 items-center my-4">
                            <Switch
                              onChange={setOverrideAmount}
                              checked={overrideAmount}
                              disabled={paymentRequest?.currency === "RWF"}
                            />
                            <div>Override Amount</div>
                          </div> */}
                          {/* {overrideAmount && (
                            <div className="grid md:grid-cols-3">
                              <Form.Item>
                                <Form.Item
                                  label="Override RWF Amount"
                                  name="overrideAmount"
                                  noStyle
                                  rules={[
                                    {
                                      required: true,
                                      message: "Amount is required",
                                    },
                                    {
                                      validator(rule, value) {
                                        return new Promise(
                                          (resolve, reject) => {
                                            if (value <= 0) {
                                              reject(
                                                "The amount should exceed Zero"
                                              );
                                            } else {
                                              resolve();
                                            }
                                          }
                                        );
                                      },
                                    },
                                  ]}
                                  initialValue={0}
                                >
                                  <InputNumber
                                    label="Override RWF Amount"
                                    className="h-11 w-full pt-2"
                                    addonBefore={
                                      <Form.Item
                                        noStyle
                                        // name="currency"
                                      >
                                        <Select
                                          disabled={true}
                                          defaultValue="RWF"
                                          value="RWF"
                                          options={[
                                            {
                                              value: "RWF",
                                              label: "RWF",
                                              key: "RWF",
                                            },
                                            // {
                                            //   value: "USD",
                                            //   label: "USD",
                                            //   key: "USD",
                                            // },
                                            // {
                                            //   value: "EUR",
                                            //   label: "EUR",
                                            //   key: "EUR",
                                            // },
                                          ]}
                                        ></Select>
                                      </Form.Item>
                                    }
                                    // defaultValue={paymentRequest.amount}
                                    value={amountOverride}
                                    onChange={setAmountOverride}
                                  />
                                </Form.Item>
                              </Form.Item>
                            </div>
                          )} */}

                          <div className="pt-10">
                            <Button
                              loading={saving}
                              onClick={() => {
                                handleUpload("paymentProof");
                              }}
                              type="primary"
                              disabled={!filesProof || filesProof.length == 0}
                            >
                              Submit
                            </Button>
                          </div>
                        </Form>
                      </>
                    )}

                  {paymentRequest?.status === "approved" &&
                    user?.permissions.canApproveAsHof &&
                    paymentRequest?.category === "external" && (
                      <>
                        <UploadOtherFiles
                          files={filesProof}
                          setFiles={setFilesProof}
                          label="Select Payment proof"
                        />

                        <div>
                          <Button
                            loading={saving}
                            onClick={() => handleUpload("paymentProof")}
                            type="primary"
                            disabled={!filesProof || filesProof.length == 0}
                          >
                            Submit
                          </Button>
                        </div>
                      </>
                    )}

                  {paymentRequest?.status !== "approved" &&
                    paymentRequest?.status !== "paid" && (
                      <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-md flex flex-col justify-center items-center">
                        <LockClosedIcon className="h-10 w-10 text-blue-400" />
                        <p>
                          This request needs to be approved for the payment
                          process to start.
                        </p>
                      </div>
                    )}

                  {paymentRequest?.status === "paid" && (
                    <div className="flex flex-col  space-y-2 ">
                      <div className="flex flex-row justify-between items-center">
                        <div className="text-xs text-gray-400">
                          Attached Payment proof(s)
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2">
                        {paymentRequest?.paymentProofDocs?.map((doc, i) => {
                          const truncatedFileName =
                            doc?.length >= 16
                              ? `${doc?.slice(0, 12)}... ${doc?.slice(
                                  doc?.lastIndexOf(".")
                                )}`
                              : doc;
                          return (
                            <div className="flex flex-row items-center space-x-5">
                              <Tooltip title={doc}>
                                <Typography.Text ellipsis>
                                  <Link
                                    href={`${fend_url}/api/?folder=paymentRequests&name=${encodeURIComponent(
                                      doc
                                    )}`}
                                    target="_blank"
                                  >
                                    <div className="text-xs">
                                      <div className="flex flex-row space-x-1 items-center">
                                        {" "}
                                        <PaperClipOutlined />{" "}
                                        {truncatedFileName}
                                      </div>
                                    </div>
                                  </Link>
                                </Typography.Text>
                              </Tooltip>
                              {user?.permissions?.canApproveAsHof && (
                                <></>
                                // <UpdatePaymentReqDoc
                                //   iconOnly={true}
                                //   uuid={doc}
                                //   label="update"
                                //   reloadFileList={refresh}
                                //   paymentProof={true}
                                // />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {paymentRequest?.journalEntry &&
                    !paymentRequest?.journalEntry?.Memo && (
                      <div>
                        <Tag color="">
                          SAP Journal Entry: {paymentRequest?.journalEntry}
                        </Tag>
                        {/* {paymentRequest?.category == "internal" && (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col space-y-2">
                              <div className="mt-2">
                               

                                <Tag color="blue">
                                  Debit:{" "}
                                  {
                                    paymentRequest?.journalEntryLines[0]
                                      ?.AccountCode
                                  }{" "}
                                  -{" "}
                                  {
                                    paymentRequest?.journalEntryLines[0]
                                      ?.CostingCode
                                  }
                                </Tag>
                              </div>

                              <div>
                                <Tag color="orange">
                                  Credit:{" "}
                                  {
                                    paymentRequest?.journalEntryLines[1]
                                      ?.AccountCode
                                  }{" "}
                                  -{" "}
                                  {
                                    paymentRequest?.journalEntryLines[1]
                                      ?.CostingCode
                                  }
                                </Tag>
                              </div>
                            </div>
                          </div>
                        )} */}
                      </div>
                    )}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col rounded-xl space-y-5 bg-white px-4">
            <Typography.Title level={5}>Workflow tracker</Typography.Title>
            <Timeline
              items={[
                {
                  children: (
                    <div className="flex flex-col mb-1">
                      <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                        Review
                      </h6>
                      <small className="text-[#A3AEB4]">
                        You can perfom sourcing action here.
                      </small>
                    </div>
                  ),
                  color: paymentRequest?.status !== "declined" ? "blue" : "red",
                  dot:
                    paymentRequest?.status == "reviewed" ||
                    paymentRequest?.status?.includes("approved") ||
                    paymentRequest?.status == "paid" ? (
                      <FaCheck className=" text-green-500" />
                    ) : paymentRequest?.status == "declined" ? (
                      <RiForbidLine className=" text-red-500" />
                    ) : (
                      <LoadingOutlined className=" text-blue-500" />
                    ),
                },
                {
                  children: (
                    <div className="flex flex-col mb-1">
                      <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                        Approval
                      </h6>
                      <small className="text-[#A3AEB4]">
                        You can perfom sourcing action here.
                      </small>
                    </div>
                  ),
                  color:
                    paymentRequest?.status == "approved" ||
                    paymentRequest?.status == "paid"
                      ? "blue"
                      : "gray",
                  dot:
                    ((paymentRequest?.status == "approved" ||
                      paymentRequest?.status == "paid") && (
                      <MdApproval className=" text-green-500" />
                    )) ||
                    ((paymentRequest?.status == "reviewed" ||
                      paymentRequest?.status?.includes("approved (")) && (
                      <LoadingOutlined className=" text-blue-500" />
                    )),
                },
                {
                  children: (
                    <div className="flex flex-col mb-1">
                      <h6 className="m-0 py-0.5 px-0 text-[12px] text-[#344767]">
                        Payment
                      </h6>
                      <small className="text-[#A3AEB4]">
                        You can perfom sourcing action here.
                      </small>
                    </div>
                  ),
                  color: paymentRequest?.status == "paid" ? "blue" : "gray",
                  dot:
                    (paymentRequest?.status == "paid" && (
                      <MdOutlinePayments className=" text-green-500" />
                    )) ||
                    (paymentRequest?.status == "approved" && (
                      <LoadingOutlined className=" text-blue-500" />
                    )),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
