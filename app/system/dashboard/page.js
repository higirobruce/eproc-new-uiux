"use client";
import CountCard from "@/app/components/countCard";
import React, { useEffect, useState } from "react";
import {
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  DocumentIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import RequestStats from "@/app/components/requestsStatistics";
import RequestsByDep from "@/app/components/requestsByDep";
import RequestsByStatus from "@/app/components/requestsByStatus";
import { Divider, message, Spin, Select } from "antd";
import TendersStats from "@/app/components/tendersStatistics";
import TendersByDep from "@/app/components/tendersByDep";
import { LoadingOutlined } from "@ant-design/icons";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import { color, motion } from "framer-motion";
import {
  MdFileCopy,
  MdAttachFile,
  MdOutlineAllInbox,
  MdOutlinePendingActions,
  MdOutlinePayments,
} from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import { FaCaretUp,  } from "react-icons/fa";
import {
  Pie,
  Label,
  Cell,
  PieChart,
  BarChart,
  Bar,
  LineChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { isMobile } from "react-device-detect";
import NotificationComponent from "@/app/hooks/useMobile";
import { formatAmount } from "@/app/utils/helpers";

export default function page() {
  const [dataLoaded, setDataLoaded] = useState(false);
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear())
  const [internalUsers, setInternalUsers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [budgeted, setBudgeted] = useState(0);
  const [unbudgeted, setUnbudgeted] = useState(0);
  const [openTenders, setOpenTenders] = useState(0);
  const [closedTenders, setClosedTenders] = useState(0);
  const [avgBids, setAvgBids] = useState(0);
  const [totalOverview, setTotalOverview] = useState([]);
  const [paymentOverview, setPaymentOverview] = useState("");
  const [dashboardOverview, setDashboardOverview] = useState([]);
  const [spendOverview, setSpendOverview] = useState("")
  const [expenseOverview, setExpenseOverview] = useState([]);
  const [serviceCategories, setServiceCategories] = useState("");
  const router = useRouter();
  const [tab, setTab] = useState(0);

  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    try {
      setDataLoaded(true);
      loadServiceCategories()
        .then((res) => getResultFromServer(res))
        .then((res) => setServiceCategories(res))
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadTenders()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setTenders(res);
          loadAvgBidsPerTender()
            .then((res) => getResultFromServer(res))
            .then((res) => {
              // alert(JSON.stringify(res))
              setAvgBids(Math.round(res[0]?.avg * 100) / 100);
            });
          loadTendersStats()
            .then((res) => getResultFromServer(res))
            .then((res) => {
              setOpenTenders(Math.round((res?.open / res?.total) * 100) / 100);
              setClosedTenders(
                Math.round((res?.closed / res?.total) * 100) / 100
              );
            });
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadRequests()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setRequests(res);
          loadRequestsByBudgetStatus()
            .then((res) => getResultFromServer(res))
            .then((resBudg) => {
              let _budgeted = resBudg?.filter((r) => r._id === true);
              let _unbudgeted = resBudg?.filter((r) => r._id === false);
              let _total = _budgeted[0]?.count + _unbudgeted[0]?.count;
              setBudgeted(Math.round((_budgeted[0]?.count / _total) * 100));
              setUnbudgeted(Math.round((_unbudgeted[0]?.count / _total) * 100));
              setDataLoaded(true);
            });
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadContracts()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setContracts(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadPurchaseOrders()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setPurchaseOrders(res?.data);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadVendors()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setVendors(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      
      loadRequestOverview()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setTotalOverview(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadPayment()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setPayments(res)
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
  
      loadInternalUsers()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setInternalUsers(res)
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        })
  
      loadPaymentOverview()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setPaymentOverview(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
      loadDashboardOverview()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setDashboardOverview(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
      loadSpendTrackingOverview()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setSpendOverview(res)
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
      loadExpensePlanning()
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setExpenseOverview(res)
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
      setDataLoaded(false)
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Something happened! Please try again.",
      });
    }
  }, [year]);

  async function loadTenders() {
    return fetch(`${url}/tenders/`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadRequests() {
    return fetch(`${url}/requests/`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadContracts() {
    return fetch(`${url}/contracts/`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadPurchaseOrders() {
    return fetch(`${url}/purchaseOrders/`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadPayment() {
    return fetch(`${url}/paymentRequests`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadInternalUsers() {
    return fetch(`${url}/users`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadVendors() {
    return fetch(`${url}/users/vendors/`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadRequestsByBudgetStatus() {
    return fetch(`${url}/requests/countsByBudgetStatus`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadAvgBidsPerTender() {
    return fetch(`${url}/submissions/avgBidsPerTender`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadTendersStats() {
    return fetch(`${url}/tenders/stats`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadServiceCategories() {
    return fetch(`${url}/serviceCategories`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadRequestOverview() {
    return fetch(`${url}/requests/totalOverview?year=${year}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadPaymentOverview() {
    return fetch(`${url}/paymentRequests/totalOverview?year=${year}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadDashboardOverview() {
    return fetch(`${url}/dashboards?year=${year}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadSpendTrackingOverview() {
    return fetch(`${url}/paymentRequests/spendTracking?year=${year}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadExpensePlanning() {
    return fetch(`${url}/paymentRequests/expensePlanning?year=${year}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/dashboard/&sessionExpired=true`);
      throw Error("Unauthorized");
    } else {
      return res.json();
    }
  }

  const departmentExpanditure = [
    { name: "CK", value: "400", current: 300 },
    { name: "P&C", value: "300", current: 600 },
    { name: "Ops", value: "200", current: 700 },
    { name: "D&F", value: "500", current: 400 },
    { name: "PoC", value: "400", current: 200 },
    { name: "UY", value: "300", current: 500 },
    { name: "G&I", value: "200", current: 600 },
    { name: "H&C", value: "500", current: 400 },
    { name: "I&B", value: "400", current: 300 },
    { name: "Kos", value: "300", current: 500 },
    { name: "L&D", value: "200", current: 300 },
  ];

  const purchaseData = [
    { name: "JAN", value: "400", current: 300 },
    { name: "FEB", value: "300", current: 600 },
    { name: "MAR", value: "200", current: 700 },
    { name: "APR", value: "500", current: 400 },
    { name: "MAY", value: "400", current: 200 },
    { name: "JUN", value: "300", current: 500 },
    { name: "JUL", value: "200", current: 600 },
    { name: "AUG", value: "500", current: 400 },
    { name: "SEP", value: "400", current: 300 },
    { name: "OCT", value: "300", current: 500 },
    { name: "NOV", value: "200", current: 300 },
  ];

  const data = [
    {
      name: "JAN",
      value: 4000,
      current: 2400,
    },
    {
      name: "FEB",
      value: 3000,
      current: 1398,
    },
    {
      name: "MAR",
      value: 2000,
      current: 9800,
    },
    {
      name: "APR",
      value: 2780,
      current: 3908,
    },
    {
      name: "MAY",
      value: 1890,
      current: 4800,
    },
    {
      name: "JUN",
      value: 2390,
      current: 3800,
    },
    {
      name: "JULY",
      value: 3490,
      current: 4300,
    },
  ];

  const budgetData = [
    { name: "Group A", value: 400 },
    { name: "Group B", value: 300 },
  ];

  const statusColors = ["#7B2CBF", "#E76F51", "#277DA1", "#1677FF", "#E76F51"];

  const COLORS = ["#14445C", "#F3B700"];
  const COLORS_OVERVIEW = ["#878FF6", "#dfe1fc", "#b3b8ff"];

  const CustomYAxisTick = ({ x, y, payload }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(0)"
        fontSize={11}
      >
        {payload.value}
      </text>
    </g>
  );

  function combineWithDescriptions(serviceCatData, descriptionArray) {
    // Get all unique keys from serviceCatData
    const keys = new Set();
    serviceCatData?.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        keys.add(key);
      });
    });

    // Get all description values from descriptionArray
    const descriptions = {};
    descriptionArray?.forEach((obj) => {
      descriptions[obj.description] = obj._id;
    });

    // Create new objects with missing keys from descriptionArray
    const result = serviceCatData?.map((obj) => {
      const newObj = { ...obj };
      Object.keys(descriptions).forEach((key) => {
        if (!newObj.hasOwnProperty(key)) {
          newObj[key] = null;
        }
      });
      return newObj;
    });

    return result;
  }

  const combinedData = combineWithDescriptions(totalOverview?.serviceCatData, [
    ...serviceCategories,
    { description: "Others", _id: "65a97c70ee824f3e8d2d2748" },
    { description: "", _id: "65a97c70ee824f3e8d2d2jf8" },
  ]);

  function getMonthsUpToCurrentMonth() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-indexed, so January is 0
    const currentYear = currentDate.getFullYear();

    const months = [];

    for (let month = 0; month <= currentMonth; month++) {
      const monthName = new Date(currentYear, month)
        .toLocaleString("default", { month: "long" })
        .toUpperCase()
        .slice(0, 3);
      months.push(monthName);
      // If you prefer to push month numbers instead:
      // months.push(month + 1);
    }

    return months;
  }

  function transformData(data) {
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR"
    ];

    const result = months.map((month) => ({
      name: month,
      contracts: 0,
      tenders: 0,
      purchaseOrders: 0,
    }));

    if(data) {
      for (const [key, value] of Object?.entries(data)) {
        const monthIndex = months.indexOf(key);
        if (monthIndex !== -1) {
          for (const entry of value) {
            for (const prop in entry) {
              if (prop !== "_id" && prop !== "month") {
                result[monthIndex][prop] = entry[prop];
              }
            }
          }
        }
      }
    }

    return result;
  }

  function generateYearsArray() {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const yearsArray = [];

    for (let year = startYear; year <= currentYear; year++) {
        yearsArray.push({value: year, label: `${year}`});
    }

    return yearsArray;
  }

  const dashboardOverviewData = transformData(dashboardOverview.data);

  const CustomTooltip = ({active, payload, label}) => {
    if(active && payload && payload?.length) {
      return (
        <div className="bg-white px-3 py-1.5 rounded-md shadow-lg">
          <p>{`${payload[0]?.payload?.payload?._id}: ${payload[0]?.value}`}</p>
        </div>
      )
    }
  }

  return (
    <>
      {isMobile && <NotificationComponent />}
      {contextHolder}

      {dataLoaded ? (
        <div className="payment-request lg:mr-6 mb-10 pl-5 h-screen overflow-x-auto">
          {/* <div className="mt-5 flex justify-between w-full">
            <div>
              <h5 className="text-[#12263F] text-[22px] mb-2 mx-0 mt-0">
                Dashboards
              </h5>
            </div>
          </div> */}
          <div className="flex justify-end mb-4 mr-1">
            <Select
              defaultValue={year}
              style={{ width: 120 }}
              size="large"
              className="border-0"
              onChange={(value) => setYear(value)}
              options={generateYearsArray()}
            />
          </div>
          <div className="grid xl:grid-cols-7 md:grid-cols-4 gap-3 my-4">
            {[
              { name: "Purchase request", value: requests?.length, color: '#4B59D4' },
              { name: "Payment request", value: payments?.length, color: '#7EC2C6' },
              { name: "Tenders", value: tenders?.length, color: '#5A58CB' },
              { name: "Contract", value: contracts?.length, color: '#679AF3' },
              { name: "Purchase Orders", value: purchaseOrders?.length, color: '#E4C1A0' },
              { name: "Vendors", value: vendors?.length, color: '#6A76D7' },
              { name: "Internal Users", value: internalUsers?.length, color: '#D25C8D' },
            ].map((item, key) => (
              <div className="flex gap-x-4 bg-[#FFF] py-2 px-4 rounded-lg">
                {/* <div className={`border-l-0 border-3 border-solid border-[${item.color}] rounded-xxl`} /> */}
                <div className="flex flex-grow flex-col gap-y-1">
                  <div className="w-full flex justify-between">
                    <h4 className="mt-2 mb-0 text-[#040518]">{item.value}</h4>
                    <div className={`flex justify-center items-center bg-[${item?.color + '22'}] rounded-lg p-2.5`}>
                      <DocumentIcon color={item.color} className={`h-4 w-4 text-{${item.color}}`} />
                    </div>
                  </div>
                  <small key={key} className="text-[#505152] font-medium">
                    {item.name}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg p-3 my-1">
            <div className="flex items-center gap-x-14 px-5 bg-[#F5F5F5]">
              <button
                className={`bg-transparent py-3 my-3 ${
                  tab == 0
                    ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                    : `border-none text-[#8392AB]`
                } text-[14px] cursor-pointer`}
                onClick={() => setTab(0)}
              >
                Overview
              </button>
              <button
                className={`bg-transparent py-3 my-3 ${
                  tab == 1
                    ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                    : `border-none text-[#8392AB]`
                } text-[14px] cursor-pointer`}
                onClick={() => setTab(1)}
              >
                Spend Tracking
              </button>
              <button
                className={`bg-transparent py-3 my-3 ${
                  tab == 2
                    ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                    : `border-none text-[#8392AB]`
                } text-[14px] cursor-pointer`}
                onClick={() => setTab(2)}
              >
                Expense Planning
              </button>
            </div>
          </div>
          {tab == 0 ? (
            <div className="payment-request bg-white h-[calc(100vh-310px)] pb-10 rounded-lg p mt-3 pt-6 overflow-y-auto lg:px-5 py-3">
              {/* Purchase Request Graph Mapping */}
              {/* <span className="text-[17px] font-semibold text-[#12263F] mt-10 pt-10">
                Module Lead time
              </span> */}
              {/* <div className="grid xl:grid-cols-3 grid-cols-1 items-start gap-x-8 my-5">
                <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                  <small className="text-[#242426] text-[15px] font-medium">Purchase Requests</small>
                  <div className="flex items-center w-5/6 mt-5">
                    <div className="bg-white flex-grow py-3 px-5">
                      <small className="text-[#848CA1]">Avg. Approval time</small>
                    </div>
                    <div className="px-8 py-3">
                      <small className="text-[14.5px] font-semibold">{totalOverview?.leadTimeDays} <small> Days</small></small>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                  <small className="text-[#242426] text-[15px] font-medium">Payments Requests</small>
                  <div className="flex items-center w-5/6 mt-5">
                    <div className="bg-white flex-grow py-3 px-5">
                      <small className="text-[#848CA1]">Avg. Approval time</small>
                    </div>
                    <div className="px-8 py-3">
                      <small className="text-[14.5px] font-semibold">{paymentOverview?.leadTimeDays} <small> Days</small></small>
                    </div>
                  </div>
                </div>
                <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                  <small className="text-[#242426] text-[15px] font-medium">PO's, Contracts</small>
                  <div className="flex items-center w-5/6 mt-5">
                    <div className="bg-white flex-grow py-3 px-5">
                      <small className="text-[#848CA1]"><b>PO</b> lead time</small>
                    </div>
                    <div className="px-8 py-3">
                      <small className="text-[14.5px] font-semibold">{dashboardOverview?.posLeadTime} <small> Days</small></small>
                    </div>
                  </div>
                  <div className="flex items-center w-5/6 mt-3">
                    <div className="bg-white flex-grow py-3 px-5">
                      <small className="text-[#848CA1]"><b>Contract</b> lead time</small>
                    </div>
                    <div className="px-8 py-3">
                      <small className="text-[14.5px] font-semibold">{dashboardOverview?.contractsLeadTime} <small> Days</small></small>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="grid grid-cols-3 gap-y-10 px-4 items-start">
                <div className="col-span-2 pb-8">
                  <span className="text-[17px] font-semibold text-[#12263F]">
                    Purchase Request
                  </span>
                  <div className="pt-8">
                    <span className="text-[14px] font-semibold text-[#12263F] p-5 m-5">
                      Budgeted Vs Non-Budgeted
                    </span>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        data={totalOverview?.data}
                      >
                        <XAxis
                          dataKey="month"
                          tickMargin={20}
                          tick={{ fontSize: 11 }}
                          tickSize={0}
                          axisLine={{ strokeDasharray: "5 5" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickMargin={20}
                          tickSize={0}
                          tick={<CustomYAxisTick />}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey={"budgeted"}
                          stroke="#E76F51"
                          dot={false}
                          strokeWidth={4}
                        />
                        <Line
                          type="monotone"
                          dataKey={"nonbudgeted"}
                          stroke="#F3B700"
                          dot={false}
                          strokeWidth={4}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="pt-8">
                    <span className="text-[14px] font-semibold text-[#12263F] p-5 m-5">
                      By Service Category
                    </span>
                    <ResponsiveContainer
                      width="100%"
                      height={220}
                      className={"mt-5"}
                    >
                      <BarChart
                        data={combinedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis
                          dataKey="name"
                          tickMargin={20}
                          tick={{ fontSize: 11 }}
                          tickSize={0}
                          axisLine={{ strokeDasharray: "5 5" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickMargin={30}
                          tickSize={0}
                          tick={<CustomYAxisTick />}
                        />
                        <Tooltip />

                        {Object?.keys(combinedData && combinedData[0]).map((key, index) => {
                          if (key !== "month" && key !== "name") {
                            return (
                              <Bar
                                key={key}
                                dataKey={key}
                                stackId="a"
                                fill={statusColors[index % statusColors.length]}
                                barSize={40}
                                
                              />
                            );
                          }
                          return null;
                        })}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="col-span-1 flex flex-col px-4 pt-5 bg-[#F9FAFD]">
                  <div className="pb-3">
                    <span className="text-[14px] font-semibold text-[#12263F]">
                      Sourcing methods
                    </span>
                  </div>
                  <div className="flex xl:flex-row flex-col xl:items-center xl:gap-x-5 gap-y-4 mb-5">
                    <ResponsiveContainer width="97%" height={160}>
                      <PieChart
                        margin={{ top: 20, right: 0, left: 20, bottom: 5 }}
                      >
                        <Pie
                          data={totalOverview?.sourcingData}
                          cx={50}
                          cy={50}
                          startAngle={360}
                          endAngle={0}
                          innerRadius={59}
                          outerRadius={69}
                          fill="#8884d8"
                          paddingAngle={5}
                          cornerRadius={10}
                          dataKey="total"
                        >
                          {totalOverview?.sourcingData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={["#0B7A75", "#FFF1D0", "#BC4749"][index]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="xl:flex hidden flex-col gap-y-3 -mt-5">
                      {totalOverview?.sourcingData?.map((item, key) => (
                        <div className="flex items-center gap-x-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full bg-[${
                              ["#0B7A75", "#FFF1D0", "#BC4749"][key]
                            }]`}
                          />
                          <span className="text-[13px] text-[#6C757D]">
                            {item?._id}
                          </span>
                          <span className="text-[13px] text-[#6C757D]">
                            {item?.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="py-3">
                    <span className="text-[14px] font-semibold text-[#12263F]">
                      Approval process
                    </span>
                  </div>
                  <div className="flex xl:flex-row flex-col xl:items-center xl:gap-x-5 gap-y-4 mb-5">
                    <ResponsiveContainer width="97%" height={160}>
                      <PieChart
                        margin={{ top: 20, right: 0, left: 20, bottom: 5 }}
                      >
                        <Pie
                          data={totalOverview?.statusData}
                          cx={50}
                          cy={50}
                          startAngle={360}
                          endAngle={0}
                          innerRadius={59}
                          outerRadius={69}
                          fill="#8884d8"
                          paddingAngle={5}
                          cornerRadius={10}
                          dataKey="total"
                        >
                          {totalOverview?.statusData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={["#0B7A75", "#277DA1", "#FFF1D0"][index]}
                            />
                          ))}
                        </Pie>
                        <Tooltip  content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="xl:flex hidden flex-col gap-y-3 xl:-mt-5">
                      {totalOverview?.statusData?.map((item, key) => (
                        <div className="flex items-center gap-x-2">
                          <div
                            className={`w-2 h-2 rounded-full bg-[${
                              ["#0B7A75", "#277DA1", "#FFF1D0"][key]
                            }]`}
                          />
                          <span className="text-[13px] text-[#6C757D]">
                            {item?._id}
                          </span>
                          <span className="text-[13px] text-[#6C757D]">
                            {item?.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center w-full mt-5 mb-10 border-t border-b-0 border-x-0 border-solid border-[#F1F3FF] pt-5">
                    <div className="bg-white flex-grow py-3 px-5">
                      <small className="text-[15px] text-[#555b69]">Avg. Approval time</small>
                    </div>
                    <div className="px-8 py-3">
                      <small className="text-[14.5px] font-semibold">{totalOverview?.leadTimeDays} <small> Days</small></small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-10 mt-5 px-4 items-start">
                <div className="col-span-2 py-8">
                  <span className="text-[17px] font-semibold text-[#12263F]">
                    Payment Request
                  </span>
                  {/* <div className="w-full py-5 flex justify-center items-center gap-x-8 mt-4">
                    {el.labels.map((label, i) => (
                      <div
                        key={i}
                        className="flex flex-col space-y-3 items-center"
                      >
                        <div className="flex items-center gap-x-2">
                          <div
                            className={`w-2 h-2 rounded-full bg-[${label?.color}]`}
                          />
                          <span className="text-[15px] text-[#6C757D]">
                            {label?.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div> */}
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      data={paymentOverview?.data}
                    >
                      <XAxis
                        dataKey="month"
                        tickMargin={20}
                        tick={{ fontSize: 11 }}
                        tickSize={0}
                        axisLine={{ strokeDasharray: "5 5" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickMargin={20}
                        tickSize={0}
                        tick={<CustomYAxisTick />}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey={"budgeted"}
                        stroke="#34AEB3"
                        dot={false}
                        strokeWidth={4}
                      />
                      <Line
                        type="monotone"
                        dataKey={"nonbudgeted"}
                        stroke="#53D084"
                        dot={false}
                        strokeWidth={4}
                      />
                      <Line
                        type="monotone"
                        dataKey={"total"}
                        stroke="#FF5555"
                        dot={false}
                        strokeWidth={1}
                        strokeDasharray="5 5"
                      />
                      {/* <Line
                        type="monotone"
                        dataKey={"value"}
                        stroke="#878FF6"
                        dot={false}
                        strokeWidth={3}
                      /> */}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-1 flex flex-col px-4 pt-5 bg-[#F9FAFD]">
                  <div className="my-5">
                    <span className="text-[14px] font-semibold text-[#12263F]">
                      Approval process
                    </span>
                  </div>
                  <div className="flex xl:flex-row flex-col items-center xl:gap-x-5">
                    <ResponsiveContainer width="97%" height={160}>
                      <PieChart
                        margin={{ top: 20, right: 0, left: 20, bottom: 5 }}
                      >
                        <Pie
                          data={paymentOverview?.statusData}
                          cx={50}
                          cy={50}
                          startAngle={360}
                          endAngle={0}
                          innerRadius={59}
                          outerRadius={69}
                          fill="#8884d8"
                          paddingAngle={5}
                          cornerRadius={10}
                          dataKey="total"
                        >
                          {paymentOverview?.statusData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={["#0B7A75", "#FFF1D0", "#277DA1"][index]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="xl:flex hidden flex-col gap-y-3 -mt-5">
                      {paymentOverview?.statusData?.map((item, key) => (
                        <div className="flex items-center gap-x-2">
                          <div
                            className={`w-2 h-2 rounded-full bg-[${
                              ["#0B7A75", "#FFF1D0", "#277DA1"][key]
                            }]`}
                          />
                          <span className="text-[13px] text-[#6C757D]">
                            {item?._id}
                          </span>
                          <span className="text-[13px] text-[#6C757D]">
                            {item?.total}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center w-full mt-5 mb-10 border-t border-b-0 border-x-0 border-solid border-[#F1F3FF] pt-5">
                    <div className="bg-white flex-grow py-3 px-5">
                      <small className="text-[15px] text-[#555b69]">Avg. Approval time</small>
                    </div>
                    <div className="px-8 py-3">
                      <small className="text-[14.5px] font-semibold">{paymentOverview?.leadTimeDays} <small> Days</small></small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-x-10 mt-5 pb-28 px-4 items-start">
                <div className="col-span-2 py-8">
                  <span className="text-[14px] font-semibold text-[#12263F]">
                    PO, Contracts & Tenders
                  </span>
                  <div className="w-full py-5 flex justify-center items-center gap-x-8 mt-4">
                    {[
                      { name: "Tenders", color: "#31D5A6" },
                      { name: "Contracts", color: "#F5B50F" },
                      { name: "Purchase Orders", color: "#878FF6" },
                    ].map((label, i) => (
                      <div
                        key={i}
                        className="flex flex-col space-y-3 items-center"
                      >
                        <div className="flex items-center gap-x-2">
                          <div
                            className={`w-2 h-2 rounded-full bg-[${label?.color}]`}
                          />
                          <span className="text-[15px] text-[#6C757D]">
                            {label?.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={480}>
                    <LineChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      data={dashboardOverviewData}
                    >
                      <XAxis
                        dataKey="name"
                        tickMargin={20}
                        tick={{ fontSize: 11 }}
                        tickSize={0}
                        axisLine={{ strokeDasharray: "5 5" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickMargin={20}
                        tickSize={0}
                        tick={<CustomYAxisTick />}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey={"tenders"}
                        stroke="#31D5A6"
                        dot={false}
                        strokeWidth={4}
                      />
                      <Line
                        type="monotone"
                        dataKey={"contracts"}
                        stroke="#F5B50F"
                        dot={false}
                        strokeWidth={4}
                      />
                      <Line
                        type="monotone"
                        dataKey={"purchaseOrders"}
                        stroke="#878FF6"
                        dot={false}
                        strokeWidth={4}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-1 flex flex-col px-4 bg-[#F9FAFD] mt-7 py-5">
                  <div className="flex flex-col">
                    {dashboardOverview?.statusData?.tenders?.length > 0 && <div className="py-3">
                      <span className="text-[14px] font-semibold text-[#12263F]">
                        Tenders
                      </span>
                    </div>}
                    <div className="flex xl:flex-row flex-col xl:items-center xl:gap-x-5 gap-y-4 mb-5">
                      <ResponsiveContainer width="97%" height={140}>
                        <PieChart
                          margin={{
                            top: 20,
                            right: 0,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <Pie
                            data={dashboardOverview?.statusData?.tenders}
                            cx={50}
                            cy={50}
                            startAngle={360}
                            endAngle={0}
                            innerRadius={59}
                            outerRadius={69}
                            fill="#31D5A6"
                            paddingAngle={5}
                            cornerRadius={10}
                            dataKey="total"
                          >
                            {dashboardOverview?.statusData?.tenders?.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#0B7A75", "#FFF1D0", "#277DA1"][index]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-y-3 -mt-5">
                        {dashboardOverview?.statusData?.tenders?.map((item, key) => (
                          <div className="xl:flex hidden items-center gap-x-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-[${["#F3B700", "#0065DD", "#7B2CBF"][key]}]`}
                            />
                            <span className="text-[13px] text-[#6C757D]">
                              {item?._id}
                            </span>
                            <span className="text-[13px] text-[#6C757D]">
                              {item?.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {dashboardOverview?.statusData?.contracts?.length > 0 && <div className="py-3">
                      <span className="text-[14px] font-semibold text-[#12263F]">
                        Contracts
                      </span>
                    </div>}
                    <div className="flex xl:flex-row flex-col items-center xl:gap-x-5 gap-y-4 mb-5">
                      <ResponsiveContainer width="97%" height={140}>
                        <PieChart
                          margin={{
                            top: 20,
                            right: 0,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <Pie
                            data={dashboardOverview?.statusData?.contracts}
                            cx={50}
                            cy={50}
                            startAngle={360}
                            endAngle={0}
                            innerRadius={59}
                            outerRadius={69}
                            fill="#F5B50F"
                            paddingAngle={5}
                            cornerRadius={10}
                            dataKey="total"
                          >
                            {dashboardOverview?.statusData?.contracts?.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#0B7A75", "#FFF1D0", "#277DA1"][index]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="xl:flex hidden flex-col gap-y-3 -mt-5">
                        {dashboardOverview?.statusData?.contracts?.map((item, key) => (
                          <div className="flex items-center gap-x-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-[${["#F3B700", "#0065DD", "#7B2CBF"][key]}]`}
                            />
                            <span className="text-[13px] text-[#6C757D]">
                              {item?._id}
                            </span>
                            <span className="text-[13px] text-[#6C757D]">
                              {item?.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {dashboardOverview?.statusData?.purchaseOrders.length > 0 && <div className="py-3">
                      <span className="text-[14px] font-semibold text-[#12263F]">
                        Purchase Orders
                      </span>
                    </div>}
                    {dashboardOverview?.statusData?.purchaseOrders.length > 0 && <div className="flex xl:flex-row flex-col items-center xl:gap-x-5 gap-y-4 mb-5">
                      <ResponsiveContainer width="97%" height={140}>
                        <PieChart
                          margin={{
                            top: 20,
                            right: 0,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <Pie
                            data={dashboardOverview?.statusData?.purchaseOrders}
                            cx={50}
                            cy={50}
                            startAngle={360}
                            endAngle={0}
                            innerRadius={59}
                            outerRadius={69}
                            fill="#878FF6"
                            paddingAngle={5}
                            cornerRadius={10}
                            dataKey="total"
                          >
                            {dashboardOverview?.statusData?.purchaseOrders?.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={["#0B7A75", "#FFF1D0", "#277DA1"][index]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="xl:flex hidden flex-col gap-y-3 -mt-5">
                        {dashboardOverview?.statusData?.purchaseOrders?.map((item, key) => (
                          <div className="flex items-center gap-x-2">
                            <div
                              className={`w-1.5 h-1.5 rounded-full bg-[${["#F3B700", "#0065DD", "#7B2CBF"][key]}]`}
                            />
                            <span className="text-[13px] text-[#6C757D]">
                              {item?._id}
                            </span>
                            <span className="text-[13px] text-[#6C757D]">
                              {item?.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>}
                    <div className="flex items-center w-full mt-5">
                      <div className="bg-white flex-grow py-3 px-5">
                        <small className="text-[15px] text-[#555b69]"><b>PO</b> lead time</small>
                      </div>
                      <div className="px-8 py-3">
                        <small className="text-[14.5px] font-semibold">{dashboardOverview?.posLeadTime} <small> Days</small></small>
                      </div>
                    </div>
                    <div className="flex items-center w-full mt-3">
                      <div className="bg-white flex-grow py-3 px-5">
                        <small className="text-[15px] text-[#555b69]"><b>Contract</b> lead time</small>
                      </div>
                      <div className="px-8 py-3">
                        <small className="text-[14.5px] font-semibold">{dashboardOverview?.contractsLeadTime} <small> Days</small></small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : tab == 1 ? (
            <div className="payment-request bg-white h-[calc(100vh-310px)] pb-10 rounded-lg mt-3 overflow-y-auto px-5 py-3">
              <div className="grid grid-cols-7 gap-x-8 bg-[#F9FAFD] p-4">
                <div className="col-span-5">
                  <span className="text-[16px] text-[#12263F]">
                    Amount Paid vs Requests over time
                  </span>
                  <div className="bg-white w-full py-3 grid grid-cols-2 justify-center mt-4">
                    <div className="flex flex-col space-y-2 items-center">
                      <div className="flex items-center gap-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#D2DDEC]" />
                        <span className="text-[15px] text-[#6C757D]">
                          Amount Paid
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 items-center">
                      <div className="flex items-center gap-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#2C7BE5]" />
                        <span className="text-[15px] text-[#6C757D]">
                          Payment Request
                        </span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                      data={spendOverview?.data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="month"
                        tickMargin={20}
                        tick={{ fontSize: 11 }}
                        tickSize={0}
                        axisLine={{ strokeDasharray: "5 5" }}
                      />
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        axisLine={false}
                        tickMargin={20}
                        tickSize={0}
                        tick={<CustomYAxisTick />}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickMargin={20}
                        tickSize={0}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip />
                      <Bar
                        yAxisId="left"
                        dataKey="requests"
                        fill="#277DA1"
                        barSize={20}
                        radius={0}
                      />
                      <Bar
                        yAxisId="right"
                        dataKey="total_paid"
                        fill="#4C956C"
                        barSize={20}
                        radius={0}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-3 col-span-2">
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-6">
                        Total Amount
                      </h6>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-0">
                        ${formatAmount(spendOverview?.totals[0]?.total_amount)}
                      </h2>
                    </div>
                    <PiCurrencyCircleDollarFill
                      size={24}
                      className="text-[#95AAC9]"
                    />
                  </div>
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-0">
                        Total Requests
                      </h6>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-4">
                        {spendOverview?.totals[0]?.total_requests}
                      </h2>
                    </div>
                    <MdOutlinePendingActions
                      size={22}
                      className="text-[#95AAC9]"
                    />
                  </div>
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-0">
                        Average
                      </h6>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-4">
                        ${formatAmount(spendOverview?.totals[0]?.average_request)} / requests
                      </h2>
                    </div>
                    <MdOutlinePayments size={24} className="text-[#95AAC9]" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 space-x-4 pb-20 mt-5">
                <div className="col-span-1 bg-[#F9FAFD] flex flex-col justify-between">
                  <div className="m-5">
                    <span className="text-[16px] text-[#12263F]">
                      Budget Comparison
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <Pie
                          data={spendOverview?.budgetData}
                          cx={130}
                          cy={120}
                          startAngle={360}
                          endAngle={0}
                          innerRadius={80}
                          outerRadius={95}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {spendOverview?.budgetData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip  />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col bg-white px-6 py-3.5 space-y-3 mr-12 -mt-10">
                      <span className="text-[13px] text-[#A1A7AD]">
                        Budgeted
                      </span>
                      <span className="text-[23px] text-[#12263F]">
                        <b>{formatAmount(((spendOverview?.totals[0]?.total_amount / spendOverview?.budgetData[0]?.value) * 100).toFixed(2))}%</b>
                      </span>
                      <span className="text-[13px] text-[#12263F]">
                        <b>${formatAmount(spendOverview?.budgetData[0]?.value)}</b>/{formatAmount(spendOverview?.budgetData[1]?.value)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full flex space-x-5 justify-center mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-[#2C7BE5]" />
                      <small className="text-[#A2B4D0] font-light">
                        Budgeted
                      </small>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-[#D2DDEC]" />
                      <small className="text-[#A2B4D0] font-light">
                        Un-Budgeted
                      </small>
                    </div>
                  </div>
                </div>
                <div className="w-full col-span-2 bg-[#F9FAFD]">
                  <div className="m-5">
                    <span className="text-[16px] text-[#12263F]">
                      Department Expenditures
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={dashboardOverview?.departmentExpanditure}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis
                        dataKey="name"
                        tickMargin={20}
                        tick={{ fontSize: 11 }}
                        tickSize={0}
                        axisLine={{ strokeDasharray: "5 5" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickMargin={20}
                        tickSize={0}
                        tick={<CustomYAxisTick />}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="budgeted"
                        stackId="a"
                        fill="#277DA1"
                        barSize={20}
                        radius={0}
                      />
                      <Bar
                        dataKey="nonBudgeted"
                        stackId="a"
                        fill="#FFF1D0"
                        barSize={20}
                        radius={0}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <div className="payment-request bg-white h-[calc(100vh-310px)] rounded-lg mt-3 overflow-y-auto px-5 py-3">
              <div className="grid grid-cols-5 gap-x-8 bg-[#F9FAFD] py-4 px-3 my-4">
                <div className="col-span-4">
                  <span className="text-[16px] text-[#12263F]">
                    Expense Planning
                  </span>
                  <div className="bg-white w-full py-5 grid grid-cols-2 justify-center mt-4">
                    <div className="flex flex-col space-y-3 items-center">
                      <div className="flex items-center gap-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#E76F51]" />
                        <span className="text-[15px] text-[#6C757D]">
                          Internal Requests
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-3 items-center">
                      <div className="flex items-center gap-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#277DA1]" />
                        <span className="text-[15px] text-[#6C757D]">
                          External Requests
                        </span>
                      </div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      data={expenseOverview?.data}
                    >
                      <XAxis
                        dataKey="month"
                        tickMargin={20}
                        tick={{ fontSize: 11 }}
                        tickSize={0}
                        axisLine={{ strokeDasharray: "5 5" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickMargin={20}
                        tickSize={0}
                        tick={<CustomYAxisTick />}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="internal_requests"
                        stroke="#E76F51"
                        dot={false}
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="external_requests"
                        stroke="#277DA1"
                        dot={false}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col space-y-3 col-span-1">
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-6">
                        Total Requests Amount
                      </h6>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-0">
                        ${formatAmount(expenseOverview?.totals[0]?.total_requests_amount)}
                      </h2>
                    </div>
                    <PiCurrencyCircleDollarFill
                      size={24}
                      className="text-[#95AAC9]"
                    />
                  </div>
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <div>
                        <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-0">
                          Total Pending Payments
                        </h6>
                        {/* <span className="text-[#95AAC9] font-light text-[12px] mt-0 mb-0"> (this week)</span> */}
                      </div>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-4">
                        ${formatAmount(expenseOverview?.totals[0]?.total_pending_payments)}
                      </h2>
                    </div>
                    <MdOutlinePendingActions
                      size={22}
                      className="text-[#95AAC9]"
                    />
                  </div>
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <div>
                        <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-0">
                          Pending Payments Requests
                        </h6>
                        <span className="text-[#95AAC9] font-light text-[12px] mt-0 mb-0">
                          {" "}
                          {/* (this week) */}
                        </span>
                      </div>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-4">
                        {expenseOverview?.totals[0]?.count_pending_payments}
                      </h2>
                    </div>
                    <MdOutlinePayments size={24} className="text-[#95AAC9]" />
                  </div>
                </div>
              </div>
              <div className="w-full col-span-2 pt-5 bg-[#F9FAFD] pb-16 px-3 my-4">
                <span className="text-[16px] text-[#12263F]">
                  Department Expenditures
                </span>
                <div className="bg-white w-full py-5 grid grid-cols-2 justify-center mt-4">
                  <div className="flex flex-col space-y-3 items-center mx-5">
                    <div className="flex items-center gap-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#797774]" />
                      <span className="text-[15px] text-[#cccecf]">
                        Internal Requests
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 items-center">
                    <div className="flex items-center gap-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#277DA1]" />
                      <span className="text-[15px] text-[#6C757D]">
                        External Requests
                      </span>
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={expenseOverview?.dapartmentalExpenses}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis
                      dataKey="name"
                      tickMargin={20}
                      tick={{ fontSize: 11 }}
                      tickSize={0}
                      axisLine={{ strokeDasharray: "5 5" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickMargin={20}
                      tickSize={0}
                      tick={<CustomYAxisTick />}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="external_requests"
                      stackId="a"
                      fill="#277DA1"
                      barSize={20}
                      radius={0}
                    />
                    <Bar
                      dataKey="internal_requests"
                      stackId="a"
                      fill="#cccecf"
                      barSize={20}
                      radius={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 mr-6 my-5">
            <div className="bg-white rounded p-5">
              <div className="flex items-center gap-7">
                <div className="w-16 h-16 flex justify-center items-center rounded-full bg-[#E9EAF5]">
                  <MdOutlineAllInbox size={22} className="text-[#506A73]" />
                </div>
                <div className="-mt-3">
                  <h4 className="text-[#070F44] font-semibold mb-1">23</h4>
                  <small className="text-[#455A6A] text-[11px]">
                    Total Requests
                  </small>
                </div>
              </div>
            </div>
            <div className="bg-white rounded p-5">
              <div className="flex items-center gap-7">
                <div className="w-16 h-16 flex justify-center items-center rounded-full bg-[#E9EAF5]">
                  <MdFileCopy size={22} className="text-[#506A73]" />
                </div>
                <div className="-mt-3">
                  <h4 className="text-[#070F44] font-semibold mb-1">34</h4>
                  <small className="text-[#455A6A] text-[11px]">
                    Total Tenders
                  </small>
                </div>
              </div>
            </div>
            <div className="bg-white rounded p-5">
              <div className="flex items-center gap-7">
                <div className="w-16 h-16 flex justify-center items-center rounded-full bg-[#F4F5D4]">
                  <MdAttachFile size={22} className="text-[#506A73]" />
                </div>
                <div className="-mt-3">
                  <h4 className="text-[#070F44] font-semibold mb-1">34</h4>
                  <small className="text-[#455A6A] text-[11px]">
                    Total Contracts
                  </small>
                </div>
              </div>
            </div>
            <div className="bg-white rounded p-5">
              <div className="flex items-center gap-7">
                <div className="w-16 h-16 flex justify-center items-center rounded-full bg-[#D4F5F3]">
                  <FiUsers size={22} className="text-[#506A73]" />
                </div>
                <div className="-mt-3">
                  <h4 className="text-[#070F44] font-semibold mb-1">6+</h4>
                  <small className="text-[#455A6A] text-[11px]">
                    Total Vendors
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-4 mr-6 my-5">
            <div className="bg-white rounded-lg px-5 h-96">
              <h6>Requests by Category</h6>
            </div>
            <div className="bg-white rounded-lg px-5 h-96">
              <h6>Requests by Department</h6>
            </div>
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-lg px-5 h-full">
                <h6>Requests by Status</h6>
              </div>
              <div className="bg-white rounded-lg px-5 h-full">
                <h6>Budgeted vs Unbudgeted Breakdown</h6>
              </div>
            </div>
          </div> */}
          {/* <div className="grid lg:grid-cols-2 gap-4 mr-6 my-5">
            <div className="bg-white rounded-lg px-5 h-96">
              <h6>Tenders by Category</h6>
            </div>
            <div className="bg-white rounded-lg px-5 h-96">
              <h6>Tenders by Department</h6>
            </div>
          </div> */}
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
