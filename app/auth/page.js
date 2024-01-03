"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import LoginForm from "../components/loginForm";
import LoginText from "../components/loginText";
import { getIpAddress } from "../helpers/rtc";
import Login from "@/public/login.svg";
import Image from 'next/image';
import Logo from '@/public/Logo.png';

export default function LoginPage() {
  const searchParams = useSearchParams()
  console.log(searchParams.get('goTo'))
  return (
    // <div className="grid md:grid-cols-3 bg-blue-500 text-white -m-4">
    //   <LoginText />

    //   <div>
    //     {" "}
    //     <LoginForm goTo={searchParams.get('goTo')}/>
    //   </div>
    // </div>
    <main className="overflow-hidden h-screen mb-10">
      <div className="grid lg:grid-cols-2 p-10 ml-20 h-[calc(100%-60px)]">
        <div className="my-20 flex flex-col justify-between">
          <Image src={Logo} alt="" className="w-[180px] h-auto" />
          <LoginForm goTo={searchParams.get('goTo')}/>
          <div />
        </div>
        <div className="bg-[#0065DD] h-full rounded-lg text-center lg:flex flex-col hidden justify-center items-center">
          <Image src={Login} className="xl:w-[calc(100%-350px)] md:w-[calc(100%-180px)] h-auto" />
          <h1 className="text-white text-[36px] mb-0 font-bold">Welcome Back!</h1>
          <p className="text-white xl:mx-0 mx-5"><small className="text-[17px] leading-8">A tool that aims to simplify the procurement process for suppliers <br /> looking to work with Irembo.</small></p>
        </div>
      </div>
    </main>
  );
}
