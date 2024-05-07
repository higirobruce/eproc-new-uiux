'use client'
import React, { useState } from "react";

function page() {
  const [tab, setTab] = useState(0);
  return (
    <div className="request mr-6 bg-white h-[calc(100vh-81px)] rounded-lg mb-10 px-5 overflow-y-auto">
      <div className="mt-5 flex justify-between w-full">
        <div>
          {/* <small className="text-[#97ABCA] text-[10px]">Overview</small> */}
          <h5 className="text-[#12263F] text-[22px] mb-2 mx-0 mt-0">
            Masterdata
          </h5>
        </div>
      </div>
      <div className="bg-white py-3 rounded my-1">
        <div className="flex items-center gap-x-14 px-5 bg-[#F5F5F5]">
          <button
            className={`bg-transparent py-3 my-3 ${
              tab == 0
                ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                : `border-none text-[#8392AB]`
            } text-[14px] cursor-pointer`}
            onClick={() => setTab(0)}
          >
            Dapartments
          </button>
          <button
            className={`bg-transparent py-3 my-3 ${
              tab == 1
                ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                : `border-none text-[#8392AB]`
            } text-[14px] cursor-pointer`}
            onClick={() => setTab(1)}
          >
            Budget Lines
          </button>
          <button
            className={`bg-transparent py-3 my-3 ${
              tab == 2
                ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                : `border-none text-[#8392AB]`
            } text-[14px] cursor-pointer`}
            onClick={() => setTab(2)}
          >
            Service Categories
          </button>

          <button
            className={`bg-transparent py-3 my-3 ${
              tab == 3
                ? `border-b-2 border-[#1677FF] border-x-0 border-t-0 text-[#263238] px-4`
                : `border-none text-[#8392AB]`
            } text-[14px] cursor-pointer`}
            onClick={() => setTab(3)}
          >
            Currencies
          </button>
        </div>
      </div>
    </div>
  );
}

export default page;
