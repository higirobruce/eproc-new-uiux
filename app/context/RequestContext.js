// context.js
import React, { createContext, useState } from 'react';

// Create a context object
const RequestContext = createContext();

// Create a provider component
export const RequestProvider = ({ children }) => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");

  return (
    <RequestContext.Provider value={{ page, setPage, filter, setFilter }}>
      {children}
    </RequestContext.Provider>
  );
};

// Custom hook to consume the context
export const useRequestContext = () => React.useContext(RequestContext);