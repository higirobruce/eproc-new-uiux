import { DollarOutlined, FileDoneOutlined, MessageOutlined, OrderedListOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";

export const formatAmount = (value) => {
  if (value >= 1000000000000) {
    return Math.round(value / 1000000000000) + "T";
  }
  else if (value >= 1000000000) {
    return Math.round(value / 1000000000) + "B";
  }
  else if (value >= 1000000) {
    return Math.round(value / 1000000) + "M";
  } else if (value >= 1000) {
    return Math.round(value / 1000) + "K";
  } else {
    return value?.toString();
  }
};

export const activityUser = {
  'users': {path: '/system/users', icon: <UserOutlined size={24} className="text-[#01AF65]" />},
  'vendors': {path: '/system/vendors', icon: <UserOutlined size={24} className="text-[#01AF65]" />},
  'requests': {path: '/system/requests', icon: <SolutionOutlined size={24} className="text-[#01AF65]" />},
  'tenders': {path: '/system/tenders', icon: <MessageOutlined size={24} className="text-[#01AF65]" />},
  'contracts': {path: '/system/contracts', icon: <FileDoneOutlined size={24} className="text-[#01AF65]" />},
  'purchase-orders': {path: '/system/purchase-orders', icon: <OrderedListOutlined size={24} className="text-[#01AF65]" />},
  'payment-requests': {path: '/system/payment-requests', icon: <DollarOutlined size={24} className="text-[#01AF65]" />},
}