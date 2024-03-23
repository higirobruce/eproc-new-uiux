"use client";
import React, {useState} from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Upload, message, Tooltip } from "antd";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";

function UploadPaymentReq({
  label,
  uuid,
  setSelected,
  setId,
  files,
  setFiles,
  iconOnly
}) {
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
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
          messageApi.success("File removed!");
        } else {
          messageApi.success("Successfully uploaded the file!");
        }
      }
    },
    onRemove: (file) => {
      const index = files?.indexOf(file?.originFileObj);
      const newFileList = files?.slice();
      newFileList?.splice(index, 1);
      // setFileList(newFileList);
      let _files = [...files];
      _files = newFileList;

      // const _index = files.indexOf(file);
      // const _newFileList = files.slice();
      // _newFileList.splice(_index, 1);

      // console.log(_newFileList)
      setFiles(_files);
    },
    beforeUpload: (file) => {
      let isPDF = file.type == "application/pdf";
      // if (!isPDF) {
      //   messageApi.error(`${file.name} is not a PDF file`);
      //   return false || Upload.LIST_IGNORE;
      // }
      // let _fileList = [...fileList]

      // _fileList[uuid].push(file);
      // setFileList(_fileList);
      // setFiles([...files, file]);
      let _f = [...files];
      let f = _f;
      if (f) {
        f.push(file);
      } else _f.push([file]);
      setFiles(_f);

      // return isPDF || Upload.LIST_IGNORE;
      return false;
    },
    // action: `${url}/uploads/rdbCerts?id=${uuid}`,

    files,
    // listType: "document",
  };
  return (
    <>

      <>
        {contextHolder}
        <Upload {...props} headers={{}} multiple showUploadList={!iconOnly}>
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
              title={`Upload limit: 12 MB. Supported formats: PDF.`}
            >
              <div className=" rounded ring-1 ring-gray-300 px-3 items-center flex flex-row justify-center space-x-1 py-2 cursor-pointer shadow-md hover:shadow-sm active:bg-gray-50 transition-all ease-out duration-200">
                <CloudArrowUpIcon className="h-5 w-5 text-blue-500 " />
                <div className="text-sm">Select file(s)</div>
              </div>

            </Tooltip>
          )}
        </Upload>
      </>
    </>
  );
}
export default UploadPaymentReq;
