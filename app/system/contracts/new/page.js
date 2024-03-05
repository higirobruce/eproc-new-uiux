"use client";
import React from "react";
import { BsBuildings } from "react-icons/bs";
import { HiOutlineHashtag } from "react-icons/hi";
import { MdOutlineLocationOn, MdLock } from "react-icons/md";
import { FiPlus } from "react-icons/fi";
import { LuUser } from "react-icons/lu";
import { message } from "antd";
import { DatePicker, Form, Input } from "antd";
import dynamic from "next/dynamic";
import QRCode from "react-qr-code";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { useRouter } from 'next/router';

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
  "code"
];

export default function page() {
  const [messageApi] = message.useMessage();
  const router = useRouter();
  const passedData = router.query.data;


  console.log('Pass Data ', passedData)

  return (
    <>
      <div className="flex flex-col transition-opacity ease-in-out duration-1000 flex-1 space-y-6 h-screen mt-6 pb-10 pt-5">
        <div className="request mr-6 grid md:grid-cols-7 gap-x-5 rounded-lg h-[calc(100vh-110px)] mb-10 px-5 pb-2">
          <div className="payment-request md:col-span-5 flex flex-col gap-y-3 h-[calc(100%-20px)] overflow-y-auto">
            <div className="bg-white rounded-lg">
              <div className="flex flex-col pl-5 p-8 rounded-lg mb-4 border-0">
                <h6 className="text-[#344767] text-[18px] font-medium m-0">
                  Contract #20000
                </h6>
                <div className="flex flex-col gap-y-3 mt-8">
                  <label className="text-[#8392AB] text-[13px]">
                    Contract tile
                  </label>
                  <div className="rounded border border-[#CCC] border-solid px-2 py-2.5 w-1/3">
                    <p className="m-0 text-[15px] text-[#344767]">
                      Machine Supplying
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[520px] overflow-y-auto px-5">
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  onChange={(value) => {
                    // section.body = value;
                    // _sections[index]
                    //   ? (_sections[index] = section)
                    //   : _sections.push(section);
                    // setSections(_sections);
                  }}
                />
              </div>
            </div>
            <div className="bg-white rounded-lg">
              <div className="flex flex-col pl-5 p-8 rounded-lg mb-4 border-0">
                <h6 className="text-[#344767] text-[16px] font-medium m-0">
                  Contract Signatories
                </h6>
                <div className="grid md:grid-cols-3 items-center gap-x-3 mt-7">
                  <div>
                    <div className="flex items-center gap-x-2">
                      <LuUser className="text-[#CCC]" />
                      <small className="text-[12px] text-[#344767] font-semibold">
                        Signee
                      </small>
                    </div>
                    <div className="border-y-0 border-l-0 border-r border-solid border-[#F0F0FA] pr-5 mt-5">
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          On behalf of
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          value={"Irembo Ltd"}
                          placeholder="Type beholder"
                        />
                      </Form.Item>
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          Representative title
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          value={"Head of Supply Chain"}
                          placeholder="Your title"
                        />
                      </Form.Item>
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          Representative name
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          value={"John Doe"}
                          placeholder="Your name"
                        />
                      </Form.Item>
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          Email
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          value={"eric@shapeherd.com"}
                          placeholder="Your Email"
                        />
                      </Form.Item>
                      <div
                        className={`mt-4 bg-[#F0FEF3] px-8 py-3 flex items-start gap-x-4`}
                      >
                        <QRCode value="hey" fgColor="#00CE82" size={36} />
                        <div className="flex flex-col gap-y-2">
                          <h6 className="text-[#00CE82] m-0">
                            Signed digitally with verification
                          </h6>
                          <h6 className="text-[12px] text-[#00CE82] font-thin m-0">
                            13 February 2024, 20:38:05
                          </h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-x-2">
                      <LuUser className="text-[#CCC]" />
                      <small className="text-[12px] text-[#344767] font-semibold">
                        Signee
                      </small>
                    </div>
                    <div className="border-y-0 border-l-0 border-r border-solid border-[#F0F0FA] pr-5 mt-5">
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          On behalf of
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          placeholder="Type beholder"
                        />
                      </Form.Item>
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          Representative title
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          placeholder="Your title"
                        />
                      </Form.Item>
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          Representative name
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          placeholder="Your name"
                        />
                      </Form.Item>
                      <Form.Item className="my-3">
                        <small className="text-[12px] text-[#344767] pb-2">
                          Email
                        </small>
                        <Input
                          className="w-full h-9 mt-2 text-[13px]"
                          placeholder="Your Email"
                        />
                      </Form.Item>
                      <div
                        className={`mt-4 bg-[#FCFCFF] border-solid border-[#F1F1FA] border rounded px-8 py-5 flex items-start gap-x-4`}
                      >
                        <MdLock className="h-5 w-5 text-[#B3BBC2]" />
                        <h6 className="text-[#B3BBC2] m-1">
                          Signature will appear here
                        </h6>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col w-full items-center gap-y-1.5">
                    <button className="cursor-pointer border-none bg-[#fdfdfd] w-16 h-16 shadow-xl rounded-full flex items-center justify-center">
                      <FiPlus className="w-6 h-6 mt-1" />
                    </button>
                    <h6 className="m-3 text-[14px] text-[#344767]">
                      Add Signee
                    </h6>
                    <small className="md:px-12 leading-6 text-[13px] text-center text-[#B3BBC2]">
                      Multiple signees can sign on behalf of the same party
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:col-span-2">
            <div className="flex flex-col rounded-lg bg-white pl-5 p-6 shadow">
              <h6 className="text-[#212a3a] text-[16px] font-bold m-0">
                Contract Stakeholders
              </h6>
              <div className="flex justify-between items-start mt-10 pb-5 mb-5 border-solid border-x-0 border-t-0 border-b border-[#F5F5F5]">
                <div className="flex flex-col gap-y-6">
                  <div className="flex items-center gap-x-3">
                    <BsBuildings className="h-3.5 w-3.5 text-[#8392AB]" />
                    <small className="text-[13px] text-[#344767]">
                      Irembo Ltd
                    </small>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <MdOutlineLocationOn className="h-4 w-4 text-[#8392AB]" />
                    <small className="text-[12px] text-[#344767]">
                      Irembo Campus, Nyarutarama KG 459 St
                    </small>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <HiOutlineHashtag className="h-3.5 w-3.5 text-[#8392AB]" />
                    <small className="text-[13px] text-[#344767] font-semibold">
                      10291156
                    </small>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <small className="text-[11px] text-[#344767]">
                    Referred to as
                  </small>
                  <small className="text-[13px] text-[#344767] font-bold">
                    Sender
                  </small>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-y-6">
                  <div className="flex items-center gap-x-3">
                    <BsBuildings className="h-3.5 w-3.5 text-[#8392AB]" />
                    <small className="text-[13px] text-[#344767]">-</small>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <MdOutlineLocationOn className="h-4 w-4 text-[#8392AB]" />
                    <small className="text-[12px] text-[#344767]">-</small>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <HiOutlineHashtag className="h-3.5 w-3.5 text-[#8392AB]" />
                    <small className="text-[13px] text-[#344767] font-semibold">
                      -
                    </small>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <small className="text-[11px] text-[#344767]">
                    Referred to as
                  </small>
                  <small className="text-[13px] text-[#344767] font-bold">
                    Receiver
                  </small>
                </div>
              </div>
            </div>
            <div className="flex flex-col rounded-lg bg-white px-5 pt-6 shadow">
              <h6 className="text-[#212a3a] text-[16px] font-bold m-0">
                Contract Life Time
              </h6>
              <Form className="my-5">
                <Form.Item>
                  <small className="text-[12px] font-semibold text-[#344767] pl-2">
                    Creation Date
                  </small>
                  <DatePicker className="w-full border-x-0 rounded-none border-t-0 border-b border-b-[#F5F5F5]" />
                </Form.Item>
                <Form.Item>
                  <small className="text-[12px] font-semibold text-[#344767] pl-2">
                    Review Date
                  </small>
                  <DatePicker className="w-full border-x-0 rounded-none border-t-0 border-b border-b-[#F5F5F5]" />
                </Form.Item>
                <Form.Item>
                  <small className="text-[12px] font-semibold text-[#344767] pl-2">
                    Expiration Date
                  </small>
                  <DatePicker className="w-full border-x-0 rounded-none border-t-0 border-b border-b-[#F5F5F5]" />
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
