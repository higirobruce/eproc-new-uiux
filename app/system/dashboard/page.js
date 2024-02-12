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
import { MdFileCopy, MdAttachFile, MdOutlineAllInbox } from "react-icons/md";
import { FiUsers } from "react-icons/fi";

export default function page() {
  const [dataLoaded, setDataLoaded] = useState(false);
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
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
        <div className="payment-request mt-10 h-screen pb-1 overflow-y-auto">
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 mr-6 my-5">
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
          </div>
          <div className="grid lg:grid-cols-2 gap-4 mr-6 my-5">
            <div className="bg-white rounded-lg px-5 h-96">
              <h6>Tenders by Category</h6>
            </div>
            <div className="bg-white rounded-lg px-5 h-96">
              <h6>Tenders by Department</h6>
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
