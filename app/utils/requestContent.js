import React from "react";
import { Popconfirm, Spin, Table, Typography } from "antd";
import parse from "html-react-parser";
import { LoadingOutlined } from "@ant-design/icons";
import moment from "moment-timezone";

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
    title: "Unit Price (RWF)",
    dataIndex: "estimatedUnitCost",
    key: "estimatedUnitCost",
    render: (_, item) => <>{(item?.estimatedUnitCost).toLocaleString()}</>,
  },
  {
    title: "Total Amount (Rwf)",
    dataIndex: "totalAmount",
    key: "totalAmount",
    render: (_, item) => (
      <>{(item?.quantity * item?.estimatedUnitCost).toLocaleString()}</>
    ),
  },
];

export const content = (po, signing, user) => {
  function previousSignatorySigned(signatories, index) {
    let signed = index == 0 ? true : signatories[index - 1]?.signed;
    return signed;
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
            <Typography.Text strong>{po?.vendor?.companyName}</Typography.Text>
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
          Total (Tax Excl.): {getPoTotalVal().totalVal?.toLocaleString()} RWF
        </Typography.Title>
        <Typography.Title level={5} className="self-end">
          Tax: {getPoTotalVal().totalTax?.toLocaleString()} RWF
        </Typography.Title>
        <Typography.Title level={5} className="self-end">
          Gross Total: {getPoTotalVal().grossTotal?.toLocaleString()} RWF
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
                        <Typography.Text strong>{s?.ipAddress}</Typography.Text>
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
