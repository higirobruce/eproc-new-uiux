'use client'

import { useEffect, useState } from "react";

const useRouting = (model) => {
  // const routingMap = {

  // }

  const [routingMap, setRoutingMap] = useState({
    'request': { page: 1, filter: "all" },
    "payment-request": { page: 1, filter: "all" },
  });
  
  const handleRouteFilter = (filter) => {
    const newData = {...routingMap};

    newData[model].filter = filter
    setRoutingMap(newData);
  };

  const handleRoutePage = (page) => {
    const newData = {...routingMap};

    newData[model].page = page
    setRoutingMap(newData);
  };


  return { routing: routingMap, handleRouteFilter, handleRoutePage };
};

export default useRouting;
