"use client";
import React, { useState } from "react";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Upload, Tooltip, message } from "antd";

function UploadTORs({
  label,
  uuid,
  fileList,
  setFileList,
  files,
  setFiles,
  itemFiles,
  disabled,
  setStatus,
  iconOnly,
}) {
  const [messageApi, contextHolder] = message.useMessage();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let [uploading, setUploading] = useState(false);

  let [loading, setLoading] = useState(false);
  // let [files, setFiles] = useState([]);

  // const handleUpload = () => {
  //   const formData = new FormData();
  //   files.forEach((file) => {

  //     formData.append("files[]", file);
  //   });
  //   setUploading(true);
  //   // You can use any AJAX library you like
  //   fetch(`${url}/uploads/termsOfReference/`, {
  //     method: "POST",
  //     body: formData,
  //     headers: {
  //       Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
  //       // "Content-Type": "multipart/form-data",
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((savedFiles) => {
  //       console.log(savedFiles)
  //       let _files = savedFiles?.map(f=>{
  //         return f?.filename
  //       })
  //       let _fileList = [...fileList]
  //       let len = _fileList.length
  //       _fileList[len] = [];
  //       _fileList[len]=_files

  //       setFileList(_fileList)
  //       setFiles([]);
  //       messageApi.success("upload successfully.");
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       messageApi.error("upload failed.");
  //     })
  //     .finally(() => {
  //       setUploading(false);
  //     });
  // };

  const props = {
    onChange: ({ file, fileList }) => {
      let status = file.status;
      setStatus(status);
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
      // const index = files[uuid]?.indexOf(file?.uid);
     
      const allFiles = [...files];
      const newFileList = allFiles[uuid]?.filter(
        (f) => f?.uid !== file?.uid
      );
      // let nullIndex = newFileList.indexOf(null);
      // newFileList?.splice(index, 1);
      // newFileList?.splice(nullIndex, 1);
      // setFileList(newFileList);
      // let _files = [...files];

      // _files[uuid] = newFileList;

      // const _index = files.indexOf(file);
      // const _newFileList = files.slice();
      // _newFileList.splice(_index, 1);

      // console.log(_newFileList)
      allFiles[uuid] = newFileList;
      setFiles(allFiles);
    },
    // multiple: false,
    // showUploadList: {
    //   showDownloadIcon: false,
    // },
    beforeUpload: (file) => {
      try {
        let isPDF = file.type == "application/pdf";
        if (!isPDF) {
          messageApi.error(`${file.name} is not a PDF file`);
          return false || Upload.LIST_IGNORE;
        }

        // let _fileList = [...fileList]

        // _fileList[uuid].push(file);
        // setFileList(_fileList);
        // setFiles([...files, file]);
        let _f = [...files];
        let f = _f[uuid];
        if (f) {
          f.push(file);
        } else _f.push([file]);
        setFiles(_f);

        // return isPDF || Upload.LIST_IGNORE;
        return false;
      } catch (err) {
        console.log(err);
      }
    },
    // action: `${url}/uploads/termsOfReference?id=23232`,
    // headers: {
    //   Authorization: "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
    //   "Content-Type": "application/json",
    // },
    // listType: "document",
    files,
    // previewFile(file) {
    //   console.log("Your upload file:", file);
    //   // Your process logic. Here we just mock to the same file
    //   return fetch(`${url}/users/`, {
    //     method: "GET",
    //     body: file,
    //     headers: {
    //       Authorization:
    //         "Basic " + window.btoa(`${apiUsername}:${apiPassword}`),
    //       "Content-Type": "application/json",
    //     },
    //   })
    //     .then((res) => res.json())
    //     .then(({ thumbnail }) => thumbnail);
    // },
  };

  return (
    <>
      {contextHolder}
      <Upload
        {...props}
        headers={{}}
        showUploadList={!iconOnly}
        defaultFileList={itemFiles}
      >
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
export default UploadTORs;
