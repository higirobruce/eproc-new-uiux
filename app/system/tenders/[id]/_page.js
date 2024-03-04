"use client";
import TenderDetails from "../../../components/tenderDetails";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Popover, Switch, message } from "antd";
import React, { useEffect, useState } from "react";
import { encode } from "base-64";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import moment from "moment";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getTenderDetails(id, router) {
  let token = typeof window !== 'undefined' && localStorage.getItem("token");

  const res = await fetch(`${url}/tenders/${id}`, {
    headers: {
      Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
      token: token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/tenders/${id}&sessionExpired=true`);
    }

    // This will activate the closest `error.js` Error Boundary

    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

export default function page({ params }) {
  let router = useRouter();
  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== 'undefined' && localStorage.getItem("token");

  const [messageApi, contextHolder] = message.useMessage();

  let [rowData, setRowData] = useState(null);
  let [loadingRowData, setLoadingRowData] = useState(false);
  let [editing, setEditing] = useState(false);

  useEffect(() => {
    getTenderDetails(params?.id, router).then((res) => {
      setRowData(res);
    });
  }, [params]);

  function updateStatus(id, status) {
    setLoadingRowData(true);
    fetch(`${url}/tenders/status/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        loadTenders()
          .then((res) => getResultFromServer(res))
          .then((res) => {
            let r = res.filter((d) => {
              return d._id === id;
            });
            setRowData(r[0]);
            setLoadingRowData(false);
          })
          .catch((err) => {
            setLoadingRowData(false);
            messageApi.open({
              type: "error",
              content: "Something happened! Please try again.",
            });
          });
      })
      .catch((err) => {
        setLoadingRowData(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function createSubmission(data) {
    setLoadingRowData(true);
    fetch(`${url}/submissions/`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => getResultFromServer(res))
      .then((res1) => {
        loadTenders()
          .then((res2) => getResultFromServer(res2))
          .then((res3) => {
            let r = res3.filter((d) => {
              return d._id === rowData._id;
            });
            setRowData(r[0]);
            setLoadingRowData(false);
          })
          .catch((err) => {
            console.error(err);
            setLoadingRowData(false);
            messageApi.open({
              type: "error",
              content: JSON.stringify(err),
            });
          });
      })
      .catch((err) => {
        console.error(err);
        setLoadingRowData(false);
        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

  function createPO(
    vendor,
    tender,
    createdBy,
    sections,
    items,
    B1Data,
    signatories
  ) {
    return fetch(`${url}/purchaseOrders/`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vendor,
        tender,
        createdBy,
        sections,
        items,
        B1Data,
        signatories,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res1) => {
        if (res1.error) {
          messageApi.open({
            type: "error",
            content: res1?.error?.message?.value
              ? res1?.error?.message?.value
              : res1?.message,
          });
        } else {
          loadTenders()
            .then((res2) => res2.json())
            .then((res3) => {
              let r = res3.filter((d) => {
                return d._id === rowData._id;
              });

              setRowData(r[0]);
              setLoadingRowData(false);
            })
            .catch((err) => {
              console.error(err);
              setLoadingRowData(false);
              messageApi.open({
                type: "error",
                content: JSON.stringify(err),
              });
            });
        }
      })
      .catch((err) => {
        console.error(err);
        setLoadingRowData(false);
        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

  function sendInvitation(tenderUpdate) {
    setLoadingRowData(true);
    fetch(`${url}/tenders/${tenderUpdate?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sendInvitation: true,
        newTender: tenderUpdate,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        loadTenders()
          .then((res) => getResultFromServer(res))
          .then((res) => {
            let r = res.filter((d) => {
              return d._id === id;
            });
            console.log(r);
            setRowData(r[0]);
            setLoadingRowData(false);
          })
          .catch((err) => {
            setLoadingRowData(false);
            // messageApi.open({
            //   type: "error",
            //   content: "Something happened! Please try again.",
            // });
          });
      })
      .catch((err) => {
        setLoadingRowData(false);
        // messageApi.open({
        //   type: "error",
        //   content: "Something happened! Please try again.",
        // });
      });
  }

  function sendEvalApproval(tenderUpdate, invitees) {
    setLoadingRowData(true);
    tenderUpdate.invitees = invitees;

    fetch(`${url}/tenders/${tenderUpdate?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newTender: tenderUpdate,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        loadTenders()
          .then((res) => getResultFromServer(res))
          .then((res) => {
            let r = res.filter((d) => {
              return d._id === tenderUpdate?._id;
            });
            setRowData(r[0]);
            setLoadingRowData(false);
          })
          .catch((err) => {
            setLoadingRowData(false);
            messageApi.open({
              type: "error",
              content: "Something happened! Please try again.",
            });
          });
      })
      .catch((err) => {
        setLoadingRowData(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function refresh() {
    setLoadingRowData(true);
    loadTenders()
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setLoadingRowData(false);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  async function loadTenders() {
    if (user?.userType === "VENDOR")
      return fetch(`${url}/tenders/byServiceCategories/`, {
        method: "POST",

        headers: {
          Authorization:
            "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
          "Content-Type": "application/json",
          token: token,
        },
        body: JSON.stringify({
          serviceCategories: user?.services,
        }),
      });
    else
      return fetch(`${url}/tenders/`, {
        method: "GET",
        headers: {
          token: token,
          Authorization:
            "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
          "Content-Type": "application/json",
        },
      });
  }

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(
        `/auth?goTo=/system/tenders/${params?.id}&sessionExpired=true`
      );
    } else {
      return res.json();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{
        opacity: rowData ? 1 : 0,
      }}
      transition={{
        duration: 0.2,
        type: "tween",
        ease: "circOut",
      }}
      className="flex flex-col transition-opacity ease-in-out duration-1000 px-10 py-5 flex-1 space-y-3"
    >
      {contextHolder}
      <div className="flex flex-row items-center">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="flex flex-row items-center space-x-5">
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/system/tenders")}
            >
              Back
            </Button>

            <div className="text-xl font-semibold">
              Tender - {rowData?.purchaseRequest?.title}{" "}
            </div>
          </div>

          {rowData?.status === "open" &&
            moment().isBefore(moment(rowData?.submissionDeadLine)) && (
              <Popover content="Edit tender">
                <Switch
                  defaultChecked={editing}
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren={<EyeOutlined />}
                  onChange={(checked) => setEditing(checked)}
                />
              </Popover>
            )}
        </div>
      </div>
      {rowData && (
        <TenderDetails
          handleUpdateStatus={updateStatus}
          loading={loadingRowData}
          data={rowData}
          handleCreateSubmission={createSubmission}
          handleClose={() => router.push("/system/tenders")}
          handleRefreshData={refresh}
          handleCreatePO={createPO}
          handleSendInvitation={sendInvitation}
          handleSendEvalApproval={sendEvalApproval}
          user={user}
          editing={editing}
        />
      )}
    </motion.div>
  );
}
