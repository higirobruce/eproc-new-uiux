"use client";
import {
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { Typography, Popconfirm, Popover, Switch, Spin, Button } from "antd";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import * as _ from "lodash";
import moment from "moment-timezone";

import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { encode } from "base-64";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
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

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getContractDetails(id, router) {
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  const res = await fetch(`${url}/contracts/${id}`, {
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
      router.push(`/auth?goTo=/system/contracts/${id}&sessionExpired=true`);
    }
    // This will activate the closest `error.js` Error Boundary
    // console.log(id);
    return null;
    // throw new Error("Failed to fetch data");
  }
  // console.log(res.json())
  return res.json();
}

export default function page({ params }) {
  const { user, login, logout } = useUser();
  // let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let [contract, setContract] = useState({});
  let router = useRouter();

  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

  const [editContract, setEditContract] = useState(false);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    getContractDetails(params?.id, router).then((res) => setContract(res));
  }, [params]);

  function handleSignContract(signatory, index) {
    setSigning(true);

    fetch("https://api.ipify.org?format=json")
      .then((res) => getResultFromServer(res))
      .then((res) => {
        let myIpObj = "";
        signatory.signed = true;
        let _contract = { ...contract };
        myIpObj = res;
        signatory.ipAddress = res?.ip;
        signatory.signedAt = moment();
        _contract.signatories[index] = signatory;
        setContract(_contract);

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
            signingIndex: index,
          }),
        })
          .then((res) => getResultFromServer(res))
          .then((res) => {
            // setSignatories([]);
            // setSections([{ title: "Set section title", body: "" }]);
            let _c = { ...contract };
            _c.signatories = res?.signatories;
            _c.status = res?.status;
            setContract(_c);
            setSignatories(res?.signatories);
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

  function documentFullySigned(document) {
    let totSignatories = document?.signatories;
    let signatures = document?.signatories?.filter((s) => s.signed);

    return totSignatories?.length === signatures?.length;
  }

  function previousSignatorySigned(signatories, index) {
    let signed = index == 0 ? true : signatories[index - 1]?.signed;
    return signed;
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

  const content = () => {
    return (
      <div className="space-y-5 p-3 overflow-x-scroll bg-white mx-11 my-10 shadow-md">
        {/* Header */}
        <div className="flex flex-row justify-between items-center">
          <Typography.Title level={4} className="flex flex-row items-center">
            <div>
              CONTRACTOR #{contract?.number}{" "}
              <div>
                <Popover
                  placement="topLeft"
                  content={`${moment(contract?.startDate).format(
                    "YYYY-MMM-DD"
                  )} - ${moment(contract?.endDate).format("YYYY-MMM-DD")}`}
                >
                  <div className="text-xs font-thin text-gray-500">
                    Expires {moment(contract?.endDate).fromNow()}
                  </div>
                </Popover>
              </div>
            </div>
          </Typography.Title>
          {/* {contract?.status === "draft" &&
        user?.permissions?.canEditContracts && (
          <Switch
            checkedChildren={<EditOutlined />}
            unCheckedChildren={<EyeOutlined />}
            defaultChecked={editContract}
            onChange={(checked) => setEditContract(checked)}
          />
        )} */}
        </div>
        {/* Parties */}
        <div className="flex flex-row justify-between space-x-5">
          <div className="flex flex-col space-y-3">
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

          <div className="flex flex-col space-y-3">
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
              <Typography.Text strong>{contract?.vendor?.tin}</Typography.Text>
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
        <div className="flex flex-col space-y-5 text-sm">
          <Typography.Title level={3}>Details</Typography.Title>
          <div>
            {contract?.sections?.map((s, index) => {
              let section = contract?.sections[index]
                ? contract?.sections[index]
                : { title: "", body: "" };
              let _sections = [...contract?.sections];
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
                        }}
                        title="You can not undo this!"
                      >
                        <div>
                          <CloseCircleOutlined className="h-3 text-red-400 cursor-pointer" />
                        </div>
                      </Popconfirm>
                    )}
                  </div>
                  {(!editContract || contract?.status !== "draft") && (
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
                      }}
                    />
                  )}
                </>
              );
            })}
          </div>
          {/* {editContract && contract?.status === "draft" && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                let _sections = [...sections];
                _sections.push({
                  title: `Set section ${contract?.sections?.length + 1} Title`,
                  body: "",
                });
                setSections(_sections);
              }}
            >
              Add section
            </Button>
          )} */}
        </div>
        {/* Signatories */}
        <div className="grid grid-cols-2 gap-5" id="page2el">
          {contract?.signatories?.map((s, index) => {
            let yetToSign = contract?.signatories?.filter((notS) => {
              return !notS.signed;
            });
            return (
              <div
                key={s?.email}
                className="flex flex-col ring-1 ring-gray-300 rounded pt-5 space-y-3 justify-between text-xs font-thin"
              >
                <div className="flex flex-col space-y-3">
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
                            let _signatories = [...contract?.signatories];
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
                            let _signatories = [...contract?.signatories];
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
                            let _signatories = [...contract?.signatories];
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
                            let _signatories = [...contract?.signatories];
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
                  <div className="flex flex-row space-x-10 border-t-2">
                    {/* <Image
                      width={20}
                      height={20}
                      src="/icons/icons8-signature-80.png"
                    /> */}

                    <div className="text-blue-500 flex flex-col ">
                      <div className="">Signed digitally</div>
                      <div>
                        {moment(s.signedAt).format("DD MMM YYYY")} at{" "}
                        {moment(s.signedAt)
                          .tz("Africa/Kigali")
                          .format("h:mm a z")}
                      </div>
                    </div>
                  </div>
                )}

                {(user?.email === s?.email || user?.tempEmail === s?.email) &&
                  !s?.signed &&
                  previousSignatorySigned(contract?.signatories, index) && (
                    <Popconfirm
                      title="Confirm Contract Signature"
                      onConfirm={() => handleSignContract(s, index)}
                    >
                      <div className="flex flex-row space-x-5 border-t-2 cursor-pointer hover:opacity-75">
                        {/* <Image
                          width={20}
                          height={20}
                          src="/icons/icons8-signature-80.png"
                        /> */}
                        <div className="text-blue-400 text-sm">
                          It is your turn, sign with one click
                        </div>
                      </div>
                    </Popconfirm>
                  )}

                {((user?.email !== s?.email &&
                  user?.tempEmail !== s?.email &&
                  !s.signed) ||
                  !previousSignatorySigned(contract?.signatories, index)) && (
                  <div className="flex flex-row space-x-5 border-t-2 ">
                    {/* <Image
                      width={20}
                      height={20}
                      src="/icons/icons8-signature-80-2.png"
                    /> */}
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
    );
  };

  const generatePDF = () => {
    // const element = document.getElementById("pdf-content");
    
    const printElement = ReactDOMServer.renderToString(content());
    html2pdf()
      .set({
        // pagebreak: { mode: "avoid-all", before: "#page2el" },
        // margin:[22,10, 15, 21],
        // filename: "Contract.pdf",
        // image: { type: "jpeg", quality: 0.98 },
        // html2canvas: { scale: 2, letterRendering: true },
        // jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },

        margin: [22, 10, 15, 10], //top, left, buttom, right
        filename: "Contract.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: "mm", format: "A4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(printElement)
      .save();
  };

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(
        `/auth?goTo=/system/contracts/${params?.id}&sessionExpired=true`
      );
    } else {
      return res.json();
    }
  }

  return (
    <div className="flex flex-col py-3">
      <div className="request space-y-10 px-20 overflow-auto h-[calc(100vh-165px)] bg-white mr-6 py-10 shadow-md">
        <div className="flex w-full justify-end">
          <Button
            type="primary"
            onClick={() => generatePDF()}
            icon={<PrinterOutlined />}
            className="self-end"
          ></Button>
        </div>
        {/* Header */}
        <div className="flex flex-row justify-between items-center">
          <Typography.Title level={4} className="flex flex-row items-center">
            <div>
              CONTRACTOR #{contract?.number}{" "}
              <div>
                <Popover
                  placement="topLeft"
                  content={`${moment(contract?.startDate).format(
                    "YYYY-MMM-DD"
                  )} - ${moment(contract?.endDate).format("YYYY-MMM-DD")}`}
                >
                  <div className="text-xs font-thin text-gray-500">
                    Expires {moment(contract?.endDate).fromNow()}
                  </div>
                </Popover>
              </div>
            </div>
          </Typography.Title>
          {/* {contract?.status === "draft" &&
        user?.permissions?.canEditContracts && (
          <Switch
            checkedChildren={<EditOutlined />}
            unCheckedChildren={<EyeOutlined />}
            defaultChecked={editContract}
            onChange={(checked) => setEditContract(checked)}
          />
        )} */}
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
              <Typography.Text strong>{contract?.vendor?.tin}</Typography.Text>
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
          <div>
            {contract?.sections?.map((s, index) => {
              let section = contract?.sections[index]
                ? contract?.sections[index]
                : { title: "", body: "" };
              let _sections = [...contract?.sections];
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
                        }}
                        title="You can not undo this!"
                      >
                        <div>
                          <CloseCircleOutlined className="h-3 text-red-400 cursor-pointer" />
                        </div>
                      </Popconfirm>
                    )}
                  </div>
                  {(!editContract || contract?.status !== "draft") && (
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
                      }}
                    />
                  )}
                </>
              );
            })}
          </div>
          {/* {editContract && contract?.status === "draft" && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                let _sections = [...sections];
                _sections.push({
                  title: `Set section ${contract?.sections?.length + 1} Title`,
                  body: "",
                });
                setSections(_sections);
              }}
            >
              Add section
            </Button>
          )} */}
        </div>
        {/* Signatories */}
        <div className="grid grid-cols-3 gap-5">
          {contract?.signatories?.map((s, index) => {
            let yetToSign = contract?.signatories?.filter((notS) => {
              return !notS.signed;
            });
            return (
              <div
                key={s?.email}
                className="flex flex-col ring-1 ring-gray-300 rounded pt-5 space-y-3 justify-between"
              >
                <div className="px-5 flex flex-col space-y-3">
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
                            let _signatories = [...contract?.signatories];
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
                            let _signatories = [...contract?.signatories];
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
                            let _signatories = [...contract?.signatories];
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
                            let _signatories = [...contract?.signatories];
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
                  previousSignatorySigned(contract?.signatories, index) &&
                  contract?.status !== "draft" &&
                  contract?.status !== "legal-review" && (
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
                  !previousSignatorySigned(contract?.signatories, index) ||
                  contract?.status == "draft" ||
                  contract?.status === "legal-review") && (
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
                        ? "Still in drafting phase"
                        : contract?.status === "legal-review"
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
    </div>
  );
}
