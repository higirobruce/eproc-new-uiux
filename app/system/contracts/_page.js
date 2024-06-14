"use client";
import {
  CloseCircleOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
  PlaySquareOutlined,
  PlusOutlined,
  PrinterOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Typography,
  MenuProps,
  Progress,
  Modal,
  Table,
  Empty,
  Popconfirm,
  Popover,
  Tag,
  Switch,
  message,
  Tooltip,
  Select,
  Spin,
  Row,
  Input,
  Col,
} from "antd";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import parse from "html-react-parser";
import * as _ from "lodash";
import moment from "moment-timezone";
import {
  LockClosedIcon,
  LockOpenIcon,
  PaperClipIcon,
} from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
// import MyPdfViewer from "../common/pdfViewer";
import ItemsTable from "../../components/itemsTableB1";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { encode } from "base-64";
import Link from "next/link";
import { motion } from "framer-motion";
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

export default function Contracts() {
  let router = useRouter();
  const { user, login, logout } = useUser();
  // let user = JSON.parse(localStorage.getItem("user"));
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
  const [dataLoaded, setDataLoaded] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let [contracts, setContracts] = useState(null);
  let [tempContracts, setTempContracts] = useState(null);
  let [contract, setContract] = useState(null);
  let [totalValue, setTotalValue] = useState(0);
  let [openViewContract, setOpenViewContract] = useState(false);
  let [startingDelivery, setStartingDelivery] = useState(false);
  const [editContract, setEditContract] = useState(
    user?.permissions?.canEditContracts
  );
  const [previewAttachment, setPreviewAttachment] = useState(false);
  const [attachmentId, setAttachmentId] = useState("TOR-id.pdf");

  const onMenuClick = (e) => {
    setOpenViewContract(true);
  };

  let [sections, setSections] = useState([
    { title: "Set section title", body: "" },
  ]);
  const [signatories, setSignatories] = useState([]);
  const [docDate, setDocDate] = useState(moment());
  const [docType, setDocType] = useState("dDocument_Service");
  const [searchStatus, setSearchStatus] = useState("all");
  const [signing, setSigning] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [creatingPo, setCreatingPo] = useState(false);
  const [openCreatePO, setOpenCreatePO] = useState(false);
  let [totalVal, setTotVal] = useState(0);
  let [totalTax, setTotTax] = useState(0);
  let [grossTotal, setGrossTotal] = useState(0);
  let [items, setItems] = useState(null);
  const [assetOptions, setAssetOptions] = useState([]);
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    getContracts();
    getFixedAssets();
  }, []);

  useEffect(() => {
    let list = [];
    assets.map((alist) => {
      alist.map((a) => {
        list.push(a);
      });
    });
  }, [assets]);

  useEffect(() => {
    setItems(contract?.request?.items);
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
  }, [contract]);

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
  }, [items]);

  useEffect(() => {
    getContracts();
  }, [searchStatus]);

  useEffect(() => {
    if (searchText === "") {
      getContracts();
    } else {
      let _dataSet = [...contracts];
      let filtered = _dataSet.filter((d) => {
        return (
          d?.number
            ?.toString()
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1 ||
          d?.vendor?.companyName
            ?.toString()
            .toLowerCase()
            .indexOf(searchText.toLowerCase()) > -1
        );
      });
      setTempContracts(filtered);
      // else setTempDataset(dataset)
    }
  }, [searchText]);

  useEffect(() => {
    if (openViewContract) {
      setSections(contract?.sections);
      setSignatories(contract?.signatories);
    }
  }, [openViewContract]);

  async function handleCreatePO(
    vendor,
    tender,
    createdBy,
    sections,
    items,
    B1Data,
    signatories,
    request
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
        signatories,
        request,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res1) => {
        if (res1.error) {
          messageApi.error(
            res1?.error?.message?.value
              ? res1?.error?.message?.value
              : res1?.message
          );
        } else {
          getContracts();
          setOpenCreatePO(false);
          setCreatingPo(false);
        }
      })
      .catch((err) => {
        console.error(err);

        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

  function getFixedAssets() {
    fetch(`${url}/b1/fixedAssets`, {
      method: "GET",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => getResultFromServer(res))
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
              label: v?.ItemName,
            };
          });
          setAssetOptions(assetOptions);
        }
      })
      .catch((err) => {
        messageApi.error({
          content: "Could not fetch fixed assets!",
        });
      });
  }

  function createPOMOdal() {
    return (
      <Modal
        title="New Purchase Order"
        centered
        open={openCreatePO}
        confirmLoading={creatingPo}
        onOk={async () => {
          setCreatingPo(true);
          let assetItems = [];
          let nonAssetItems = [];
          let docCurrency = (items && items[0]?.currency) || "RWF";
          items
            .filter((i) => i.itemType === "asset")
            .map((i, index) => {
              i?.assetCodes?.map((a) => {
                assetItems.push({
                  ItemCode: a,
                  Quantity: i.quantity / i?.assetCodes?.length,
                  UnitPrice: i.estimatedUnitCost,
                  VatGroup: i.taxGroup ? i.taxGroup : "X1",
                  Currency: i.currency ? i.currency : "RWF",
                });
              });
            });

          items
            .filter((i) => i.itemType === "non-asset" || !i.itemType)
            .map((i, index) => {
              nonAssetItems.push({
                // ItemCode: a,
                Quantity: i.quantity,
                UnitPrice: i.estimatedUnitCost,
                VatGroup: i.taxGroup ? i.taxGroup : "X1",
                Currency: i.currency ? i.currency : "RWF",
                ItemDescription: i.title,
              });
            });

          // if (docType === "dDocument_Item") {
          //   items.map((i, index) => {
          //     assets[index]?.map((a) => {
          //       assetItems.push({
          //         ItemCode: a,
          //         Quantity: i.quantity / assets[index]?.length,
          //         UnitPrice: i.estimatedUnitCost,
          //         VatGroup: i.taxGroup ? i.taxGroup : "X1",
          // Currency: i.currency ? i.currency : "RWF",
          //       });
          //     });
          //   });
          // }
          let B1Data_Assets;
          assetItems?.length >= 1
            ? (B1Data_Assets = {
                CardName: contract?.vendor?.companyName,
                DocType: "dDocument_Item",
                DocDate: docDate,
                DocumentLines: assetItems,
                DocCurrency: docCurrency,
              })
            : (B1Data_Assets = null);

          let B1Data_NonAssets;
          nonAssetItems?.length >= 1
            ? (B1Data_NonAssets = {
                CardName: contract?.vendor?.companyName,
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
            setCreatingPo(false);
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
            setCreatingPo(false);
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
            setCreatingPo(false);
          } else {
            await handleCreatePO(
              contract?.vendor?._id,
              contract?.tender?._id,
              user?._id,
              sections,
              items,
              {
                B1Data_Assets,
                B1Data_NonAssets,
              },
              signatories,
              contract?.request?._id
            );
            setCreatingPo(false);
            setOpenCreatePO(false);
          }
        }}
        okText="Save and Submit"
        onCancel={() => setOpenCreatePO(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        {contextHolder}
        <div className="space-y-5 px-20 py-5">
          <Typography.Title level={4}>
            PURCHASE ORDER: {contract?.vendor?.companyName}
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
                <Typography.Text strong>
                  {contract?.vendor?.companyName}
                </Typography.Text>
              </div>

              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company Address</div>
                </Typography.Text>
                <Typography.Text strong>
                  {contract?.vendor?.building}-{contract?.vendor?.street}-
                  {contract?.vendor?.avenue}
                </Typography.Text>
              </div>
              <div className="flex flex-col">
                <Typography.Text type="secondary">
                  <div className="text-xs">Company TIN no.</div>
                </Typography.Text>
                <Typography.Text strong>
                  {contract?.vendor?.tin}
                </Typography.Text>
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
                <Typography.Title level={4}>Asset assignment</Typography.Title>∏
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
            <ItemsTable
              dataSource={items}
              setDataSource={setItems}
              assetOptions={assetOptions}
            />
            <Typography.Title level={5} className="self-end">
              Total (Tax Excl.):{" "}
              {items && items[0]?.currency + " " + totalVal?.toLocaleString()}
            </Typography.Title>
            <Typography.Title level={5} className="self-end">
              Total Tax:{" "}
              {items && items[0]?.currency + " " + totalTax?.toLocaleString()}
            </Typography.Title>
            <Typography.Title level={4} className="self-end">
              Gross Total:{" "}
              {items && items[0]?.currency + " " + grossTotal?.toLocaleString()}

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
                      onBehalfOf: contract?.vendor?.companyName,
                      title: contract?.vendor?.title,
                      names: contract?.vendor?.contactPersonNames,
                      email: contract?.vendor?.email,
                    };

                    signs.push(newSignatory);
                    setSignatories(signs);
                  }}
                >
                  Add external Signatory
                </div>
              </div>
              {/* New Signatory */}
              {/* <div
                onClick={() => {
                  let signs = [...signatories];
                  let newSignatory =
                    signs?.length <= 1
                      ? { onBehalfOf: "Irembo Ltd" }
                      : {
                          onBehalfOf: contract?.vendor?.companyName,
                          title: contract?.vendor?.title,
                          names: contract?.vendor?.contactPersonNames,
                          email: contract?.vendor?.email,
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

  function getContracts() {
    setDataLoaded(false);
    if (user?.userType === "VENDOR") {
      fetch(`${url}/contracts/byVendorId/${user?._id}/${searchStatus}`, {
        method: "GET",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => getResultFromServer(res))
        .then((res) => {
          setContracts(res);
          setTempContracts(res);
          setDataLoaded(true);
        })
        .catch((err) => {
          setDataLoaded(true);
        });
    } else {
      fetch(`${url}/contracts/byStatus/${searchStatus}`, {
        method: "GET",
        headers: {
          Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
          token: token,
          "Content-Type": "application/json",
        },
      })
        .then((res) => getResultFromServer(res))
        .then((res) => {
          let _contracts = user?.permissions?.canApproveAsLegal
            ? res
            : res?.filter((r) => r.status !== "draft");
          setContracts(_contracts);
          setTempContracts(_contracts);
          setDataLoaded(true);
        })
        .catch((err) => {
          setDataLoaded(true);
        });
    }
  }

  function viewContractMOdal() {
    return (
      <Modal
        title="Display Contract"
        centered
        open={openViewContract}
        onOk={() => {
          editContract &&
            contract?.status === "draft" &&
            handleUpdateContract(sections, signatories, "draft");
          setOpenViewContract(false);
        }}
        okText={
          editContract && contract?.status === "draft"
            ? "Save and Send contract"
            : "Ok"
        }
        onCancel={() => setOpenViewContract(false)}
        width={"80%"}
        bodyStyle={{ maxHeight: "700px", overflow: "scroll" }}
      >
        <div className="space-y-10 px-20 py-5 overflow-x-scroll">
          {/* Header */}
          <div className="flex flex-row justify-between items-center">
            <Typography.Title level={4} className="flex flex-row items-center">
              <div>
                CONTRACTOR #{contract?.number}{" "}
                {/* <div>
                  <Popover
                    placement="topLeft"
                    content={`${moment(contract?.startDate).format(
                      "YYYY-MMM-DD"
                    )} - ${moment(contract?.endDate).format("YYYY-MMM-DD")}`}
                  >
                    <div className="text-xs font-thin text-gray-500">
                      Expires in {moment(contract?.endDate).fromNow()}
                    </div>
                  </Popover>
                </div> */}
              </div>
            </Typography.Title>
            {/* {contract?.status !== "draft" && (
              <Button icon={<PrinterOutlined />}>Print</Button>
            )} */}
            {contract?.status === "draft" &&
              (user?.permissions?.canEditContracts ||
                user?.permissions?.canApproveAsLegal) && (
                <Switch
                  checkedChildren={<EditOutlined />}
                  unCheckedChildren={<EyeOutlined />}
                  defaultChecked={editContract}
                  onChange={(checked) => setEditContract(checked)}
                />
              )}
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
                <Typography.Text strong>
                  {contract?.vendor?.tin}
                </Typography.Text>
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
            {sections?.map((s, index) => {
              let section = sections[index]
                ? sections[index]
                : { title: "", body: "" };
              let _sections = [...sections];
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
                            setSections(_sections);
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
                          setSections(_sections);
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
                        setSections(_sections);
                      }}
                    />
                  )}
                </>
              );
            })}
            {editContract && contract?.status === "draft" && (
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
            )}
          </div>
          {/* Signatories */}
          <div className="grid grid-cols-3 gap-5">
            {signatories?.map((s, index) => {
              let yetToSign = signatories?.filter((notS) => {
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
                      <Typography.Text
                        strong
                        editable={
                          editContract &&
                          contract?.status === "draft" && {
                            text: s.onBehalfOf,
                            onChange: (e) => {
                              let _signatories = [...signatories];
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
                              let _signatories = [...signatories];
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
                              let _signatories = [...signatories];
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
                              let _signatories = [...signatories];
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
                    previousSignatorySigned(signatories, index) &&
                    contract.status !== "draft" && (
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
                    !previousSignatorySigned(signatories, index) ||
                    contract?.status == "draft") && (
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
      </Modal>
    );
  }

  function handleUpdateContract(sections, signatories, previousStatus) {
    let _contract = { ...contract };
    _contract.sections = sections;
    _contract.signatories = signatories;
    _contract.status = "pending-signature";

    fetch(`${url}/contracts/${contract?._id}`, {
      method: "PUT",
      headers: {
        Authorization: "Basic " + encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newContract: _contract,
        previousStatus,
      }),
    })
      .then((res) => getResultFromServer(res))
      .then((res1) => {
        setSignatories([]);
        setSections([{ title: "Set section title", body: "" }]);
        setEditContract(false);
        getContracts();
        // updateBidList();
      })
      .catch((err) => {
        // console.error(err);
        messageApi.open({
          type: "error",
          content: JSON.stringify(err),
        });
      });
  }

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
            setContract(res);
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

  function getPoTotalVal() {
    let t = 0;
    let tax = 0;
    contract?.items.map((i) => {
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

  function handleStartDelivery(po) {
    let _pos = [...contracts];
    // Find item index using _.findIndex (thanks @AJ Richardson for comment)
    var index = _.findIndex(_pos, { _id: po._id });
    let elindex = _pos[index];
    elindex.status = "starting";
    // Replace item at index using native splice
    _pos.splice(index, 1, elindex);

    setContracts(_pos);
    setTempContracts(_pos);

    fetch(`${url}/purchaseOrders/status/${po?._id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "started",
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
          let _pos = [...contracts];
          // Find item index using _.findIndex (thanks @AJ Richardson for comment)
          var index = _.findIndex(_pos, { _id: po._id });
          let elindex = _pos[index];
          elindex.status = "pending";
          // Replace item at index using native splice
          _pos.splice(index, 1, elindex);

          setContracts(_pos);
          setTempContracts(_pos);
        } else {
          let _pos = [...contracts];
          // Find item index using _.findIndex (thanks @AJ Richardson for comment)
          var index = _.findIndex(_pos, { _id: po._id });
          let elindex = _pos[index];
          elindex.status = "started";
          // Replace item at index using native splice
          _pos.splice(index, 1, elindex);

          setContracts(_pos);
          setTempContracts(_pos);
        }
      });
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
    //     <div>
    //       <MyPdfViewer fileUrl={`${url}/file/${attachmentId}`} />
    //     </div>
    //   </Modal>
    // );
  }

  function getResultFromServer(res) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push(`/auth?goTo=/system/contracts&sessionExpired=true`);
    } else {
      return res.json();
    }
  }

  return (
    <>
      {contextHolder}
      {previewAttachmentModal()}
      {createPOMOdal()}
      {dataLoaded ? (
        <div className="flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-10 h-full pb-10 overflow-auto">
          {viewContractMOdal()}

          <Row className="flex flex-col custom-sticky space-y-2 bg-white px-10 py-3 shadow stick top-0">
            <div className="flex flex-row justify-between items-center">
              <div className="text-xl font-semibold">Contracts List</div>
            </div>

            <Row className="flex flex-row space-x-5 items-center justify-between">
              <div className="flex-1">
                <Select
                  // mode="tags"
                  style={{ width: "300px" }}
                  placeholder="Select status"
                  onChange={(value) => setSearchStatus(value)}
                  value={searchStatus}
                  options={[
                    { value: "all", label: "All" },
                    { value: "draft", label: "Draft" },
                    {
                      value: "pending-signature",
                      label: "Pending Signature",
                    },
                    {
                      value: "partially-signed",
                      label: "Paritally Signed",
                    },
                    {
                      value: "signed",
                      label: "Signed",
                    },
                  ]}
                />
              </div>
              <div className="z-0">
                <Input.Search
                  style={{ width: "300px" }}
                  autoFocus
                  onChange={(e) => {
                    setSearchText(e?.target?.value);
                  }}
                  placeholder="Search by contract#, vendor name"
                />
              </div>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => getContracts()}
              ></Button>
            </Row>
          </Row>
          {(tempContracts?.length < 1 || !contracts) && <Empty />}
          {contracts && tempContracts?.length >= 1 && (
            <Row className="request flex flex-col mx-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: contracts && tempContracts?.length >= 1 ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  type: "tween",
                  ease: "circOut",
                }}
              >
                <Col flex={5}>
                  {tempContracts?.map((contract) => {
                    let t = 0;
                    return (
                      <div
                        key={contract?.number}
                        // className="grid md:grid-cols-6 gap-3 ring-1 ring-gray-200 bg-white rounded px-5 py-3 shadow hover:shadow-md m-3"
                        className={`grid ${
                          user?.userType !== "VENDOR"
                            ? `lg:grid-cols-6`
                            : `lg:grid-cols-5`
                        } sm:grid-col-1 md:grid-cols-3 gap-1 ring-1 ring-gray-200 bg-white rounded px-5 py-3 shadow hover:shadow-md m-3`}
                      >
                        {/*  */}
                        <div className="flex flex-col space-y-1">
                          <div className="text-xs text-gray-600">Contract</div>
                          <div className="font-semibold flex flex-row items-center space-x-2">
                            <div>{contract?.number}</div>{" "}
                            {(user?.userType !== "VENDOR" ||
                              (documentFullySignedInternally(contract) &&
                                user?.userType === "VENDOR")) && (
                              <Link href={`/system/contracts/${contract?._id}`}>
                                <PrinterOutlined className="text-blue-400 cursor-pointer" />
                              </Link>
                            )}
                          </div>
                          {(contract?.tender?.purchaseRequest?._id ||
                            contract?.request?._id) &&
                            user?.userType !== "VENDOR" && (
                              <div className="text-gray-600">
                                <Link
                                  alt=""
                                  href={`/system/requests/${
                                    contract?.tender?.purchaseRequest?._id ||
                                    contract?.request?._id
                                  }`}
                                >
                                  Req Number:{" "}
                                  {contract?.tender?.purchaseRequest?.number ||
                                    contract?.request?.number}
                                </Link>
                              </div>
                            )}

                          {contract?.reqAttachmentDocId && (
                            <Link
                              href={`${url}/file/reqAttachments/${contract?.reqAttachmentDocId}.pdf`}
                              target="_blank"
                            >
                              <Typography.Link className="flex flex-row items-center space-x-2">
                                <div>Reference doc</div>{" "}
                                <PaperClipIcon className="h-4 w-4" />
                              </Typography.Link>
                            </Link>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="text-xs text-gray-600">Vendor</div>
                          <div className="font-semibold">
                            {contract?.vendor?.companyName}
                          </div>
                          <div className=" text-gray-500">
                            TIN: {contract?.vendor?.tin}
                          </div>
                          <div className=" text-gray-500">
                            email: {contract?.vendor?.companyEmail}
                          </div>
                        </div>

                        {/* Signatories */}
                        {(user?.userType !== "VENDOR" ||
                          (user?.userType == "VENDOR" &&
                            documentFullySignedInternally(contract))) && (
                          <div className="flex flex-col space-y-3 text-gray-600">
                            {contract?.signatories?.map((s) => {
                              return (
                                <div
                                  key={s?.email}
                                  className="flex flex-row items-center space-x-2"
                                >
                                  <div>
                                    {s?.signed ? (
                                      <Tooltip
                                        title={`signed: ${moment(
                                          s?.signedAt
                                        ).format("DD MMM YYYY")} at ${moment(
                                          s?.signedAt
                                        )
                                          .tz("Africa/Kigali")
                                          .format("h:mm a z")}`}
                                      >
                                        <span>
                                          <LockClosedIcon className="h-5 text-green-500" />
                                        </span>
                                      </Tooltip>
                                    ) : (
                                      <Tooltip title="Signature still pending">
                                        <span>
                                          <LockOpenIcon className="h-5 text-yellow-500" />
                                        </span>
                                      </Tooltip>
                                    )}
                                  </div>
                                  <div className="flex flex-col text-gray-600">
                                    <div>{s?.onBehalfOf}</div>
                                    <div>{s?.names}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex flex-col space-y-1 items-center justify-center">
                          {/* <Dropdown.Button
                        menu={{ items, onClick: onMenuClick }}
                        onOpenChange={() => {
                          setContract(contract);
                        }}
                      >
                        Actions
                      </Dropdown.Button> */}
                          <Button
                            disabled={
                              user?.userType === "VENDOR" &&
                              !documentFullySignedInternally(contract)
                            }
                            onClick={() => {
                              setContract(contract);
                              setOpenViewContract(true);
                            }}
                          >
                            View Doc
                          </Button>
                        </div>

                        <div className="flex flex-col space-y-1 items-center justify-center">
                          {/* <Dropdown.Button
                        menu={{ items, onClick: onMenuClick }}
                        onOpenChange={() => {
                          setContract(contract);
                        }}
                      >
                        Actions
                      </Dropdown.Button> */}
                          {user?.userType !== "VENDOR" && (
                            <Button
                              disabled={
                                !documentFullySigned(contract) ||
                                user?.userType == "VENDOR" ||
                                moment(contract?.endDate).isBefore(moment())
                              }
                              onClick={() => {
                                setContract(contract);
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
                                    onBehalfOf: contract?.vendor?.companyName,
                                    title: contract?.vendor?.title,
                                    names: contract?.vendor?.contactPersonNames,
                                    email: contract?.vendor?.email,
                                  },
                                ];

                                setSignatories(_signatories);
                                setOpenCreatePO(true);
                              }}
                            >
                              Create PO
                            </Button>
                          )}
                        </div>

                        <div className="flex flex-col space-y-1 justify-center">
                          {/* <div className="text-xs text-gray-400">Delivery</div> */}
                          {(!documentFullySignedInternally(contract) ||
                            !documentFullySigned(contract)) && (
                            <div>
                              <Tag color="yellow">{contract?.status}</Tag>
                            </div>
                          )}
                          {documentFullySigned(contract) && (
                            <>
                              <div>
                                <Tag color="green">{contract?.status}</Tag>
                              </div>
                              <Popover
                                placement="topLeft"
                                content={`${moment(contract?.startDate).format(
                                  "YYYY-MMM-DD"
                                )} - ${moment(contract?.endDate).format(
                                  "YYYY-MMM-DD"
                                )}`}
                              >
                                <div className="text-xs font-thin text-gray-500">
                                  Expires in{" "}
                                  {moment(contract?.endDate).fromNow()}
                                </div>
                              </Popover>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Col>
              </motion.div>
            </Row>
          )}

          {/* <div class="absolute -bottom-20 right-10 opacity-10">
            <Image alt="watermatk" src="/icons/blue icon.png" width={110} height={100} />
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
