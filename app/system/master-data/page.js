"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { encode } from "base-64";
import { Card } from "antd";

let url = process.env.NEXT_PUBLIC_BKEND_URL;
let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;

async function getAllDepartments(router) {
  const res = await fetch(`${url}/masterData/departments/`, {
    headers: {
      Authorization: "Basic " + `${encode(`${apiUsername}:${apiPassword}`)}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    alert(JSON.stringify(res));
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/auth");
    }
    // This will activate the closest `error.js` Error Boundary
    // console.log(id);
    return null;
    // throw new Error("Failed to fetch data");
  }
  // console.log(res.json())
  return res.json();
}

function page() {
  const [tab, setTab] = useState(0);
  let token = typeof window !== "undefined" && localStorage.getItem("token");
  let router = useRouter();
  let [list, setList] = useState([]);

  useEffect(() => {
    getAllDepartments(router).then((res) => {
      setList(res);
    });
  }, []);

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
      <div>
        {list && (
          <div className="grid md:grid-cols-3 gap-3">
            {list.map((l) => {
              return (
                <Card className="shadow">
                  <Card.Meta
                    // avatar={<Avatar src="https://joesch.moe/api/v1/random?key=1" />}
                    title={l.description}
                    // description={
                    //   <div
                    //     className={`flex flex-row items-center justify-between text-blue-400`}
                    //   >
                    //     <div>{icon}</div>
                    //     <div className="text-xl">{count.toLocaleString()}</div>
                    //   </div>
                    // }
                  />
                  {/* <Statistic
            title={title}
            value={count}
            valueStyle={{
              color: "#2299FF",
            }}
          /> */}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default page;
