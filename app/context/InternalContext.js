// context.js
import React, { createContext, useState } from 'react';

// Create a context object
const InternalContext = createContext();

// Create a provider component
export const InternalProvider = ({ children }) => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  return (
    <InternalContext.Provider value={{ page, setPage, filter, setFilter }}>
      {children}
    </InternalContext.Provider>
  );
};

// Custom hook to consume the context
export const useInternalContext = () => React.useContext(InternalContext);