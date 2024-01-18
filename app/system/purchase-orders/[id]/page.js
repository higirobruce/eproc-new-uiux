"use client";
import {
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  Typography,
  Popconfirm,
  Popover,
  Switch,
  Spin,
  Table,
  Button,
  message,
} from "antd";
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
import { content } from "@/app/utils/requestContent";

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

async function getPODetails(id, router) {
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
  const res = await fetch(`${url}/purchaseOrders/${id}`, {
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
      router.push(
        `/auth?goTo=/system/purchase-orders/${id}&sessionExpired=true`
      );
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
  let user = JSON.parse(typeof window !== 'undefined' && localStorage.getItem("user"));
  let router = useRouter();
  let [messageApi, contextHolder] = message.useMessage();
  let token = typeof window !== 'undefined' && localStorage.getItem("token");

  let [po, setPO] = useState(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    getPODetails(params?.id, router).then((res) => setPO(res));
  }, [params]);

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

      render: (_, item) => (
        <>{item?.currency + ' ' +(item?.estimatedUnitCost).toLocaleString()}</>
      ),

    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (_, item) => (

        <>
          {item
            ?.currency+' '+(item?.quantity * item?.estimatedUnitCost)
            .toLocaleString()}
        </>

      ),
    },
  ];

  function previousSignatorySigned(signatories, index) {
    let signed = index == 0 ? true : signatories[index - 1]?.signed;
    return signed;
  }

  function handleSignPo(signatory, index) {
    setSigning(true);

    fetch("https://api.ipify.org?format=json")
      .then((res) => getResultFromServer(res))
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
            Authorization:
              "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
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
          .then((res) => getResultFromServer(res))
          .then((res) => {
            setSigning(false);
            // setSignatories([]);
            // setSections([{ title: "Set section title", body: "" }]);
            // setPO(res);
          });
      })
      .catch((err) => {
        console.log(err);
        messageApi.error(
          "An error occured while trying to get your ip address. Please try again"
        );
      })
      .finally(() => {
        setSigning(false);
      });

    //call API to sign
  }

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
      <div className="space-y-5 p-3 overflow-x-scroll bg-white mx-11 shadow-md">
        <div className="flex flex-row justify-between items-center">
          <Typography.Title level={4} className="flex flex-row items-center">
            PURCHASE ORDER #{po?.number}{" "}
          </Typography.Title>
          {/* <Button icon={<PrinterOutlined />}>Print</Button> */}
        </div>
        <div className="grid grid-cols-2 gap-5 ">
          <div className="flex flex-col ring-1 ring-gray-300 rounded space-y-3">
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
                {po?.vendor?.building}-{po?.vendor?.street}-{po?.vendor?.avenue}
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
            Total (Tax Excl.): {getPoTotalVal().totalVal?.toLocaleString()} {po?.items[0]?.currency}
          </Typography.Title>
          <Typography.Title level={5} className="self-end">
            Tax: {getPoTotalVal().totalTax?.toLocaleString()} {po?.items[0]?.currency}
          </Typography.Title>
          <Typography.Title level={5} className="self-end">
            Gross Total: {getPoTotalVal().grossTotal?.toLocaleString()} {po?.items[0]?.currency}
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
        <div className="grid grid-cols-2 gap-5">
          {po?.signatories?.map((s, index) => {
            let yetToSign = po?.signatories?.filter((notS) => {
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
                  previousSignatorySigned(po?.signatories, index) && (
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
                  !previousSignatorySigned(po?.signatories, index)) && (
                  <div className="flex flex-row space-x-5 border-t-2 ">
                    {/* <Image
                      width={20}
                      height={20}
                      src="/icons/icons8-signature-80-2.png"
                    /> */}
                    <div className="text-gray-400 text-lg">
                      {s.signed
                        ? "Signed"
                        : po?.status === "draft"
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
    const printElement = ReactDOMServer.renderToString(content(po, signing, user));
    html2pdf()
      .set({
        // pagebreak: { mode: "avoid-all", before: "#page2el" },
        margin: [22, 10, 15, 22],
        filename: "Contract.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, letterRendering: true },
        jsPDF: { unit: "pt", format: "letter", orientation: "portrait" },
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
        `/auth?goTo=/system/purchase-orders/${params?.id}&sessionExpired=true`
      );
    } else {
      return res.json();
    }
  }

  return (
    <div className="flex flex-col p-3">
      {contextHolder}
      {/* <Button
        type="primary"
        onClick={() => generatePDF()}
        icon={<PrinterOutlined />}
        className="self-end"
      ></Button> */}
      <div className="space-y-10 px-20 py-5 overflow-x-scroll bg-white mx-11 my-10 shadow-md">
        <div className="flex flex-row justify-between items-center">
          <Typography.Title level={4} className="flex flex-row items-center">
            PURCHASE ORDER #{po?.number}{" "} <span className=" ml-2 text-blue-600"><PrinterOutlined onClick={() => generatePDF()} /></span>
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
                {po?.vendor?.building}-{po?.vendor?.street}-{po?.vendor?.avenue}
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
            Total (Tax Excl.): {getPoTotalVal().totalVal?.toLocaleString()} {po?.items[0]?.currency}
          </Typography.Title>
          <Typography.Title level={5} className="self-end">
            Tax: {getPoTotalVal().totalTax?.toLocaleString()} {po?.items[0]?.currency}
          </Typography.Title>
          <Typography.Title level={5} className="self-end">
            Gross Total: {getPoTotalVal().grossTotal?.toLocaleString()} {po?.items[0]?.currency}
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

                    {!signing && (
                      <div className="text-blue-500 flex flex-col">
                        <div className="text-lg">Signed digitally</div>
                        <div>{moment(s.signedAt).format("DD MMM YYYY")} at</div>
                        <div>
                          {moment(s.signedAt)
                            .tz("Africa/Kigali")
                            .format("h:mm a z")}
                        </div>
                      </div>
                    )}
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
    </div>
  );
}
