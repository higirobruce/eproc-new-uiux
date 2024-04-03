// context.js
import React, { createContext, useState } from 'react';

// Create a context object
const VendorContext = createContext();

// Create a provider component
export const VendorProvider = ({ children }) => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  return (
    <VendorContext.Provider value={{ page, setPage, filter, setFilter }}>
      {children}
    </VendorContext.Provider>
  );
};

// Custom hook to consume the context
export const useVendorContext = () => React.useContext(VendorContext);