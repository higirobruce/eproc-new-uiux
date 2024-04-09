// context.js
import React, { createContext, useState } from 'react';
import { useUser } from './UserContext';

// Create a context object
const RequestContext = createContext();

// Create a provider component
export const RequestProvider = ({ children }) => {
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
    <RequestContext.Provider value={{ page, setPage, filter, setFilter, userPendingRequest, setUserPendingRequest, userRequest, setUserRequest }}>
      {children}
    </RequestContext.Provider>
  );
};

// Custom hook to consume the context
export const useRequestContext = () => React.useContext(RequestContext);