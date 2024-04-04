"use client";
import React, { useEffect, useState } from "react";
import { encode } from "base-64";
import { useRouter, useSearchParams } from "next/navigation";
import { usePr } from "next/router";
import { Button, message, Switch, Typography } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EyeOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import RequestDetails from "../../../components/requestDetails";
import { motion } from "framer-motion";
import moment from "moment";
import { useUser } from "@/app/context/UserContext";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function geRequestDetails(id, router, messageApi) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/requests/${id}`, {
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
      messageApi.error("Session expired!");
      router.push(`/auth?goTo=/system/requests/${id}&sessionExpired=true`);
    }
    // This will activate the closest `error.js` Error Boundary
    return null;
    // throw new Error("Failed to fetch data");
  }

  return res.json();
}

export async function fileExists(filepath) {
  return await fetch(`${filepath}`)
    .then((res) => res.json())
    .then((res) => {
      // alert(filepath);
      if (res === true || res == "true") {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      console.log("Error", err);
      return false;
    });
}

export default function page({ params }) {
  let router = useRouter();
  const [searchParams] = useSearchParams();
  const { user, login, logout } = useUser();

  const [messageApi, contextHolder] = message.useMessage();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let [loadingRowData, setLoadingRowData] = useState(false);
  let [confirmRejectLoading, setConfirmRejectLoading] = useState(false);
  let [reload, setReload] = useState(false);
  const [editRequest, setEditRequest] = useState(false);
  const [sourcingMethod, setSourcingMethod] = useState("");

  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let [rowData, setRowData] = useState(null);
  let [filePaths, setFilePaths] = useState([]);
  let [fileList, setFileList] = useState([]);
  let [files, setFiles] = useState([]);
  let [filesAreSet, setFilesAreSet] = useState(false);

  useEffect(() => {
    loadData();
  }, []);


  function loadData() {
    geRequestDetails(params?.id, router, messageApi).then(async (res) => {
      let paths = await res?.supportingDocs?.map(async (path, i) => {
            let uid = `rc-upload-${moment().milliseconds()}-${i}`;
            let _url = `${url}/file/termsOfReference/${path}`;
            let exists = await fileExists(
              `${url}/check/file/termsOfReference/${path}`
            );
            let status = "done";
            let name = `${path}`;

            let reader = new FileReader();
            const r = await fetch(_url);
            const blob = await r.blob();
            let p = new File([blob], name, { uid });
            p.uid = uid;
            p.exists = exists;
            p.url = _url;
            return p;
          });
      let ps = paths
        ? await Promise.all(paths).then((values) => {
            return values;
          })
        : null;


      // request?.supportingDocs?.map(async (doc, i) => {
      //   let uid = `rc-upload-${moment().milliseconds()}-${i}`;
      //   let _url = `${url}/file/termsOfReference/${encodeURI(doc)}`;
      //   let status = "done";
      //   let name = `${doc}`;

      //   let response = await fetch(_url);
      //   let data = await response.blob();

      //   getBase64(data).then((result) => {
      //     let newFile = new File([data], name, {
      //       uid,
      //       url: _url,
      //       status,
      //       name,
      //       // type:'pdf'
      //     });

      //     _files.push(newFile);

      //     setFiles(_files);
      //     setFileList(_files);
      //     setFilesAreSet(true);
      //   });
      // });

      // let items = await res?.items?.map(async (item) => {
      //   let paths = await item?.paths?.map(async (path, i) => {
      //     let uid = `rc-upload-${moment().milliseconds()}-${i}`;
      //     let _url = `${url}/file/termsOfReference/${path}`;
      //     let exists = await fileExists(
      //       `${url}/check/file/termsOfReference/${path}`
      //     );
      //     if (exists) return path;
      //     else return null;
      //   });
      //   let ps = paths
      //     ? await Promise.all(paths).then((values) => {
      //         item.paths = values;
      //         return item;
      //       })
      //     : null;
      //   return ps;
      //   // return paths;
      // });
      setFileList(await Promise.all(paths).then((values) => values));
      setFiles(await Promise.all(paths).then((values) => values));
      setRowData(res);
    });
  }

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  function updateStatus(id, status) {
    setLoadingRowData(true);
    fetch(`${url}/requests/status/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setRowData(res);
        setLoadingRowData(false);
        if (status === "withdrawn") router.back();
      })
      .catch((err) => {
        setLoadingRowData(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateSourcingMethod(id, sourcingMethod) {
    fetch(`${url}/requests/sourcingMethod/${id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourcingMethod,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setRowData(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function createTender(tenderData) {
    setLoadingRowData(true);
    fetch(`${url}/tenders`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tenderData),
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        updateStatus(rowData._id, "approved");
        updateSourcingMethod(rowData._id, sourcingMethod);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function declineRequest(id, reason, declinedBy) {
    // setUpdatingId(id);
    setConfirmRejectLoading(true);
    fetch(`${url}/requests/decline/${id}`, {
      method: "POST",
      body: JSON.stringify({
        reason,
        declinedBy,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setRowData(res);
        setConfirmRejectLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setConfirmRejectLoading(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  }

  function updateProgress(po, progress, qty, index) {
    let _po = { ...po };
    _po.items[index].deliveredQty = qty;
    _po.deliveryProgress = progress;
    fetch(`${url}/purchaseOrders/progress/${po?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: _po,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setReload(!reload);
      });
  }

  async function createPO(
    vendor,
    tender,
    createdBy,
    sections,
    items,
    B1Data,
    signatories,
    request,
    reqAttachmentDocId
  ) {
    return fetch(`${url}/purchaseOrders/`, {
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
        items,
        B1Data,
        request: rowData?._id,
        signatories,
        request,
        reqAttachmentDocId,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res1) => {
        console.log(res1.error);
        if (res1.error || res1.code) {
          let response = res1.error || res1.code;
          console.log(res1.error || res1.code);
          messageApi.open({
            type: "error",
            content: response?.message?.value,
          });
        } else {
          updateStatus(rowData._id, "approved");
          updateSourcingMethod(rowData._id, sourcingMethod);
          messageApi.open({
            type: "success",
            content: "PO created!",
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

  function createContract(
    vendor,
    tender,
    createdBy,
    sections,
    contractStartDate,
    contractEndDate,
    signatories,
    reqAttachmentDocId,
    status
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
        reqAttachmentDocId,
        request: rowData?._id,
        status,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res1) => {
        updateStatus(rowData._id, "approved");
        updateSourcingMethod(rowData._id, sourcingMethod);
        messageApi.open({
          type: "success",
          content: "Contract created!",
        });
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

  function rateDelivery(po, rate, comment) {
    let _po = { ...po };
    _po.rate = rate;
    _po.rateComment = comment;
    setLoadingRowData(true);
    fetch(`${url}/purchaseOrders/progress/${po?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        updates: _po,
      }),
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
      .then((res) => {
        setReload(!reload);
        setLoadingRowData(false);
      });
  }

  function updateRequest(_files) {
    setLoadingRowData(true);
    let newStatus =
      rowData?.status == "withdrawn" || rowData?.status == "declined"
        ? "pending"
        : rowData?.status;

    rowData.status = newStatus;
    rowData.supportingDocs = _files;

    let reqItems = [...rowData.items];
    // reqItems?.map((v, index) => {
    //   if (_files?.length > index) {
    //     if (_files[index]?.every((item) => typeof item === "string")) {
    //       v.paths = _files[index];
    //       return v;
    //     } else {
    //       // console.log("Uploooooodiiing", _files[index]);
    //       // messageApi.error("Something went wrong! Please try again.");\
    //       v.paths = null;
    //       return v;
    //     }
    //   } else {
    //     v.paths = null;
    //     return v;
    //   }
    // });

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
        messageApi.open({
          type: "success",
          content: "Purchase Request Updated!",
        });
        loadData();
        setLoadingRowData(false);
        // router.push('/system/requests')
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

  useEffect(() => {}, [files]);

  const __handleUpload = () => {
    let _filesPaths = [...files];
    let __filePaths = [..._filesPaths];

    let _files = [...files];

    let _f = __filePaths.filter((f) => f?.length > 0);

    let i = 0;
    let _totalFilesInitial = rowData?.items?.map((item) => {
      item?.paths?.map((p) => {
        if (p) i++;
      });
    });

    if (files?.every((child) => child?.length < 1)) {
      messageApi.error("Please add at least one doc.");
      // setConfirmLoading(false);
    } else {
      files.forEach((filesPerRow, rowIndex) => {
        filesPerRow?.map((rowFile, fileIndex) => {
          const formData = new FormData();
          formData.append("files[]", rowFile);

          // You can use any AJAX library you like
          fetch(`${url}/uploads/termsOfReference/`, {
            method: "POST",
            body: formData,
            headers: {
              Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
              token: token,
              // "Content-Type": "multipart/form-data",
            },
          })
            .then((res) => getResultFromServer(res))
            .then((savedFiles) => {
              let _filenames = savedFiles?.map((f) => {
                return f?.filename;
              });

              _files[rowIndex][fileIndex] = _filenames[0];
            })
            .catch((err) => {
              console.log(err);
              messageApi.error("upload failed.");
            })
            .finally(() => {
              updateRequest(_files);
            });
        });
      });
    }
  };

  const handleUpload = () => {
    if (files?.length < 1) {
      messageApi.error("Please add at least one doc?.");
    } else {
      // setSaving(true);

      let _files = [];
      _files = [...files];

      const formData = new FormData();
      _files.forEach((fileToSave, rowIndex) => {
        formData.append("files[]", fileToSave);
      });

      // You can use any AJAX library you like
      fetch(`${url}/uploads/termsOfReference/`, {
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

          updateRequest(_filenames);
        })
        .catch((err) => {
          console.log(err);
          messageApi.error("upload failed.");
        })
        .finally(() => {
          // setSaving(false);
        });
    }
  };

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(
        `/auth?goTo=/system/requests/${params?.id}&sessionExpired=true`
      );
    } else {
      return res.json();
    }
  }

  const handleGoBack = () => {
    const queryParams = window.location.href.split("?")[1];

    router.push("/system/requests/?" + queryParams);
  };

  return (
    <>
      {contextHolder}
      {/* <h1>{rowData?.number}</h1> */}
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
        className="flex flex-col mr-5 transition-opacity ease-in-out duration-1000 py-5 flex-1 space-y-3 h-screen"
      >
        <div className="flex items-center justify-between mr-6 mb-4">
          <Button
            className="bg-white h-9 px-5 text-[13px] font-semibold rounded text-[#0063CF]"
            icon={<ArrowLeftOutlined className="font-[15px]" />}
            onClick={handleGoBack}
          >
            Return to List
          </Button>
          <div className="gap-5" />
        </div>
        {/* <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row space-x-10 items-center">
            <div>
              <Button
                icon={<ArrowLeftOutlined />}
                type="primary"
                onClick={() => {
                  setEditRequest(false);
                  router.back();
                }}
              >
                Back
              </Button>
            </div>

            {editRequest && (
              <div className="flex flex-row items-center text-xl font-semibold">
                <Typography.Text
                  level={5}
                  editable={
                    editRequest && {
                      text: rowData?.title,
                      onChange: (e) => {
                        let req = { ...rowData };
                        req.title = e;
                        setRowData(req);
                      },
                    }
                  }
                >
                  {rowData?.title}
                </Typography.Text>
              </div>
            )}

            {editRequest && (
              <div>
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={() => {
                    // updateRequest();
                    handleUpload();
                  }}
                >
                  Save
                </Button>
              </div>
            )}

            {!editRequest && (
              <div className="text-xl font-semibold">
                Request - {rowData?.title}
              </div>
            )}
          </div>
          {(rowData?.level1Approver?._id === user?._id ||
            rowData?.createdBy?._id === user?._id) &&
            !rowData?.status.startsWith("approved") && (
              <Switch
                checked={editRequest}
                checkedChildren={<EditOutlined />}
                unCheckedChildren={<EyeOutlined />}
                onChange={(e) => setEditRequest(e)}
              />
            )}
        </div> */}
        {rowData  && (
          <RequestDetails
            handleUpdateStatus={updateStatus}
            loading={loadingRowData}
            data={rowData}
            handleCreateTender={createTender}
            handleReject={declineRequest}
            setConfirmRejectLoading={setConfirmRejectLoading}
            confirmRejectLoading={confirmRejectLoading}
            handleUpdateProgress={updateProgress}
            reload={reload}
            handleCreatePO={createPO}
            handleCreateContract={createContract}
            edit={editRequest}
            handleUpdateRequest={setRowData}
            handleRateDelivery={rateDelivery}
            refDoc={sourcingMethod}
            setRefDoc={setSourcingMethod}
            setFilePaths={setFilePaths}
            fileList={fileList}
            files={files}
            setFileList={setFileList}
            setFiles={setFiles}
            handleUpload={handleUpload}
            filesAreSet={filesAreSet}
          />
        )}
      </motion.div>
    </>
  );
}
