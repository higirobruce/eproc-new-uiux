"use client";
import { Button, Collapse, Layout, Typography } from "antd";
import Head from "next/head";
import Image from "next/image";
import Router from "next/router";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getIpAddress } from "./helpers/rtc";

export default function PublicPortal() {
  let router = useRouter();
  let [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);
  return (
    <>
      <Head>
        <title>EPROC</title>
        <meta name="description" content="the #1 e-procurement tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>

      <main className="overflow-x-hidden bg-white flex flex-col h-screen">
        {loaded && (
          <Layout className="bg-white">
            <div className="bg-[#0065DD] pb-10">
              <div className="flex flex-row justify-between items-center py-5">
                <div className="pl-28">
                  <Image
                    src="/favicon.png"
                    className="text-blue-500"
                    width={80}
                    height={80}
                  />
                </div>
                <div className="flex flex-row space-x-12 items-center mr-44">
                  <Link
                    href="https://irembo.com/about/"
                    className="text-white text-[17px] font-semibold"
                    target="_blank"
                  >
                    About Us
                  </Link>
                  <Link
                    href="#howItWorks"
                    className="text-white text-[17px] font-semibold"
                  >
                    How it works
                  </Link>
                  <Button
                    type="link"
                    className="text-white text-[17px] font-semibold"
                    onClick={() => router.push("/auth/signup")}
                  >
                    Register
                  </Button>
                  <button
                    className="cursor-pointer bg-white px-7 py-2.5 rounded font-semibold text-[#0063CF] border-none text-[15px]"
                    onClick={() => router.push("/auth")}
                  >
                    Log In
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 w-[calc(100%-200px)] pl-10">
                <div className="col-span-2 ml-20 flex flex-col justify-center">
                  <div className="text-[22px] text-white my-4">
                    Welcome to Irembo Procure!
                  </div>
                  <div className="text-[40px] text-white font-bold my-4">
                    Irembo Procure. Procurement made easy.
                  </div>
                  <p className="text-[20px] text-white leading-10 mt-10">
                    {`A platform that supports Irembo's procurement activities by
                    enabling more effective ways to onboard and collaborate with
                    local and international vendors throughout the procurement
                    lifecycle. In turn, vendors looking to do business with
                    Irembo gain access to business opportunities.`}
                  </p>

                  <div className="flex items-center gap-x-7 pt-10">
                    <button
                      className="cursor-pointer bg-white px-7 py-3 rounded font-semibold text-[#0063CF] border-none text-[16px]"
                      onClick={() => router.push("/auth/signup")}
                    >
                      Create account
                    </button>
                    <small className="text-white text-[17px] font-semibold">
                      Or
                    </small>

                    <Link
                      href={"/auth"}
                      className="text-white text-[19px] font-medium underline"
                    >
                      Sign in with existing account
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col justify-center ml-48">
                  <Image
                    src="/Business deal-cuate.svg"
                    width={600}
                    height={540}
                  />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col">
              {/* Head */}

              <div
                id="howItWorks"
                className="bg-white text-gray-700 flex flex-col items-center justify-center py-10 space-y-10"
              >
                <div className="text-[44px] text-[#121313] mt-5">
                  How it Works
                </div>
                <div className="flex flex-col gap-y-5 lg:max-w-[calc(100%-700px)] md:max-w-[calc(100%-600px)]">
                  <div className="flex justify-between items-center gap-x-36">
                    <Image src={"/join.svg"} width={400} height={400} />
                    <div>
                      <h6 className="text-[17px] font-bold text-[#3F3D56] mb-0">
                        Join the Irembo Vendor Network
                      </h6>
                      <p className="text-[#999b9c] text-[18px] font-thin leading-9">
                        Create your account in minutes with basic information
                        and let us know about your area of expertise. We will
                        review your details to ensure you meet our vendor
                        criteria and grant you platform access. Once approved,
                        we will keep you informed via email about tenders and
                        opportunities matching your areas of expertise.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-x-36">
                    <div>
                      <h6 className="text-[17px] font-bold text-[#00CEB2] mb-0">
                        Effortless Bidding and Collaboration
                      </h6>
                      <p className="text-[#999b9c] text-[18px] font-thin leading-9">
                        Browse available tenders directly on the platform and
                        get instant notifications for relevant updates. Submit
                        your bids electronically within the platform, directly
                        connecting you with Irembo's procurement team. We'll
                        keep you informed every step of the way, notifying you
                        of bid status and providing timely feedback from our
                        team.
                      </p>
                    </div>
                    <Image src={"/Effort.svg"} width={400} height={400} />
                  </div>
                  <div className="flex justify-between items-center gap-x-36">
                    <Image src={"/contracts.svg"} width={400} height={400} />
                    <div>
                      <h6 className="text-[17px] font-bold text-[#0063CF] mb-0">
                        Secure Contracting and Payment
                      </h6>
                      <p className="text-[#999b9c] text-[18px] font-thin leading-9">
                        If selected, you'll receive contracting documents
                        (contracts or purchase orders) electronically. Review
                        and sign them directly on the platform. Once signed,
                        focus on delivering the requested goods or services with
                        confidence. Submit your invoices seamlessly through the
                        platform, and we'll process them efficiently according
                        to the timelines established in the contracting
                        agreements.
                      </p>
                    </div>
                  </div>
                </div>
                {/* <div>
                  <div className="grid grid-cols-4 gap-10">
                    {card(
                      `Step 1`,
                      `Register to get access to available opportunities`
                    )}
                    {card(
                      `Step 2`,
                      `When new relevant tender notices are posted, get notified instantly via email`
                    )}
                    {card(
                      `Step 3`,
                      `Log in to submit your bid for each opportunity of
                    interest`
                    )}
                    {card(
                      `Step 4`,
                      `Received feedback on your bid. If selected as a supplier,
                    deliver the requested goods or services`
                    )}
                  </div>
                </div> */}
              </div>

              <div className="bg-[#FAFAFA] flex flex-col items-center justify-center py-14 mt-5 space-y-10">
                <div className="text-[36px] text-[#121313]">Frequently Asked Questions</div>
                <Collapse className="w-3/4" defaultActiveKey={["1"]} accordion>
                  <Collapse.Panel
                    header="Registration"
                    key="1"
                  >
                    <Collapse>
                      <Collapse.Panel
                        header="What documentation do I need to register? "
                        key="1"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; You'll need basic information like company details, contact information, and proof of business registration.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="How long does registration take? "
                        key="2"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; The registration process is quick and takes just a few minutes. Our team will then review your application and grant you access within 3-5 business days, if you meet our vendor criteria.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="What happens if my application is rejected? "
                        key="3"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; If your application doesn't meet our vendor criteria, we'll provide you with feedback.</small> 
                        
                      </Collapse.Panel>
                    </Collapse>
                  </Collapse.Panel>
                  <Collapse.Panel
                    header="Opportunities"
                    key="2"
                  >
                    <Collapse>
                      <Collapse.Panel
                        header="How do I find relevant opportunities?"
                        key="1"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; You'll need basic information like company details, contact information, and proof of business registration.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="Are there any fees associated with participating in tenders? "
                        key="2"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; No, registration and participation in tenders are completely free for vendors.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="How much notice will I have to submit a bid? "
                        key="3"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; The deadline for each tender will be clearly stated in the tender notice. We recommend reviewing opportunities early to ensure you have enough time to prepare your bid.</small> 
                        
                      </Collapse.Panel>
                    </Collapse>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="Bidding & Feedback"
                    key="3"
                  >
                    <Collapse>
                      <Collapse.Panel
                        header="Can I submit bids electronically?"
                        key="1"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; Yes, all bids must be submitted electronically through the platform.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="How will I receive feedback on my bid? "
                        key="2"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; You'll receive email notifications about your bid status and feedback from Irembo's procurement team.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="What happens if my bid is not selected? "
                        key="3"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; We'll provide you with feedback on why your bid was not selected and encourage you to apply for future opportunities.</small> 
                        
                      </Collapse.Panel>
                    </Collapse>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="Contracting & Payment"
                    key="4"
                  >
                    <Collapse>
                      <Collapse.Panel
                        header="How long does it take to receive payment?"
                        key="1"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; Payments are processed according to the timelines established in the contracting agreements, typically within 30-60 days of invoice submission.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="Who can I contact if I have questions about a contract?  "
                        key="2"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; You can contact the Irembo procurement team by email - <a className="underline text-[#00CEB2]" href="mailto:procurement@irembo.com" >procurement@irembo.com</a> </small> 
                      </Collapse.Panel>
                    </Collapse>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="Additional Questions"
                    key="5"
                  >
                    <Collapse>
                      <Collapse.Panel
                        header="What support is available for using the platform? "
                        key="1"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; Should you have any questions, please reach out to our team at <a className="underline text-[#00CEB2]" href="mailto:procurement@irembo.com" >procurement@irembo.com</a>.</small> 
                        
                      </Collapse.Panel>
                      <Collapse.Panel
                        header="Where can I learn more about Irembo? "
                        key="2"
                      > 
                        <small className="text-[18px] text-[#0063CF] leading-10"><small className="text-gray-400">Ansr: </small> &nbsp; You can visit our <a className="underline text-[#00CEB2]" href="https://irembo.com/about/" target="_blank" >website</a> or contact us directly for more information about Irembo and its activities. </small> 
                        
                      </Collapse.Panel>
                    </Collapse>
                  </Collapse.Panel>

                </Collapse>
              </div>
            </div>
          </Layout>
        )}
      </main>
    </>
  );

  function card(step, content) {
    return (
      <div className="bg-gray-50 rounded shadow text-gray-700 h-[200px] w-[300px] flex items-center p-5 justify-center">
        <div className="flex flex-col space-y-2 justify-center items-center">
          <Typography.Text className="text-md font-semibold">
            {step}
          </Typography.Text>
          <Typography.Text className="text-md">{content}</Typography.Text>
        </div>
      </div>
    );
  }
}
