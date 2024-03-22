"use client";
import React, { useState } from "react";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Spin, Upload, message } from "antd";
import { decode as base64_decode, encode as base64_encode } from "base-64";

function UploadVatCerts({
  label,
  uuid,
  setSelected,
  setId,
  iconOnly,
  setStatus,
}) {
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let token = typeof window !== 'undefined' && localStorage.getItem("token");

  let [loading, setLoading] = useState(false);
  const props = {
    onChange: ({ file, fileList }) => {
      let status = file.status;
      setStatus(status);
      if (status == "uploading") setLoading(true);
      else {
        setLoading(false);
        if (status == "error") {
          messageApi.error("Failed to upload the file!");
        } else {
          messageApi.success("Successfully uploaded the file!");
        }
      }
    },
    beforeUpload: (file) => {
      let isPDF = file.type == "application/pdf";
      if (!isPDF) {
        messageApi.error(`${file.name} is not a PDF file`);
        setSelected(false);
      } else {
        // setId(uuid);
        setSelected(true);
      }
      return isPDF || Upload.LIST_IGNORE;
    },
    action: `${url}/uploads/vatCerts?id=${uuid}`,
    headers: {
      Authorization: "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
      token: token,
      "Content-Type": "application/json",
    },
    listType: "document",
    previewFile(file) {
      // Your process logic. Here we just mock to the same file
      return fetch(`${url}/users/`, {
        method: "GET",
        body: file,
        headers: {
          Authorization:
            "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(({ thumbnail }) => thumbnail);
    },
  };
  return (
    <>
      {contextHolder}
      {/* <Upload {...props} headers={{}}>
        <Button icon={<UploadOutlined />}>{label ? label : "Upload"}</Button>
      </Upload> */}

      <Upload {...props} headers={{}} showUploadList={!iconOnly}>
        {iconOnly && (
          <div className="flex flex-row space-x-10 items-center text-blue-500 ">
            <div>{label}</div>

            {!loading ? (
              <UploadOutlined className="hover:cursor-pointer" />
            ) : (
              <Spin
                spinning={true}
                indicator={<LoadingOutlined />}
                size="small"
              />
            )}
          </div>
        )}
        {!iconOnly && (
          <Tooltip 
            placement="top"
            title={`Total file size 12 Mbs with a format: PDF, Docx`}
          >
            <Button icon={<UploadOutlined />}>{label ? label : "Upload"}</Button>
          </Tooltip>
        )}
      </Upload>
    </>
  );
}
export default UploadVatCerts;
