'use client'
import { Button, Collapse, Layout, Typography } from "antd";
import Head from "next/head";
import Image from "next/image";
import Router from "next/router";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getIpAddress } from "./helpers/rtc";

export default function PublicPortal() {
  let router = useRouter()
  let [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true)
  }, []);
  return (
    <>
      <Head>
        <title>EPROC</title>
        <meta name="description" content="the #1 e-procurement tool" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main className="overflow-hidden bg-white flex flex-col h-screen">
        {loaded && (
          <Layout className="bg-white">
            <div className="flex flex-row justify-between items-center p-5">
              <div>
                <Image
                  src="/favicon.png"
                  className="text-blue-500"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex flex-row space-x-10 items-center">
                <Link href='https://irembo.com/about/' target="_blank">About Us</Link>
                <Link href='#howItWorks'>How it works</Link>
                <Button type="link" onClick={() => router.push("/auth/signup")}>
                  Register
                </Button>
                <Button type="primary" onClick={() => router.push("/auth")}>
                  SIGN IN
                </Button>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col">
              {/* Head */}
              <div className="grid grid-cols-2 flex-1 px-10 ">
                <div className="flex flex-col justify-center">
                  <Typography.Title level={2}>Irembo Procure</Typography.Title>
                  <Typography.Title level={4}>
                    Procurement made easy
                  </Typography.Title>
                  <Typography.Text>
                    {`A platform that supports Irembo's procurement activities by
                    enabling more effective ways to onboard and collaborate with
                    local and international vendors throughout the procurement
                    lifecycle. In turn, vendors looking to do business with
                    Irembo gain access to business opportunities.`}
                  </Typography.Text>

                  <div className="pt-10">
                    <Button type="primary" onClick={() => router.push("/auth")}>
                      SIGN IN
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <Image
                    src="/Business deal-cuate.svg"
                    width={600}
                    height={600}
                  />
                </div>
              </div>

              <div id="howItWorks" className="bg-white text-gray-700 flex flex-col items-center justify-center py-10 space-y-10">
                <div className="text-2xl">How it works for suppliers</div>
                <div>
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
                </div>
              </div>

              <div className="bg-white flex flex-col items-center justify-center py-20 space-y-10">
                <div className="text-2xl">Frequently Asked Questions</div>
                <Collapse className="w-2/3" defaultActiveKey={["1"]} accordion>
                  <Collapse.Panel
                    header="How do I access available opportunities?"
                    key="1"
                  >
                    <ul>
                      <li>
                        First, you will need to register on the portal. To
                        complete this process,{" "}
                        {
                          <Typography.Link
                            onClick={() => router.push("/auth/signup")}
                          >
                            click here
                          </Typography.Link>
                        }
                      </li>
                      <li>
                        Our team will then review and confirm your registration
                        information before granting you access to the platform
                      </li>
                      <li>
                        If approved to join Irembo’s pool of suppliers, login
                        using your registered email address and password
                      </li>
                    </ul>
                  </Collapse.Panel>
                  <Collapse.Panel
                    header="Do I need to be registered on the portal to get access to opportunities?"
                    key="2"
                  >
                    <p>
                      Yes - you will first need to register an account and be
                      granted access to the portal by our team
                    </p>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="Who do I contact for general technical support?"
                    key="3"
                  >
                    <p>
                      Email our team at <i>procurement@irembo.com</i>.
                    </p>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="Who do I contact for questions related to posted opportunities?"
                    key="4"
                  >
                    <p>
                      As we strive to provide all necessary information to our
                      vendors to facilitate the bidding process, we encourage
                      you to first review all supporting documents available on
                      the tender notices. For any clarifications that may be
                      needed, contact us at <i>procurement@irembo.com</i>.
                    </p>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="How will I get feedback on my submitted bids and/or tender award results?"
                    key="5"
                  >
                    <p>
                      Tender award results will be communicated via email once
                      the bids review process is complete.
                    </p>
                  </Collapse.Panel>

                  <Collapse.Panel
                    header="What if I forgot my username and/or password?"
                    key="6"
                  >
                    <p>
                      If you no longer remember the email or password
                      registered, simply select <b>Forgot password</b> on the
                      portal login page and follow through the indicated series
                      of steps to recover your account.
                    </p>
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
