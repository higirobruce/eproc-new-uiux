"use client";
import React, { useEffect, useState } from "react";
import { DocumentIcon } from "@heroicons/react/24/outline";

import { message, Spin, Select } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import { MdOutlinePendingActions, MdOutlinePayments } from "react-icons/md";
import { PiCurrencyCircleDollarFill } from "react-icons/pi";
import { isMobile } from "react-device-detect";
import NotificationComponent from "@/app/hooks/useMobile";
import { formatAmount } from "@/app/utils/helpers";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function page() {
  const [dataLoaded, setDataLoaded] = useState(false);

  const [requests, setRequests] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [currency, setCurrency] = useState("RWF");
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
  const [spendOverview, setSpendOverview] = useState("");
  const [expenseOverview, setExpenseOverview] = useState([]);
  const [serviceCategories, setServiceCategories] = useState("");
  let token = localStorage.getItem("token");
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [categorySeries, setCategorySeries] = useState([]);
  const [serviceCategoriesCats, setServiceCategoriesCats] = useState([]);

  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

  const [messageApi, contextHolder] = message.useMessage();

  const numberWithCommas = (value) => {
    return parseFloat(value)
      .toFixed(0)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

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
          let data = res?.serviceCatData;

          const categories = Array.from(
            new Set(
              data
                .flatMap(Object.keys)
                .filter((key) => key !== "name" && key !== "month")
            )
          );

          const _categorySeries = categories.map((category) => ({
            name: category,
            data: data.map((item) => item[category] || 0), // Use 0 if the category is not present in the item
          }));

          setServiceCategoriesCats(categories);
          setCategorySeries(_categorySeries);
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
          setPayments(res);
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
          setInternalUsers(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });

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
          console.log("Spend------------", res);
          setSpendOverview(res);
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
          setExpenseOverview(res);
        })
        .catch((err) => {
          messageApi.open({
            type: "error",
            content: "Something happened! Please try again.",
          });
        });
      setDataLoaded(false);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Something happened! Please try again.",
      });
    }
  }, [year, currency]);

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
    return fetch(
      `${url}/requests/totalOverview?year=${year}&currency=${currency}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async function loadPaymentOverview() {
    return fetch(
      `${url}/paymentRequests/totalOverview?year=${year}&currency=${currency}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async function loadDashboardOverview() {
    return fetch(`${url}/dashboards?year=${year}&currency=${currency}`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    });
  }

  async function loadSpendTrackingOverview() {
    return fetch(
      `${url}/paymentRequests/spendTracking?year=${year}&currency=${currency}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      }
    );
  }

  async function loadExpensePlanning() {
    return fetch(
      `${url}/paymentRequests/expensePlanning?year=${year}&currency=${currency}`,
      {
        method: "GET",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      }
    );
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

  let statusColors = ["#7B2CBF", "#E76F51", "#277DA1", "#1677FF", "#E76F51"];

  statusColors = [
    "#14445C",
    "#d45087",
    "#F3B700",
    "#a05195",
    "#f95d6a",
    "#2f4b7c",
    "#ff7c43",
    "#665191",
    "#ffa600",
    "#003f5c",
  ];

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
    const months = ["JAN", "FEB", "MAR", "APR"];

    const result = months.map((month) => ({
      name: month,
      contracts: 0,
      tenders: 0,
      purchaseOrders: 0,
    }));

    if (data) {
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
      yearsArray.push({ value: year, label: `${year}` });
    }

    return yearsArray;
  }

  const dashboardOverviewData = transformData(dashboardOverview?.data);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-white px-3 py-1.5 rounded-md shadow-lg">
          <p>{`${payload[0]?.payload?.payload?._id}: ${payload[0]?.value}`}</p>
        </div>
      );
    }
  };

  return (
    <>
      {isMobile && <NotificationComponent />}
      {contextHolder}

      {dataLoaded ? (
        <div className="payment-request lg:m-6  mb-10 p-5 h-screen overflow-x-auto">
          {/* Cards */}
          <div className="lg:grid hidden xl:grid-cols-7 md:grid-cols-4 gap-3 my-4">
            {[
              {
                name: "Purchase request",
                value: requests?.length,
                color: "#4B59D4",
              },
              {
                name: "Payment request",
                value: payments?.length,
                color: "#7EC2C6",
              },
              { name: "Tenders", value: tenders?.length, color: "#5A58CB" },
              { name: "Contract", value: contracts?.length, color: "#679AF3" },
              {
                name: "Purchase Orders",
                value: purchaseOrders?.length,
                color: "#E4C1A0",
              },
              { name: "Vendors", value: vendors?.length, color: "#6A76D7" },
              {
                name: "Internal Users",
                value: internalUsers?.length,
                color: "#D25C8D",
              },
            ].map((item, key) => (
              <div className="flex gap-x-4 bg-[#FFF] py-2 px-4 rounded-lg">
                <div className="flex flex-grow flex-col gap-y-1">
                  <div className="w-full flex justify-between">
                    <h4 className="mt-2 mb-0 text-[#040518]">{item.value}</h4>
                    <div
                      className={`flex justify-center items-center bg-[${
                        item?.color + "22"
                      }] rounded-lg p-2.5`}
                    >
                      <DocumentIcon
                        color={item.color}
                        className={`h-4 w-4 text-{${item.color}}`}
                      />
                    </div>
                  </div>
                  <small key={key} className="text-[#505152] font-medium">
                    {item.name}
                  </small>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg my-1 ">
            <div className="flex items-center justify-between  bg-[#F5F5F5] rounded">
              <div className="flex items-center gap-x-14 px-5 py-1">
                <button
                  className={`bg-transparent py-1 my-1 ${
                    tab == 0
                      ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                      : `border-none text-[#8392AB]`
                  } text-[14px] cursor-pointer`}
                  onClick={() => setTab(0)}
                >
                  Overview
                </button>
                <button
                  className={`bg-transparent py-1 my-1 ${
                    tab == 1
                      ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                      : `border-none text-[#8392AB]`
                  } text-[14px] cursor-pointer`}
                  onClick={() => setTab(1)}
                >
                  Spend Tracking
                </button>
                <button
                  className={`bg-transparent py-1 my-1 ${
                    tab == 2
                      ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                      : `border-none text-[#8392AB]`
                  } text-[14px] cursor-pointer`}
                  onClick={() => setTab(2)}
                >
                  Expense Planning
                </button>
              </div>
              <div className="justify-end flex">
                {/* Select Year */}
                <div className="flex mr-1">
                  <Select
                    defaultValue={year}
                    style={{ width: 120 }}
                    size="middle"
                    className="border-0"
                    onChange={(value) => setYear(value)}
                    options={generateYearsArray()}
                  />
                </div>

                {/* Select Currency */}
                <div className="flex mr-1">
                  <Select
                    defaultValue={currency}
                    style={{ width: 120 }}
                    size="middle"
                    className="border-0"
                    onChange={(value) => setCurrency(value)}
                    options={[
                      { key: "RWF", value: "RWF", label: "RWF" },
                      { key: "USD", value: "USD", label: "USD" },
                      { key: "EUR", value: "EUR", label: "EUR" },
                      { key: "GBP", value: "GBP", label: "GBP" },
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
          {tab == 0 ? (
            <div className="payment-request bg-white h-[calc(100vh-310px)] rounded-lg mt-3 pt-6 overflow-y-auto lg:px-5 py-3">
              <div className="gap-y-5 px-4 items-start">
                <div className="xl:col-span-4 col-span-3 ">
                  <span className="text-[17px] font-semibold text-[#12263F]">
                    Purchase Request
                  </span>

                  <div className="grid xl:grid-cols-2 gap-5">
                    {/* Budgeted vs Non-Budgeted */}
                    <div className="pt-5 col-span-2 grid xl:grid-cols-2 gap-5">
                      <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                        <Chart
                          options={{
                            title: {
                              text: "Budgeted vs Non-Budgeted",
                            },
                            stroke: {
                              curve: "smooth",
                              // width: 2,
                            },
                            chart: {
                              id: "basic-line",
                            },
                            xaxis: {
                              categories: totalOverview?.data?.map((d) => {
                                return d?.month;
                              }),
                            },
                          }}
                          series={[
                            {
                              name: "budgeted",
                              data: totalOverview?.data?.map((d) => {
                                return d?.budgeted;
                              }),
                            },
                            {
                              name: "non-budgeted",
                              data: totalOverview?.data?.map((d) => {
                                return d?.nonbudgeted;
                              }),
                            },
                          ]}
                          type="line"
                          height="300"
                          // width="500"
                        />
                      </div>

                      <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                        <Chart
                          options={{
                            // stroke: {
                            //   curve: "smooth",
                            //   // width: 2,
                            // },
                            title: {
                              text: "PRs by Service categories",
                            },
                            chart: {
                              id: "bar-serviceCagtegory",
                              stacked: true,
                            },
                            xaxis: {
                              categories: totalOverview?.serviceCatData?.map(
                                (s) => s?.name
                              ),
                            },
                            legend: {
                              show: false,
                            },
                          }}
                          series={categorySeries}
                          type="bar"
                          height="300"
                          // width="500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sourcing Methods */}
                  <div className="pt-3 grid xl:grid-cols-3 gap-5 ">
                    <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                      <Chart
                        options={{
                          title: {
                            text: "Sourcing methods",
                          },

                          chart: {
                            id: "pie-sourcing",
                          },

                          labels: totalOverview?.sourcingData?.map((s) => {
                            return s?._id;
                          }),
                        }}
                        series={totalOverview?.sourcingData?.map((s) => {
                          return s?.total;
                        })}
                        type="pie"
                        height="180"
                      />
                    </div>

                    <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                      <Chart
                        options={{
                          title: {
                            text: "Approval stages",
                          },
                          chart: {
                            id: "pie-approval",
                          },

                          labels: totalOverview?.statusData?.map((s) => {
                            return s?._id;
                          }),
                        }}
                        series={totalOverview?.statusData?.map((s) => {
                          return s?.total;
                        })}
                        type="pie"
                        height="180"
                      />
                    </div>
                    <div className="flex items-center mt-3 ">
                      <div className="bg-white flex flex-row space-x-3 py-3 px-5">
                        <small className="text-[#848CA1]">
                          <b>Contract</b> lead time
                        </small>
                        <small className="text-[14.5px] font-semibold">
                          {dashboardOverview?.contractsLeadTime}{" "}
                          <small> Days</small>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="gap-y-5 mt-5 px-4 items-start border-t-4 border-solid border-x-0 border-b-0 pt-6 border-[#F5F5F5]">
                <div className="xl:col-span-2 col-span-2 py-5">
                  <span className="text-[17px] font-semibold text-[#12263F]">
                    Payment Request
                  </span>
                </div>
                <div className="grid xl:grid-cols-2 gap-5">
                  <div className="xl:col-span-1 rounded flex flex-col px-4 pt-5 bg-[#F9FAFD]">
                    <Chart
                      options={{
                        title: {
                          text: "Budgeted vs Non-Budgeted",
                        },
                        stroke: {
                          curve: "smooth",
                          // width: 2,
                        },
                        chart: {
                          id: "basic-line",
                        },
                        xaxis: {
                          categories: paymentOverview?.data?.map((d) => {
                            return d?.month;
                          }),
                        },
                      }}
                      series={[
                        {
                          name: "budgeted",
                          data: paymentOverview?.data?.map((d) => {
                            return d?.budgeted;
                          }),
                        },
                        {
                          name: "non-budgeted",
                          data: paymentOverview?.data?.map((d) => {
                            return d?.nonbudgeted;
                          }),
                        },
                      ]}
                      type="line"
                      height="300"
                      // width="500"
                    />
                  </div>

                  <div className="xl:col-span-1 rounded flex flex-col px-4 pt-5 bg-[#F9FAFD]">
                    <Chart
                      options={{
                        chart: {
                          id: "pie-approval",
                        },

                        labels: paymentOverview?.statusData?.map((s) => {
                          return s?._id;
                        }),
                      }}
                      series={paymentOverview?.statusData?.map((s) => {
                        return s?.total;
                      })}
                      type="pie"
                      width="360"
                    />
                    <div className="flex items-center mt-5 mb-10 border-t border-b-0 border-x-0 border-solid border-[#F1F3FF] pt-5">
                      <div className="bg-white flex flex-row space-x-3 py-3 px-5">
                        <small className="text-[15px] text-[#555b69]">
                          Avg. Approval time
                        </small>
                        <small className="text-[14.5px] font-semibold">
                          {paymentOverview?.leadTimeDays} <small> Days</small>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-y-10 mt-5 pb-28 px-4 items-start border-t-4 border-solid border-x-0 border-b-0 pt-6 border-[#F5F5F5]">
                <div className="xl:col-span-4 pb-8">
                  <span className="text-[14px] font-semibold text-[#12263F]">
                    PO, Contracts & Tenders
                  </span>

                  <div className="grid xl:grid-cols-2 pt-5 gap-5">
                    <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                      <Chart
                        options={{
                          stroke: {
                            curve: "smooth",
                            // width: 2,
                          },
                          chart: {
                            id: "basic-line",
                          },
                          xaxis: {
                            categories: dashboardOverviewData?.map((d) => {
                              return d?.name;
                            }),
                          },
                        }}
                        series={[
                          {
                            name: "contracts",
                            data: dashboardOverviewData?.map((d) => {
                              return d?.contracts;
                            }),
                          },
                          {
                            name: "tenders",
                            data: dashboardOverviewData?.map((d) => {
                              return d?.tenders;
                            }),
                          },
                          {
                            name: "purchaseOrders",
                            data: dashboardOverviewData?.map((d) => {
                              return d?.purchaseOrders;
                            }),
                          },
                        ]}
                        type="line"
                        height="300"
                        // width="500"
                      />
                    </div>
                    {dashboardOverview?.statusData && (
                      <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                        <div>
                          <Chart
                            options={{
                              title: {
                                text: "Tenders",
                              },
                              chart: {
                                id: "pie-approval",
                              },

                              labels:
                                dashboardOverview?.statusData?.tenders?.map(
                                  (s) => {
                                    return s?._id;
                                  }
                                ),
                            }}
                            series={dashboardOverview?.statusData?.tenders?.map(
                              (s) => {
                                return s?.total;
                              }
                            )}
                            type="pie"
                            width="400"
                          />
                        </div>
                      </div>
                    )}
                    {dashboardOverview?.statusData && (
                      <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                        <div className="flex flex-col xl:items-center xl:gap-x-5 gap-y-4 mb-5">
                          <div>
                            <Chart
                              options={{
                                title: {
                                  text: "Contracts - Approval stages",
                                },
                                chart: {
                                  id: "pie-approval",
                                },

                                labels:
                                  dashboardOverview?.statusData?.contracts?.map(
                                    (s) => {
                                      return s?._id;
                                    }
                                  ),
                              }}
                              series={dashboardOverview?.statusData?.contracts?.map(
                                (s) => {
                                  return s?.total;
                                }
                              )}
                              type="pie"
                              width="400"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {dashboardOverview?.statusData && (
                      <div className="bg-[#F9FAFD] p-5 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                        <div className="flex flex-col xl:items-center xl:gap-x-5 gap-y-4 mb-5">
                          <div>
                            <Chart
                              options={{
                                title: {
                                  text: "Purchase orders - Approval stages",
                                },
                                chart: {
                                  id: "pie-approval",
                                },

                                labels:
                                  dashboardOverview?.statusData?.purchaseOrders?.map(
                                    (s) => {
                                      return s?._id || "pending";
                                    }
                                  ),
                              }}
                              series={dashboardOverview?.statusData?.purchaseOrders?.map(
                                (s) => {
                                  return s?.total;
                                }
                              )}
                              type="pie"
                              width="400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : tab == 1 ? (
            spendOverview && (
              <div className="payment-request bg-white h-[calc(100vh-310px)] pb-10 rounded-lg mt-3 overflow-y-auto px-5 py-3">
                <div className="grid xl:grid-cols-5 gap-x-8 bg-[#F9FAFD] p-4">
                  <div className="xl:col-span-4">
                    <div className="bg-[#F9FAFD] xl:p-5 p-1 border-x-0 border-b-0 border border-solid border-[#F1F3FF]">
                      <Chart
                        options={{
                          title: {
                            text: "Amount Paid vs Requests over time",
                          },
                          chart: {
                            id: "bar-paid-nrequest",
                            type: "line",
                            // stacked: true,
                          },
                          stroke: {
                            width: [4, 4, 4],
                            curve: "monotoneCubic",
                          },
                          dataLabels: {
                            enabled: true,
                            formatter: numberWithCommas,
                          },
                          labels: spendOverview?.data?.map((s) => {
                            return s?.month;
                          }),
                          yaxis: [
                            {
                              title: {
                                text: "Total Paid",
                              },
                              labels: {
                                formatter: numberWithCommas,
                              },
                            },
                            {
                              opposite: true,
                              title: {
                                text: "Number of requests",
                              },
                              labels: {
                                formatter: numberWithCommas,
                              },
                            },
                          ],
                        }}
                        // type="bar"
                        height="300"
                        series={[
                          {
                            name: "paid",
                            type: "bar",
                            data: spendOverview?.data?.map((s) => {
                              return s?.total_paid;
                            }),
                          },
                          {
                            name: "# of requests",
                            type: "line",
                            data: spendOverview?.data?.map((s) => {
                              return s?.requests;
                            }),
                          },
                        ]}
                        // width="500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 sm:w-full">
                    <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                      <div>
                        <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-6">
                          Total Amount
                        </h6>
                        <h2 className="text-[#6C757D] text-[20px] font-semibold mt-0">
                          {formatAmount(spendOverview?.totals[0]?.total_amount)}
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
                          {formatAmount(
                            spendOverview?.totals[0]?.average_request
                          )}{" "}
                          / requests
                        </h2>
                      </div>
                      <MdOutlinePayments size={24} className="text-[#95AAC9]" />
                    </div>
                  </div>
                </div>

                <div className="grid xl:grid-cols-3 mt-5 xl:gap-10">
                  {dashboardOverview?.departmentExpanditure && (
                    <div className=" xl:col-span-2 bg-[#F9FAFD] py-3 ">
                      <Chart
                        options={{
                          title: {
                            text: "Department Expenditures",
                          },
                          // stroke: {
                          //   curve: "smooth",
                          //   // width: 2,
                          // },
                          chart: {
                            id: "basic-line",
                            // type:'bar'
                            stacked: true,
                          },
                          stroke: {
                            width: [4, 4, 4],
                            curve: "monotoneCubic",
                          },
                          xaxis: {
                            categories:
                              dashboardOverview?.departmentExpanditure?.map(
                                (d) => {
                                  return d?.name;
                                }
                              ),
                          },
                          yaxis: {
                            labels: {
                              formatter: numberWithCommas,
                            },
                          },
                          dataLabels: {
                            dropShadow: true,
                            enabled: true,
                            formatter: numberWithCommas,
                          },
                        }}
                        series={[
                          {
                            name: "budgeted",
                            data: dashboardOverview?.departmentExpanditure?.map(
                              (d) => {
                                return d?.budgeted;
                              }
                            ),
                          },
                          {
                            name: "non-budgeted",
                            data: dashboardOverview?.departmentExpanditure?.map(
                              (d) => {
                                return d?.nonBudgeted;
                              }
                            ),
                          },
                        ]}
                        type="bar"
                        height="300"
                        // width="500"
                      />
                    </div>
                  )}

                  {spendOverview?.budgetData && (
                    <div className="bg-[#F9FAFD] px-5 py-3 ">
                      <Chart
                        options={{
                          title: {
                            text: "Budget comparison",
                          },

                          chart: {
                            id: "pie-budget-comparison",
                          },

                          labels: spendOverview?.budgetData?.map((s) => {
                            return s?.name;
                          }),

                          tooltip: {
                            y: {
                              formatter: numberWithCommas,
                            },
                          },
                        }}
                        series={spendOverview?.budgetData?.map((s) => {
                          return s?.value;
                        })}
                        type="pie"
                        width="400"
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="payment-request bg-white h-[calc(100vh-310px)] rounded-lg mt-3 overflow-y-auto px-5 py-3">
              <div className="grid xl:grid-cols-5 gap-x-8 bg-[#F9FAFD] py-4 px-3 my-4">
                <div className="xl:col-span-4">
                  {/* <ResponsiveContainer width="100%" height={280}>
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
                  </ResponsiveContainer> */}
                  <Chart
                    options={{
                      title: {
                        text: "Expense Planning",
                      },
                      // stroke: {
                      //   curve: "smooth",
                      //   // width: 2,
                      // },
                      chart: {
                        id: "basic-line",
                        // type:'bar'
                        // stacked: true,
                      },
                      xaxis: {
                        categories: expenseOverview?.data?.map((d) => {
                          return d?.month;
                        }),
                      },
                      yaxis: {
                        labels: {
                          formatter: numberWithCommas,
                        },
                      },
                      dataLabels: {
                        formatter: numberWithCommas,
                      },
                    }}
                    series={[
                      {
                        name: "internal requests",
                        data: expenseOverview?.data?.map((d) => {
                          return d?.internal_requests;
                        }),
                      },
                      {
                        name: "external requests",
                        data: expenseOverview?.data?.map((d) => {
                          return d?.external_requests;
                        }),
                      },
                    ]}
                    type="bar"
                    height="300"
                    // width="500"
                  />
                </div>
                <div className="flex flex-col space-y-3 col-span-1 sm:w-full">
                  <div className="bg-white flex justify-between items-center py-1 px-4 ring-1 ring-[#EDF2F9] rounded-lg">
                    <div>
                      <h6 className="text-[#95AAC9] font-light text-[12px] mt-4 mb-6">
                        Total Requests Amount
                      </h6>
                      <h2 className="text-[#6C757D] text-[20px] font-semibold mt-0">
                        {formatAmount(
                          expenseOverview?.totals[0]?.total_requests_amount
                        )}
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
                        {formatAmount(
                          expenseOverview?.totals[0]?.total_pending_payments
                        )}
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
              <div className=" xl:col-span-2 pt-5 bg-[#F9FAFD] pb-16 px-3">
                <Chart
                  options={{
                    title: {
                      text: "Department Expenditures",
                    },
                    // stroke: {
                    //   curve: "smooth",
                    //   // width: 2,
                    // },
                    chart: {
                      id: "basic-line",
                      // type:'bar'
                      // stacked: true,
                    },
                    xaxis: {
                      categories: expenseOverview?.dapartmentalExpenses?.map(
                        (d) => {
                          return d?.name;
                        }
                      ),
                    },
                    yaxis: {
                      labels: {
                        formatter: numberWithCommas,
                      },
                    },
                    dataLabels: {
                      formatter: numberWithCommas,
                    },
                  }}
                  series={[
                    {
                      name: "internal requests",
                      data: expenseOverview?.dapartmentalExpenses?.map((d) => {
                        return d?.internal_requests;
                      }),
                    },
                    {
                      name: "external requests",
                      data: expenseOverview?.dapartmentalExpenses?.map((d) => {
                        return d?.external_requests;
                      }),
                    },
                  ]}
                  type="bar"
                  height="300"
                  // width="500"
                />
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
