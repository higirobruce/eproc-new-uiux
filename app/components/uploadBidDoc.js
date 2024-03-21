"use client";
import React, { useState } from "react";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Upload, message, UploadFile, Spin } from "antd";

function UploadBidDoc({ label, uuid, setSelected, iconOnly }) {
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let token = typeof window !== 'undefined' && localStorage.getItem("token");
  let [loading, setLoading] = useState(false);

  const props = {
    multiple: false,
    showUploadList: {
      showDownloadIcon: false,
    },
    onChange: ({ file, fileList }) => {
      let status = file.status;
      // setStatus(status);
      if (status == "uploading") setLoading(true);
      else {
        setLoading(false);
        if (status == "error") {
          messageApi.error("Failed to upload the file!");
        } else if (status == "removed") {
          messageApi.success("File removed!");
        } else {
          messageApi.success("Successfully uploaded the file!");
        }
      }
    },
    onRemove: (file) => {
      setSelected(false);
    },
    beforeUpload: (file) => {
      let isPDF = file.type == "application/pdf";
      if (!isPDF) {
        messageApi.error(`${file.name} is not a PDF file`);
        setSelected(false);
      }
      setSelected(true);

      return isPDF || Upload.LIST_IGNORE;
    },
    action: `${url}/uploads/bidDocs?id=${uuid}`,
    headers: {
      Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
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
            "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
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
      <Upload {...props} headers={{}} maxCount={1} showUploadList={!iconOnly}>
        {/* <Button icon={<UploadOutlined />}>{label ? label : "Upload"}</Button> */}
        {iconOnly && (
          <div className="text-grey-500 hover:text-blue-500 cursor-pointer flex flex-row items-center space-x-1">
            {!loading ? (
              <UploadOutlined />
            ) : (
              <Spin
                spinning={true}
                indicator={<LoadingOutlined />}
                size="small"
              />
            )}

            <div className="text-xs">{label}</div>
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
export default UploadBidDoc;
