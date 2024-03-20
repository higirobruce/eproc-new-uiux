"use client";
import React, { useState } from "react";
import {
  CloudSyncOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Spin, Upload, message } from "antd";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";

function UpdatePaymentReqDoc({
  label,
  uuid,
  files,
  iconOnly,
  reloadFileList,
  paymentProof = false,
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

      // setStatus(status);
      if (status == "uploading") setLoading(true);
      else {
        setLoading(false);
        if (status == "error") {
          messageApi.error("Failed to upload the file!");
        } else if (status == "removed") {
          reloadFileList();
          messageApi.success("File removed!");
        } else {
          reloadFileList();
          messageApi.success("Successfully uploaded the file!");
        }
      }
    },
    onRemove: (file) => {
      // const index = files?.indexOf(file?.originFileObj);
      // const newFileList = files?.slice();
      // newFileList?.splice(index, 1);
      // // setFileList(newFileList);
      // let _files = [...files];
      // _files = newFileList;
      // // const _index = files.indexOf(file);
      // // const _newFileList = files.slice();
      // // _newFileList.splice(_index, 1);
      // // console.log(_newFileList)
      // setFiles(_files);
    },
    beforeUpload: (file) => {

      // let isPDF = file.type == "application/pdf";
      // if (!isPDF) {
      //   messageApi.error(`${file.name} is not a PDF file`);
      // } else {
      // }

      // return isPDF || Upload.LIST_IGNORE;
    },
    action: `${url}/uploads/updatePaymentRequests?id=${uuid}&&paymentProof=${paymentProof}`,
    headers: {
      Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
      token,
      "Content-Type": "application/json",
    },
    // listType: "document",
  };
  return (
    <>
      {contextHolder}

      <>
        {contextHolder}
        <Upload {...props} headers={{}} showUploadList={!iconOnly}>
          {/* <Button icon={<UploadOutlined />}>{label ? label : "Upload"}</Button> */}
          {iconOnly && (
            <div className="text-grey-500 hover:text-blue-500 cursor-pointer flex flex-row items-center space-x-1">
              {!loading ? (
                <CloudSyncOutlined />
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
            <div className=" rounded ring-1 ring-gray-300 px-3 items-center flex flex-row justify-center space-x-1 py-2 cursor-pointer shadow-md hover:shadow-sm active:bg-gray-50 transition-all ease-out duration-200">
              <CloudArrowUpIcon className="h-5 w-5 text-blue-500 " />
              <div className="text-sm">Select file(s)</div>
            </div>
          )}
        </Upload>
      </>
    </>
  );
}
export default UpdatePaymentReqDoc;
