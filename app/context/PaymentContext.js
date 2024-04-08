// context.js
import React, { createContext, useState } from 'react';
import { useUser } from './UserContext';

// Create a context object
const PaymentContext = createContext();

// Create a provider component
export const PaymentProvider = ({ children }) => {
  const {user} = useUser()
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [userPendingRequest, setUserPendingRequest] = useState(false);
  const [userRequest, setUserRequest] = useState(!user?.permissions?.canApproveAsHof &&
    !user?.permissions?.canApproveAsPM &&
    !user?.permissions?.canApproveAsHod
    ? true
    : false);

  return (
    <PaymentContext.Provider value={{ page, setPage, filter, setFilter, userPendingRequest, setUserPendingRequest, userRequest, setUserRequest }}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to consume the context
export const usePaymentContext = () => React.useContext(PaymentContext);