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
import { Divider, message, Spin } from "antd";
import TendersStats from "@/app/components/tendersStatistics";
import TendersByDep from "@/app/components/tendersByDep";
import { LoadingOutlined } from "@ant-design/icons";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function page() {
  const [dataLoaded, setDataLoaded] = useState(false);
  let token = localStorage.getItem("token");
  const [requests, setRequests] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [budgeted, setBudgeted] = useState(0);
  const [unbudgeted, setUnbudgeted] = useState(0);
  const [openTenders, setOpenTenders] = useState(0);
  const [closedTenders, setClosedTenders] = useState(0);
  const [avgBids, setAvgBids] = useState(0);
  const router = useRouter();

  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
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
        setPurchaseOrders(res);
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
  }, []);

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
  return (
    <>
      {contextHolder}
      {dataLoaded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: dataLoaded ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
            type: "tween",
            ease: "circOut",
          }}
          className="flex flex-col flex-1 space-y-10 h-full pb-10"
        >
          <div className="grid md:grid-cols-5 gap-4 p-5">
            <div
              className="cursor-pointer"
              onClick={() => router.push("/system/requests")}
            >
              <CountCard
                title="Requests"
                count={requests?.length}
                icon={<DocumentIcon className="h-5 w-5" />}
                color="blue-400"
              />
            </div>

            <div
              className="cursor-pointer"
              onClick={() => router.push("/system/tenders")}
            >
              <CountCard
                title="Tenders"
                count={tenders?.length}
                icon={<DocumentCheckIcon className="h-5 w-5" />}
                color="blue-400"
              />
            </div>

            <div
              className="cursor-pointer"
              onClick={() => router.push("/system/contracts")}
            >
              <CountCard
                title="Contracts"
                count={contracts?.length}
                icon={<DocumentTextIcon className="h-5 w-5" />}
                color="blue-400"
              />
            </div>

            <div
              className="cursor-pointer"
              onClick={() => router.push("/system/purchase-orders")}
            >
              <CountCard
                title="Purchase Orders"
                count={purchaseOrders?.length}
                icon={<DocumentDuplicateIcon className="h-5 w-5" />}
                color="blue-400"
              />
            </div>

            <div
              className="cursor-pointer"
              onClick={() => router.push("/system/vendors")}
            >
              <CountCard
                title="Vendors"
                count={vendors?.length}
                icon={<UsersIcon className="h-5 w-5" />}
                color="blue-400"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-5 gap-4 m-5 p-5 bg-white rounded-md shadow-md">
            <div className="col-span-5 text-xl font-semibold">Requests</div>
            <RequestStats />
            <RequestsByDep />
            <div className="col-span-2">
              <RequestsByStatus />
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-xs font-bold">
                Breakdown by Budgeted vs Unbudgeted
              </div>
              <div className="flex flex-row justify-between items-center pt-5">
                <div className="flex flex-row space-x-2 items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm text-gray-600">Budgeted</div>
                </div>
                <div className="text-xs text-gray-600">{budgeted || 0}%</div>
              </div>
              <Divider></Divider>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row space-x-2 items-center">
                  <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                  <div className="text-sm text-gray-600">Unbudgeted</div>
                </div>

                <div className="text-xs text-gray-600">{unbudgeted || 0}%</div>
              </div>
            </div>
            {/* <TendersStats />
            <TendersByDep/> */}
          </div>

          <div className="grid md:grid-cols-5 gap-4 m-5 p-5 bg-white rounded-md shadow-md">
            <div className="col-span-5 text-xl font-semibold">Tenders</div>

            <TendersStats />
            <TendersByDep />
            <div className="flex flex-col space-y-2">
              <div className="text-xs font-bold">Breakdown by Status</div>
              <div className="flex flex-row justify-between items-center pt-5">
                <div className="flex flex-row space-x-2 items-center">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <div className="text-sm text-gray-600">Open</div>
                </div>
                <div className="text-xs text-gray-600">{openTenders || 0}%</div>
              </div>
              <Divider></Divider>
              <div className="flex flex-row justify-between items-center">
                <div className="flex flex-row space-x-2 items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <div className="text-sm text-gray-600">Closed</div>
                </div>
                <div className="text-xs text-gray-600">
                  {closedTenders || 0}%
                </div>
              </div>

              <div className="pt-5">
                <div className="text-xs font-bold">
                  {" "}
                  {avgBids || 0} bid(s) submitted per Tender on Average
                </div>
              </div>
            </div>
          </div>

          {/* <div class="absolute opacity-10 top-0 z-20">
              <Image src="/icons/blue icon.png" width={962} height={900} />
            </div> */}
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
    
  );
}
