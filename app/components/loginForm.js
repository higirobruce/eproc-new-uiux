"use client";
import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { decode as base64_decode, encode as base64_encode } from "base-64";
import {
  AutoComplete,
  Button,
  Cascader,
  Checkbox,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Skeleton,
  Spin,
  Typography,
  message,
} from "antd";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import * as jose from "jose";
import * as jwt_decode from "jwt-decode";
import { useUser } from "../context/UserContext";

const { Title } = Typography;
const { Option } = Select;
const residences = [
  {
    value: "zhejiang",
    label: "Zhejiang",
    children: [
      {
        value: "hangzhou",
        label: "Hangzhou",
        children: [
          {
            value: "xihu",
            label: "West Lake",
          },
        ],
      },
    ],
  },
  {
    value: "jiangsu",
    label: "Jiangsu",
    children: [
      {
        value: "nanjing",
        label: "Nanjing",
        children: [
          {
            value: "zhonghuamen",
            label: "Zhong Hua Men",
          },
        ],
      },
    ],
  },
];

let SALT =
  process.env.NEXT_PUBLIC_TOKEN_SALT || "968d8b95-72cd-4470-b13e-1017138d32cf";

const LoginForm = ({ goTo }) => {
  const { user, login, logout } = useUser();
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let router = useRouter();

  let searchParams = useSearchParams();

  const [messageApi, contextHolder] = message.useMessage();
  let [loaded, setLoaded] = useState(false);
  let [submitting, setSubmitting] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);

  const [form] = Form.useForm();

  const onFinish = (values) => {
    setSubmitting(true);

    fetch(`${url}/users/login`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password,
      }),
    })
      .then((res) => res.json())
      .then(async (res) => {
        const secret = new TextEncoder().encode(SALT);
        const jwt = res.token;
        // const { payload, protectedHeader } = await jose.jwtVerify(jwt, secret);
        const payload = jwt_decode.jwtDecode(jwt);

        if (payload.allowed) {
          if (payload.userObj.status === "approved") {
            messageApi.open({
              type: "success",
              content: "Success!!",
            });
            login(payload.userObj);
            // localStorage.setItem("user", JSON.stringify(payload.userObj));
            localStorage.setItem("token", res?.token);
            goTo
              ? router.push(`${goTo}`)
              : router.push(
                  `${
                    payload.userObj?.userType === "VENDOR"
                      ? "/system/tenders"
                      : "/system/dashboard"
                  }`
                );
            setSubmitting(false);
          } else {
            messageApi.open({
              type: "error",
              content:
                "You do not have the required permissions to access this system. Please contact the system admin to request access.",
            });
            setSubmitting(false);
          }
        } else {
          setSubmitting(false);
          messageApi.open({
            type: "error",
            content: "Please check email and password!",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });

    // setTimeout(()=>{
    //   Router.push('/mainPage').then(()=>{
    //     setSubmitting(false)
    //   })
    // },3000)
  };

  const resetPassword = (values) => {
    setSubmitting(true);

    fetch(`${url}/users/recoverPassword/${values.email}`, {
      method: "PUT",
      headers: {
        Authorization:
          "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({
      //   email: values.email,
      //   password: values.password,
      // }),
    })
      .then((res) => res.json())
      .then((res) => {
        messageApi.open({
          type: "success",
          content: "Success!!",
        });
        login(res)
        setSubmitting(false);
        setForgotPassword(false);
      })
      .catch((err) => {
        console.log(err);
        setSubmitting(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });

    // setTimeout(()=>{
    //   Router.push('/mainPage').then(()=>{
    //     setSubmitting(false)
    //   })
    // },3000)
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    let sessionExpired = searchParams.get("sessionExpired");
    if (sessionExpired == true || sessionExpired === "true") {
      messageApi.info("Session has expired! Please login again!");
    }
    setLoaded(true);
  }, []);

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select style={{ width: 100 }}>
        <Option value="+250">+250</Option>
        <Option value="+254">+254</Option>
      </Select>
    </Form.Item>
  );

  const formItemLayout = {};
  const tailFormItemLayout = {
    // wrapperCol: {
    //   xs: {
    //     span: 24,
    //     offset: 0,
    //   },
    //   sm: {
    //     span: 16,
    //     offset: 8,
    //   },
    // },
  };

  const [autoCompleteResult, setAutoCompleteResult] = useState([]);

  const onWebsiteChange = (value) => {
    if (!value) {
      setAutoCompleteResult([]);
    } else {
      setAutoCompleteResult(
        [".com", ".org", ".net"].map((domain) => `${value}${domain}`)
      );
    }
  };

  const websiteOptions = autoCompleteResult.map((website) => ({
    label: website,
    value: website,
  }));

  return (
    <div>
      {contextHolder}
      {loaded ? (
        <div className="flex flex-col items-center justify-center rounded md:pr-20">
          {!forgotPassword && (
            <>
              <Form
                {...formItemLayout}
                form={form}
                name="register"
                onFinish={onFinish}
                initialValues={{
                  residence: ["zhejiang", "hangzhou", "xihu"],
                  firstName: "",
                  prefix: "+250",
                  email: "",
                }}
                scrollToFirstError
                style={{ width: "100%" }}
              >
                <Row className="flex flex-col items-center justify-between pb-5">
                  <div className="flex flex-row items-center">
                    {/* <div>
                  <Image
                    alt=""
                    className="pt-3"
                    src="/icons/blue icon.png"
                    width={43}
                    height={40}
                  />{" "}
                </div>
                <div className="font-bold text-lg">Irembo Procure</div> */}
                  </div>
                </Row>
                <h1 className="mb-10  text-[#0063CF]">Log In</h1>
                <div>
                  <div>Email</div>
                  <Form.Item
                    name="email"
                    // label="E-mail"
                    rules={[
                      {
                        type: "email",
                        message: "The input is not valid E-mail!",
                      },
                      {
                        required: true,
                        message: "Please input your E-mail!",
                      },
                    ]}
                  >
                    <Input placeholder="Your email" className="h-11 my-3" />
                  </Form.Item>
                </div>

                <div>
                  <div>Password</div>
                  <Form.Item
                    name="password"
                    // label="Password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your password!",
                      },
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      placeholder="* * * * * * * *"
                      className="h-11 my-3"
                    />
                  </Form.Item>
                </div>

                <Form.Item {...tailFormItemLayout}>
                  {submitting ? (
                    <Spin indicator={antIcon} />
                  ) : (
                    <div className="flex flex-row items-center justify-between">
                      <Button
                        type="link"
                        onClick={() => setForgotPassword(true)}
                      >
                        Forgot Password?
                      </Button>
                      <Button
                        htmlType="submit"
                        className="bg-[#0065DD] pt-1 px-10 text-white h-10 font-semibold"
                      >
                        Log in
                      </Button>
                    </div>
                  )}
                </Form.Item>
              </Form>

              <div className="flex flex-row space-x-2 self-center mt-10">
                <Typography.Link
                  className="underline"
                  onClick={() => router.push("/auth/signup")}
                >
                  Join as new user ?
                </Typography.Link>
              </div>
            </>
          )}

          {forgotPassword && (
            <>
              <Form
                {...formItemLayout}
                form={form}
                name="reset"
                onFinish={resetPassword}
                scrollToFirstError
                style={{ width: "100%" }}
              >
                <Row className="flex flex-col items-center justify-between pb-5">
                  <div className="flex flex-row items-center">
                    {/* <div>
                  <Image
                    alt=""
                    className="pt-3"
                    src="/icons/blue icon.png"
                    width={43}
                    height={40}
                  />{" "}
                </div>
                <div className="font-bold text-lg">Irembo Procure</div> */}
                  </div>
                  <Typography.Title className="" level={3}>
                    Reset Password
                  </Typography.Title>
                </Row>

                <div>
                  <label className="text-[12px] text-[#6A757B]">Email</label>
                  <Form.Item
                    name="email"
                    // label="E-mail"
                    rules={[
                      {
                        type: "email",
                        message: "The input is not valid E-mail!",
                      },
                      {
                        required: true,
                        message: "Please input your E-mail!",
                      },
                    ]}
                  >
                    <Input className="h-11 my-3" />
                  </Form.Item>
                </div>

                <Form.Item {...tailFormItemLayout}>
                  {submitting ? (
                    <Spin indicator={antIcon} />
                  ) : (
                    <div className="flex flex-row items-center justify-between">
                      <Button type="default" htmlType="submit">
                        Send me reset token
                      </Button>

                      <Button
                        type="link"
                        onClick={() => setForgotPassword(false)}
                      >
                        Back to Login
                      </Button>
                    </div>
                  )}
                </Form.Item>
              </Form>
            </>
          )}
        </div>
      ) : (
        <Skeleton />
      )}
    </div>
  );
};

export default LoginForm;
