'use client'
import { Checkbox, Table } from "antd";
import { Switch } from 'antd';
import { usePathname } from 'next/navigation'

function PermissionsTable({
  canViewRequests,
  canCreateRequests,
  canEditRequests,
  canApproveRequests,
  canViewPaymentRequests,
  canCreatePaymentRequests,
  canEditPaymentRequests,
  canApprovePaymentRequests,
  canViewTenders,
  canCreateTenders,
  canEditTenders,
  canApproveTenders,
  canViewBids,
  canCreateBids,
  canEditBids,
  canApproveBids,
  canViewContracts,
  canCreateContracts,
  canEditContracts,
  canApproveContracts,
  canViewPurchaseOrders,
  canCreatePurchaseOrders,
  canEditPurchaseOrders,
  canApprovePurchaseOrders,
  canViewVendors,
  canCreateVendors,
  canEditVendors,
  canApproveVendors,
  canViewUsers,
  canCreateUsers,
  canEditUsers,
  canApproveUsers,
  canViewDashboard,
  canCreateDashboard,
  canEditDashboard,
  canApproveDashboard,
  handleSetCanView,
  handleSetCanCreated,
  handleSetCanEdit,
  handleSetCanApprove,
  canNotEdit,
}) {
  const pathname = usePathname();
  const columns = [
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "View",
      //   dataIndex: "view",
      key: "view",
      render: (_, row) => {
        return (
          <Checkbox
            disabled={canNotEdit}
            defaultChecked={row?.view}
            onChange={(e) => handleSetCanView(e.target.checked, row?.alias)}
          />
        );
      },
    },
    {
      title: "Create",
      //   dataIndex: "create",
      key: "create",
      render: (_, row) => {
        return (
          <Checkbox
            disabled={canNotEdit}
            defaultChecked={row?.create}
            onChange={(e) => handleSetCanCreated(e.target.checked, row?.alias)}
          />
        );
      },
    },
    {
      title: "Edit",
      //   dataIndex: "edit",
      key: "edit",
      render: (_, row) => {
        return (
          <Checkbox
            disabled={canNotEdit}
            defaultChecked={row?.edit}
            onChange={(e) => handleSetCanEdit(e.target.checked, row?.alias)}
          />
        );
      },
    },

    {
      title: "Approve",
      //   dataIndex: "approve",
      key: "approve",
      render: (_, row) => {
        return (
          <Checkbox
            disabled={canNotEdit}
            defaultChecked={row?.approve}
            onChange={(e) => handleSetCanApprove(e.target.checked, row?.alias)}
          />
        );
      },
    },
  ];
  const data = [
    {
      key: "1",
      module: "Requests",
      alias: "Requests",
      view: canViewRequests,
      create: canCreateRequests,
      edit: canEditRequests,
      approve: canApproveRequests,
      placeholder: "Initiate the purchase requisition process"
    },
    {
      key: "2",
      module: "Payment Requests",
      alias: "PaymentRequests",
      view: canViewPaymentRequests,
      create: canCreatePaymentRequests,
      edit: canEditPaymentRequests,
      approve: canApprovePaymentRequests,
      placeholder: "Request for payment for services rendered or items purchased"
    },
    {
      key: "3",
      module: "Tenders",
      alias: "Tenders",
      view: canViewTenders,
      create: canCreateTenders,
      edit: canEditTenders,
      approve: canApproveTenders,
      placeholder: "Issue and track tender notices to find qualified vendors"
    },
    {
      key: "4",
      module: "Bids",
      alias: "Bids",
      view: canViewBids,
      create: canCreateBids,
      edit: canEditBids,
      approve: canApproveBids,
      placeholder: "Review expression of interest from vendors"
    },
    {
      key: "5",
      module: "Contracts",
      alias: "Contracts",
      view: canViewContracts,
      create: canCreateContracts,
      edit: canEditContracts,
      approve: canApproveContracts,
      placeholder: "Manage the contracting process for selected vendors"
    },
    {
      key: "6",
      module: "Purchase Orders",
      alias: "PurchaseOrders",
      view: canViewPurchaseOrders,
      create: canCreatePurchaseOrders,
      edit: canEditPurchaseOrders,
      approve: canApprovePurchaseOrders,
      placeholder: "Place your orders for items and services needed"
    },
    {
      key: "7",
      module: "Vendors",
      alias: "Vendors",
      view: canViewVendors,
      create: canCreateVendors,
      edit: canEditVendors,
      approve: canApproveVendors,
      placeholder: "Manage vendor profile data and access permissions"
    },
    {
      key: "8",
      module: "Users",
      alias: "Users",
      view: canViewUsers,
      create: canCreateUsers,
      edit: canEditUsers,
      approve: canApproveUsers,
      placeholder: "Onboard internal users, manage their profile data and access permissions"
    },
    {
      key: "9",
      module: "Dashboard",
      alias: "Dashboard",
      view: canViewDashboard,
      create: canCreateDashboard,
      edit: canEditDashboard,
      approve: canApproveDashboard,
      placeholder: "View aggregated data and reports on the procurement process"
    },
  ];

  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };
  
  return (
    <div className="flex flex-col gap-5">
      {/* {(pathname != '/system/profile' || !pathname.startsWith('/system/users')) && <h5 className="text-[25px] text-[#FFF] my-0">Overview</h5>} */}
      <div className={`bg-white ${pathname != '/system/profile' ? 'rounded-lg' : 'rounded-lg'} px-5 pb-10`}>
        <h6 className="mb-3 pb-0 text-[15px] text-[#263238]">Module access permissions</h6>
        <small className="text-[#95A1B3] text-[14px]">Control user access to specific modules within the application. Define who can view, edit, or manage each module to maintain security and streamline workflow.</small>
        <div className="grid grid-cols-2 md:pr-10 border-b-2 border-x-0 border-t-0 border-red-500">
          <h6 className="text-[13px] text-[#707C95]">Module</h6>
          <div className="flex items-center justify-between">
            <h6 className="text-[13px] text-[#707C95]">View</h6>
            <h6 className="text-[13px] text-[#707C95]">Create</h6>
            <h6 className="text-[13px] text-[#707C95]">Edit</h6>
            <h6 className="text-[13px] text-[#707C95]">Approve</h6>
          </div>
        </div>
        {data && data.map((item, key) => (
          <div className="grid grid-cols-2 md:pr-10 border-b-2 border-x-0 border-t-0 border-red-500">
            <div className="my-2">
              <h6 className="text-[13px] text-[#707C95] my-2">{item.module == 'Requests' ? 'Purchase Requests' : item.module}</h6>
              <small className="text-[12px] text-[#95A1B3]">{item.placeholder}</small>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[13px] text-[#707C95] permission my-5">
                <Switch disabled={canNotEdit} checked={item?.view} onChange={(checked) => {handleSetCanView(checked, item?.alias)}} />
              </div>
              <div className="text-[13px] text-[#707C95] permission my-5">
                <Switch disabled={canNotEdit} checked={item?.create} onChange={(checked) => {handleSetCanCreated(checked, item?.alias)}} />
              </div>
              <div className="text-[13px] text-[#707C95] permission my-5">
                
                <Switch disabled={canNotEdit} checked={item?.edit} onChange={(checked) => {handleSetCanEdit(checked, item?.alias)}} />
              </div>
              <div className="text-[13px] text-[#707C95] permission my-5">
                
                <Switch disabled={canNotEdit} checked={item?.approve} onChange={(checked) => {handleSetCanApprove(checked, item?.alias)}} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    // <Table
    //   columns={columns}
    //   className="shadow-md rounded"
    //   dataSource={data}
    //   size="small"
    //   pagination={false}
    // />
  );
}
export default PermissionsTable;
