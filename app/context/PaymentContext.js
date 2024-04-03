// context.js
import React, { createContext, useState } from 'react';

// Create a context object
const PaymentContext = createContext();

// Create a provider component
export const PaymentProvider = ({ children }) => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  return (
    <PaymentContext.Provider value={{ page, setPage, filter, setFilter }}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to consume the context
export const usePaymentContext = () => React.useContext(PaymentContext);