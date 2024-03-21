import React from "react";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";
import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";

const generatePDF = (content) => {
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

export default function PrintPDF({ content }) {
  return (
    <div className="flex w-full justify-end">
      <Button
        type="primary"
        onClick={() => generatePDF(content)}
        icon={<PrinterOutlined />}
        className="self-end"
      ></Button>
    </div>
  );
}
