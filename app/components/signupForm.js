"use client";
import React, { useEffect, useState } from "react";
import {
  LoadingOutlined,
  QuestionCircleOutlined,
  StarFilled,
} from "@ant-design/icons";
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
  Tooltip,
} from "antd";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import UploadRDCerts from "./uploadRDBCerts";
import { v4 } from "uuid";
import UploadVatCerts from "./uploadVatCerts";
import { decode as base64_decode, encode as base64_encode } from "base-64";
import Login from "@/public/login.svg";
import LoginForm from "./loginForm";
import Link from "next/link";
import Logo from "@/public/Logo.png";
import * as _ from "lodash";

const { Option } = Select;

let countries = [
  {
    name: "Afghanistan",
    dial_code: "+93",
    code: "AF",
    emoji: "🇦🇫",
  },
  {
    name: "Aland Islands",
    dial_code: "+358",
    code: "AX",
    emoji: "🇦🇽",
  },
  {
    name: "Albania",
    dial_code: "+355",
    code: "AL",
    emoji: "🇦🇱",
  },
  {
    name: "Algeria",
    dial_code: "+213",
    code: "DZ",
    emoji: "🇩🇿",
  },
  {
    name: "AmericanSamoa",
    dial_code: "+1684",
    code: "AS",
    emoji: "🇦🇸",
  },
  {
    name: "Andorra",
    dial_code: "+376",
    code: "AD",
    emoji: "🇦🇩",
  },
  {
    name: "Angola",
    dial_code: "+244",
    code: "AO",
    emoji: "🇦🇴",
  },
  {
    name: "Anguilla",
    dial_code: "+1264",
    code: "AI",
    emoji: "🇦🇮",
  },
  {
    name: "Antarctica",
    dial_code: "+672",
    code: "AQ",
    emoji: "🇦🇶",
  },
  {
    name: "Antigua and Barbuda",
    dial_code: "+1268",
    code: "AG",
    emoji: "🇦🇬",
  },
  {
    name: "Argentina",
    dial_code: "+54",
    code: "AR",
    emoji: "🇦🇷",
  },
  {
    name: "Armenia",
    dial_code: "+374",
    code: "AM",
    emoji: "🇦🇲",
  },
  {
    name: "Aruba",
    dial_code: "+297",
    code: "AW",
    emoji: "🇦🇼",
  },
  {
    name: "Australia",
    dial_code: "+61",
    code: "AU",
    emoji: "🇦🇺",
  },
  {
    name: "Austria",
    dial_code: "+43",
    code: "AT",
    emoji: "🇦🇹",
  },
  {
    name: "Azerbaijan",
    dial_code: "+994",
    code: "AZ",
    emoji: "🇦🇿",
  },
  {
    name: "Bahamas",
    dial_code: "+1242",
    code: "BS",
    emoji: "🇧🇸",
  },
  {
    name: "Bahrain",
    dial_code: "+973",
    code: "BH",
    emoji: "🇧🇭",
  },
  {
    name: "Bangladesh",
    dial_code: "+880",
    code: "BD",
    emoji: "🇧🇩",
  },
  {
    name: "Barbados",
    dial_code: "+1246",
    code: "BB",
    emoji: "🇧🇧",
  },
  {
    name: "Belarus",
    dial_code: "+375",
    code: "BY",
    emoji: "🇧🇾",
  },
  {
    name: "Belgium",
    dial_code: "+32",
    code: "BE",
    emoji: "🇧🇪",
  },
  {
    name: "Belize",
    dial_code: "+501",
    code: "BZ",
    emoji: "🇧🇿",
  },
  {
    name: "Benin",
    dial_code: "+229",
    code: "BJ",
    emoji: "🇧🇯",
  },
  {
    name: "Bermuda",
    dial_code: "+1441",
    code: "BM",
    emoji: "🇧🇲",
  },
  {
    name: "Bhutan",
    dial_code: "+975",
    code: "BT",
    emoji: "🇧🇹",
  },
  {
    name: "Bolivia, Plurinational State of",
    dial_code: "+591",
    code: "BO",
    emoji: "🇧🇴",
  },
  {
    name: "Bosnia and Herzegovina",
    dial_code: "+387",
    code: "BA",
    emoji: "🇧🇦",
  },
  {
    name: "Botswana",
    dial_code: "+267",
    code: "BW",
    emoji: "🇧🇼",
  },
  {
    name: "Brazil",
    dial_code: "+55",
    code: "BR",
    emoji: "🇧🇷",
  },
  {
    name: "British Indian Ocean Territory",
    dial_code: "+246",
    code: "IO",
    emoji: "🇮🇴",
  },
  {
    name: "Brunei Darussalam",
    dial_code: "+673",
    code: "BN",
    emoji: "🇧🇳",
  },
  {
    name: "Bulgaria",
    dial_code: "+359",
    code: "BG",
    emoji: "🇧🇬",
  },
  {
    name: "Burkina Faso",
    dial_code: "+226",
    code: "BF",
    emoji: "🇧🇫",
  },
  {
    name: "Burundi",
    dial_code: "+257",
    code: "BI",
    emoji: "🇧🇮",
  },
  {
    name: "Cambodia",
    dial_code: "+855",
    code: "KH",
    emoji: "🇰🇭",
  },
  {
    name: "Cameroon",
    dial_code: "+237",
    code: "CM",
    emoji: "🇨🇲",
  },
  {
    name: "Canada",
    dial_code: "+1",
    code: "CA",
    emoji: "🇨🇦",
  },
  {
    name: "Cape Verde",
    dial_code: "+238",
    code: "CV",
    emoji: "🇨🇻",
  },
  {
    name: "Cayman Islands",
    dial_code: "+ 345",
    code: "KY",
    emoji: "🇰🇾",
  },
  {
    name: "Central African Republic",
    dial_code: "+236",
    code: "CF",
    emoji: "🇨🇫",
  },
  {
    name: "Chad",
    dial_code: "+235",
    code: "TD",
    emoji: "🇹🇩",
  },
  {
    name: "Chile",
    dial_code: "+56",
    code: "CL",
    emoji: "🇨🇱",
  },
  {
    name: "China",
    dial_code: "+86",
    code: "CN",
    emoji: "🇨🇳",
  },
  {
    name: "Christmas Island",
    dial_code: "+61",
    code: "CX",
    emoji: "🇨🇽",
  },
  {
    name: "Cocos (Keeling) Islands",
    dial_code: "+61",
    code: "CC",
    emoji: "🇨🇨",
  },
  {
    name: "Colombia",
    dial_code: "+57",
    code: "CO",
    emoji: "🇨🇴",
  },
  {
    name: "Comoros",
    dial_code: "+269",
    code: "KM",
    emoji: "🇰🇲",
  },
  {
    name: "Congo",
    dial_code: "+242",
    code: "CG",
    emoji: "🇨🇬",
  },
  {
    name: "Congo, The Democratic Republic of the Congo",
    dial_code: "+243",
    code: "CD",
    emoji: "🇨🇩",
  },
  {
    name: "Cook Islands",
    dial_code: "+682",
    code: "CK",
    emoji: "🇨🇰",
  },
  {
    name: "Costa Rica",
    dial_code: "+506",
    code: "CR",
    emoji: "🇨🇷",
  },
  {
    name: "Cote d'Ivoire",
    dial_code: "+225",
    code: "CI",
    emoji: "🇨🇮",
  },
  {
    name: "Croatia",
    dial_code: "+385",
    code: "HR",
    emoji: "🇭🇷",
  },
  {
    name: "Cuba",
    dial_code: "+53",
    code: "CU",
    emoji: "🇨🇺",
  },
  {
    name: "Cyprus",
    dial_code: "+357",
    code: "CY",
    emoji: "🇨🇾",
  },
  {
    name: "Czech Republic",
    dial_code: "+420",
    code: "CZ",
    emoji: "🇨🇿",
  },
  {
    name: "Denmark",
    dial_code: "+45",
    code: "DK",
    emoji: "🇩🇰",
  },
  {
    name: "Djibouti",
    dial_code: "+253",
    code: "DJ",
    emoji: "🇩🇯",
  },
  {
    name: "Dominica",
    dial_code: "+1767",
    code: "DM",
    emoji: "🇩🇲",
  },
  {
    name: "Dominican Republic",
    dial_code: "+1849",
    code: "DO",
    emoji: "🇩🇴",
  },
  {
    name: "Ecuador",
    dial_code: "+593",
    code: "EC",
    emoji: "🇪🇨",
  },
  {
    name: "Egypt",
    dial_code: "+20",
    code: "EG",
    emoji: "🇪🇬",
  },
  {
    name: "El Salvador",
    dial_code: "+503",
    code: "SV",
    emoji: "🇸🇻",
  },
  {
    name: "Equatorial Guinea",
    dial_code: "+240",
    code: "GQ",
    emoji: "🇬🇶",
  },
  {
    name: "Eritrea",
    dial_code: "+291",
    code: "ER",
    emoji: "🇪🇷",
  },
  {
    name: "Estonia",
    dial_code: "+372",
    code: "EE",
    emoji: "🇪🇪",
  },
  {
    name: "Ethiopia",
    dial_code: "+251",
    code: "ET",
    emoji: "🇪🇹",
  },
  {
    name: "Falkland Islands (Malvinas)",
    dial_code: "+500",
    code: "FK",
    emoji: "🇫🇰",
  },
  {
    name: "Faroe Islands",
    dial_code: "+298",
    code: "FO",
    emoji: "🇫🇴",
  },
  {
    name: "Fiji",
    dial_code: "+679",
    code: "FJ",
    emoji: "🇫🇯",
  },
  {
    name: "Finland",
    dial_code: "+358",
    code: "FI",
    emoji: "🇫🇮",
  },
  {
    name: "France",
    dial_code: "+33",
    code: "FR",
    emoji: "🇫🇷",
  },
  {
    name: "French Guiana",
    dial_code: "+594",
    code: "GF",
    emoji: "🇬🇫",
  },
  {
    name: "French Polynesia",
    dial_code: "+689",
    code: "PF",
    emoji: "🇵🇫",
  },
  {
    name: "Gabon",
    dial_code: "+241",
    code: "GA",
    emoji: "🇬🇦",
  },
  {
    name: "Gambia",
    dial_code: "+220",
    code: "GM",
    emoji: "🇬🇲",
  },
  {
    name: "Georgia",
    dial_code: "+995",
    code: "GE",
    emoji: "🇬🇪",
  },
  {
    name: "Germany",
    dial_code: "+49",
    code: "DE",
    emoji: "🇩🇪",
  },
  {
    name: "Ghana",
    dial_code: "+233",
    code: "GH",
    emoji: "🇬🇭",
  },
  {
    name: "Gibraltar",
    dial_code: "+350",
    code: "GI",
    emoji: "🇬🇮",
  },
  {
    name: "Greece",
    dial_code: "+30",
    code: "GR",
    emoji: "🇬🇷",
  },
  {
    name: "Greenland",
    dial_code: "+299",
    code: "GL",
    emoji: "🇬🇱",
  },
  {
    name: "Grenada",
    dial_code: "+1473",
    code: "GD",
    emoji: "🇬🇩",
  },
  {
    name: "Guadeloupe",
    dial_code: "+590",
    code: "GP",
    emoji: "🇬🇵",
  },
  {
    name: "Guam",
    dial_code: "+1671",
    code: "GU",
    emoji: "🇬🇺",
  },
  {
    name: "Guatemala",
    dial_code: "+502",
    code: "GT",
    emoji: "🇬🇹",
  },
  {
    name: "Guernsey",
    dial_code: "+44",
    code: "GG",
    emoji: "🇬🇬",
  },
  {
    name: "Guinea",
    dial_code: "+224",
    code: "GN",
    emoji: "🇬🇳",
  },
  {
    name: "Guinea-Bissau",
    dial_code: "+245",
    code: "GW",
    emoji: "🇬🇼",
  },
  {
    name: "Guyana",
    dial_code: "+595",
    code: "GY",
    emoji: "🇬🇾",
  },
  {
    name: "Haiti",
    dial_code: "+509",
    code: "HT",
    emoji: "🇭🇹",
  },
  {
    name: "Holy See (Vatican City State)",
    dial_code: "+379",
    code: "VA",
    emoji: "🇻🇦",
  },
  {
    name: "Honduras",
    dial_code: "+504",
    code: "HN",
    emoji: "🇭🇳",
  },
  {
    name: "Hong Kong",
    dial_code: "+852",
    code: "HK",
    emoji: "🇭🇰",
  },
  {
    name: "Hungary",
    dial_code: "+36",
    code: "HU",
    emoji: "🇭🇺",
  },
  {
    name: "Iceland",
    dial_code: "+354",
    code: "IS",
    emoji: "🇮🇸",
  },
  {
    name: "India",
    dial_code: "+91",
    code: "IN",
    emoji: "🇮🇳",
  },
  {
    name: "Indonesia",
    dial_code: "+62",
    code: "ID",
    emoji: "🇮🇩",
  },
  {
    name: "Iran, Islamic Republic of Persian Gulf",
    dial_code: "+98",
    code: "IR",
    emoji: "🇮🇷",
  },
  {
    name: "Iraq",
    dial_code: "+964",
    code: "IQ",
    emoji: "🇮🇶",
  },
  {
    name: "Ireland",
    dial_code: "+353",
    code: "IE",
    emoji: "🇮🇪",
  },
  {
    name: "Isle of Man",
    dial_code: "+44",
    code: "IM",
    emoji: "🇮🇲",
  },
  {
    name: "Israel",
    dial_code: "+972",
    code: "IL",
    emoji: "🇮🇱",
  },
  {
    name: "Italy",
    dial_code: "+39",
    code: "IT",
    emoji: "🇮🇹",
  },
  {
    name: "Jamaica",
    dial_code: "+1876",
    code: "JM",
    emoji: "🇯🇲",
  },
  {
    name: "Japan",
    dial_code: "+81",
    code: "JP",
    emoji: "🇯🇵",
  },
  {
    name: "Jersey",
    dial_code: "+44",
    code: "JE",
    emoji: "🇯🇪",
  },
  {
    name: "Jordan",
    dial_code: "+962",
    code: "JO",
    emoji: "🇯🇴",
  },
  {
    name: "Kazakhstan",
    dial_code: "+77",
    code: "KZ",
    emoji: "🇰🇿",
  },
  {
    name: "Kenya",
    dial_code: "+254",
    code: "KE",
    emoji: "🇰🇪",
  },
  {
    name: "Kiribati",
    dial_code: "+686",
    code: "KI",
    emoji: "🇰🇮",
  },
  {
    name: "Korea, Democratic People's Republic of Korea",
    dial_code: "+850",
    code: "KP",
    emoji: "🇰🇵",
  },
  {
    name: "Korea, Republic of South Korea",
    dial_code: "+82",
    code: "KR",
    emoji: "🇰🇷",
  },
  {
    name: "Kuwait",
    dial_code: "+965",
    code: "KW",
    emoji: "🇰🇼",
  },
  {
    name: "Kyrgyzstan",
    dial_code: "+996",
    code: "KG",
    emoji: "🇰🇬",
  },
  {
    name: "Laos",
    dial_code: "+856",
    code: "LA",
    emoji: "🇱🇦",
  },
  {
    name: "Latvia",
    dial_code: "+371",
    code: "LV",
    emoji: "🇱🇻",
  },
  {
    name: "Lebanon",
    dial_code: "+961",
    code: "LB",
    emoji: "🇱🇧",
  },
  {
    name: "Lesotho",
    dial_code: "+266",
    code: "LS",
    emoji: "🇱🇸",
  },
  {
    name: "Liberia",
    dial_code: "+231",
    code: "LR",
    emoji: "🇱🇷",
  },
  {
    name: "Libyan Arab Jamahiriya",
    dial_code: "+218",
    code: "LY",
    emoji: "🇱🇾",
  },
  {
    name: "Liechtenstein",
    dial_code: "+423",
    code: "LI",
    emoji: "🇱🇮",
  },
  {
    name: "Lithuania",
    dial_code: "+370",
    code: "LT",
    emoji: "🇱🇹",
  },
  {
    name: "Luxembourg",
    dial_code: "+352",
    code: "LU",
    emoji: "🇱🇺",
  },
  {
    name: "Macao",
    dial_code: "+853",
    code: "MO",
    emoji: "🇲🇴",
  },
  {
    name: "Macedonia",
    dial_code: "+389",
    code: "MK",
    emoji: "🇲🇰",
  },
  {
    name: "Madagascar",
    dial_code: "+261",
    code: "MG",
    emoji: "🇲🇬",
  },
  {
    name: "Malawi",
    dial_code: "+265",
    code: "MW",
    emoji: "🇲🇼",
  },
  {
    name: "Malaysia",
    dial_code: "+60",
    code: "MY",
    emoji: "🇲🇾",
  },
  {
    name: "Maldives",
    dial_code: "+960",
    code: "MV",
    emoji: "🇲🇻",
  },
  {
    name: "Mali",
    dial_code: "+223",
    code: "ML",
    emoji: "🇲🇱",
  },
  {
    name: "Malta",
    dial_code: "+356",
    code: "MT",
    emoji: "🇲🇹",
  },
  {
    name: "Marshall Islands",
    dial_code: "+692",
    code: "MH",
    emoji: "🇲🇭",
  },
  {
    name: "Martinique",
    dial_code: "+596",
    code: "MQ",
    emoji: "🇲🇶",
  },
  {
    name: "Mauritania",
    dial_code: "+222",
    code: "MR",
    emoji: "🇲🇷",
  },
  {
    name: "Mauritius",
    dial_code: "+230",
    code: "MR",
    emoji: "🇲🇺",
  },
  {
    name: "Mayotte",
    dial_code: "+262",
    code: "YT",
    emoji: "🇾🇹",
  },
  {
    name: "Mexico",
    dial_code: "+52",
    code: "MX",
    emoji: "🇲🇽",
  },
  {
    name: "Micronesia, Federated States of Micronesia",
    dial_code: "+691",
    code: "FM",
    emoji: "🇫🇲",
  },
  {
    name: "Moldova",
    dial_code: "+373",
    code: "MD",
    emoji: "🇲🇩",
  },
  {
    name: "Monaco",
    dial_code: "+377",
    code: "MC",
    emoji: "🇲🇨",
  },
  {
    name: "Mongolia",
    dial_code: "+976",
    code: "MN",
    emoji: "🇲🇳",
  },
  {
    name: "Montenegro",
    dial_code: "+382",
    code: "ME",
    emoji: "🇲🇪",
  },
  {
    name: "Montserrat",
    dial_code: "+1664",
    code: "MS",
    emoji: "🇲🇸",
  },
  {
    name: "Morocco",
    dial_code: "+212",
    code: "MA",
    emoji: "🇲🇦",
  },
  {
    name: "Mozambique",
    dial_code: "+258",
    code: "MZ",
    emoji: "🇲🇿",
  },
  {
    name: "Myanmar",
    dial_code: "+95",
    code: "MM",
    emoji: "🇲🇲",
  },
  {
    name: "Namibia",
    dial_code: "+264",
    code: "NA",
    emoji: "🇳🇦",
  },
  {
    name: "Nauru",
    dial_code: "+674",
    code: "NR",
    emoji: "🇳🇷",
  },
  {
    name: "Nepal",
    dial_code: "+977",
    code: "NP",
    emoji: "🇳🇵",
  },
  {
    name: "Netherlands",
    dial_code: "+31",
    code: "NL",
    emoji: "🇳🇱",
  },
  {
    name: "Netherlands Antilles",
    dial_code: "+599",
    code: "AN",
    emoji: "🇳🇱",
  },
  {
    name: "New Caledonia",
    dial_code: "+687",
    code: "NC",
    emoji: "🇳🇨",
  },
  {
    name: "New Zealand",
    dial_code: "+64",
    code: "NZ",
    emoji: "🇳🇿",
  },
  {
    name: "Nicaragua",
    dial_code: "+505",
    code: "NI",
    emoji: "🇳🇮",
  },
  {
    name: "Niger",
    dial_code: "+227",
    code: "NE",
    emoji: "🇳🇪",
  },
  {
    name: "Nigeria",
    dial_code: "+234",
    code: "NG",
    emoji: "🇳🇬",
  },
  {
    name: "Niue",
    dial_code: "+683",
    code: "NU",
    emoji: "🇳🇺",
  },
  {
    name: "Norfolk Island",
    dial_code: "+672",
    code: "NF",
    emoji: "🇳🇫",
  },
  {
    name: "Northern Mariana Islands",
    dial_code: "+1670",
    code: "MP",
    emoji: "🏳",
  },
  {
    name: "Norway",
    dial_code: "+47",
    code: "NO",
    emoji: "🇳🇴",
  },
  {
    name: "Oman",
    dial_code: "+968",
    code: "OM",
    emoji: "🇴🇲",
  },
  {
    name: "Pakistan",
    dial_code: "+92",
    code: "PK",
    emoji: "🇵🇰",
  },
  {
    name: "Palau",
    dial_code: "+680",
    code: "PW",
    emoji: "🇵🇼",
  },
  {
    name: "Palestinian Territory, Occupied",
    dial_code: "+970",
    code: "PS",
    emoji: "🇵🇸",
  },
  {
    name: "Panama",
    dial_code: "+507",
    code: "PA",
    emoji: "🇵🇦",
  },
  {
    name: "Papua New Guinea",
    dial_code: "+675",
    code: "PG",
    emoji: "🇵🇬",
  },
  {
    name: "Paraguay",
    dial_code: "+595",
    code: "PY",
    emoji: "🇵🇾",
  },
  {
    name: "Peru",
    dial_code: "+51",
    code: "PE",
    emoji: "🇵🇪",
  },
  {
    name: "Philippines",
    dial_code: "+63",
    code: "PH",
    emoji: "🇵🇭",
  },
  {
    name: "Pitcairn",
    dial_code: "+872",
    code: "PN",
    emoji: "🇵🇳",
  },
  {
    name: "Poland",
    dial_code: "+48",
    code: "PL",
    emoji: "🇵🇱",
  },
  {
    name: "Portugal",
    dial_code: "+351",
    code: "PT",
    emoji: "🇵🇹",
  },
  {
    name: "Puerto Rico",
    dial_code: "+1939",
    code: "PR",
    emoji: "🇵🇷",
  },
  {
    name: "Qatar",
    dial_code: "+974",
    code: "QA",
    emoji: "🇶🇦",
  },
  {
    name: "Romania",
    dial_code: "+40",
    code: "RO",
    emoji: "🇷🇴",
  },
  {
    name: "Russia",
    dial_code: "+7",
    code: "RU",
    emoji: "🇷🇺",
  },
  {
    name: "Rwanda",
    dial_code: "+250",
    code: "RW",
    emoji: "🇷🇼",
  },
  {
    name: "Reunion",
    dial_code: "+262",
    code: "RE",
    emoji: "🇷🇪",
  },
  {
    name: "Saint Barthelemy",
    dial_code: "+590",
    code: "BL",
    emoji: "🇧🇱",
  },
  {
    name: "Saint Helena, Ascension and Tristan Da Cunha",
    dial_code: "+290",
    code: "SH",
    emoji: "🇸🇭",
  },
  {
    name: "Saint Kitts and Nevis",
    dial_code: "+1869",
    code: "KN",
    emoji: "🇰🇳",
  },
  {
    name: "Saint Lucia",
    dial_code: "+1758",
    code: "LC",
    emoji: "🇱🇨",
  },
  {
    name: "Saint Martin",
    dial_code: "+590",
    code: "MF",
    emoji: "🇲🇫",
  },
  {
    name: "Saint Pierre and Miquelon",
    dial_code: "+508",
    code: "PM",
    emoji: "🇵🇲",
  },
  {
    name: "Saint Vincent and the Grenadines",
    dial_code: "+1784",
    code: "VC",
    emoji: "🇻🇨",
  },
  {
    name: "Samoa",
    dial_code: "+685",
    code: "WS",
    emoji: "🇼🇸",
  },
  {
    name: "San Marino",
    dial_code: "+378",
    code: "SM",
    emoji: "🇸🇲",
  },
  {
    name: "Sao Tome and Principe",
    dial_code: "+239",
    code: "ST",
    emoji: "🇸🇹",
  },
  {
    name: "Saudi Arabia",
    dial_code: "+966",
    code: "SA",
    emoji: "🇸🇩",
  },
  {
    name: "Senegal",
    dial_code: "+221",
    code: "SN",
    emoji: "🇸🇳",
  },
  {
    name: "Serbia",
    dial_code: "+381",
    code: "RS",
    emoji: "🇷🇸",
  },
  {
    name: "Seychelles",
    dial_code: "+248",
    code: "SC",
    emoji: "🇸🇨",
  },
  {
    name: "Sierra Leone",
    dial_code: "+232",
    code: "SL",
    emoji: "🇸🇱",
  },
  {
    name: "Singapore",
    dial_code: "+65",
    code: "SG",
    emoji: "🇸🇬",
  },
  {
    name: "Slovakia",
    dial_code: "+421",
    code: "SK",
    emoji: "🇸🇰",
  },
  {
    name: "Slovenia",
    dial_code: "+386",
    code: "SI",
    emoji: "🇸🇮",
  },
  {
    name: "Solomon Islands",
    dial_code: "+677",
    code: "SB",
    emoji: "🇸🇧",
  },
  {
    name: "Somalia",
    dial_code: "+252",
    code: "SO",
    emoji: "🇸🇴",
  },
  {
    name: "South Africa",
    dial_code: "+27",
    code: "ZA",
    emoji: "🇿🇦",
  },
  {
    name: "South Sudan",
    dial_code: "+211",
    code: "SS",
    emoji: "🇸🇸",
  },
  {
    name: "South Georgia and the South Sandwich Islands",
    dial_code: "+500",
    code: "GS",
    emoji: "🇬🇸",
  },
  {
    name: "Spain",
    dial_code: "+34",
    code: "ES",
    emoji: "🇪🇸",
  },
  {
    name: "Sri Lanka",
    dial_code: "+94",
    code: "LK",
    emoji: "🇱🇰",
  },
  {
    name: "Sudan",
    dial_code: "+249",
    code: "SD",
    emoji: "🇸🇩",
  },
  {
    name: "Suriname",
    dial_code: "+597",
    code: "SR",
    emoji: "🇸🇷",
  },
  {
    name: "Svalbard and Jan Mayen",
    dial_code: "+47",
    code: "SJ",
    emoji: "🇸🇯",
  },
  {
    name: "Swaziland",
    dial_code: "+268",
    code: "SZ",
    emoji: "🇸🇿",
  },
  {
    name: "Sweden",
    dial_code: "+46",
    code: "SE",
    emoji: "🇸🇪",
  },
  {
    name: "Switzerland",
    dial_code: "+41",
    code: "CH",
    emoji: "🇨🇭",
  },
  {
    name: "Syrian Arab Republic",
    dial_code: "+963",
    code: "SY",
    emoji: "🇸🇾",
  },
  {
    name: "Taiwan",
    dial_code: "+886",
    code: "TW",
    emoji: "🇹🇼",
  },
  {
    name: "Tajikistan",
    dial_code: "+992",
    code: "TJ",
    emoji: "🇹🇯",
  },
  {
    name: "Tanzania, United Republic of Tanzania",
    dial_code: "+255",
    code: "TZ",
    emoji: "🇹🇿",
  },
  {
    name: "Thailand",
    dial_code: "+66",
    code: "TH",
    emoji: "🇹🇭",
  },
  {
    name: "Timor-Leste",
    dial_code: "+670",
    code: "TL",
    emoji: "🇹🇱",
  },
  {
    name: "Togo",
    dial_code: "+228",
    code: "TG",
    emoji: "🇹🇬",
  },
  {
    name: "Tokelau",
    dial_code: "+690",
    code: "TK",
    emoji: "🇹🇰",
  },
  {
    name: "Tonga",
    dial_code: "+676",
    code: "TO",
    emoji: "🇹🇴",
  },
  {
    name: "Trinidad and Tobago",
    dial_code: "+1868",
    code: "TT",
    emoji: "🇹🇹",
  },
  {
    name: "Tunisia",
    dial_code: "+216",
    code: "TN",
    emoji: "🇹🇳",
  },
  {
    name: "Turkey",
    dial_code: "+90",
    code: "TR",
    emoji: "🇹🇷",
  },
  {
    name: "Turkmenistan",
    dial_code: "+993",
    code: "TM",
    emoji: "🇹🇲",
  },
  {
    name: "Turks and Caicos Islands",
    dial_code: "+1649",
    code: "TC",
    emoji: "🇹🇨",
  },
  {
    name: "Tuvalu",
    dial_code: "+688",
    code: "TV",
    emoji: "🇹🇻",
  },
  {
    name: "Uganda",
    dial_code: "+256",
    code: "UG",
    emoji: "🇺🇬",
  },
  {
    name: "Ukraine",
    dial_code: "+380",
    code: "UA",
    emoji: "🇺🇦",
  },
  {
    name: "United Arab Emirates",
    dial_code: "+971",
    code: "AE",
    emoji: "🇦🇪",
  },
  {
    name: "United Kingdom",
    dial_code: "+44",
    code: "GB",
    emoji: "🇬🇧",
  },
  {
    name: "United States",
    dial_code: "+1",
    code: "US",
    emoji: "🇺🇸",
  },
  {
    name: "Uruguay",
    dial_code: "+598",
    code: "UY",
    emoji: "🇺🇾",
  },
  {
    name: "Uzbekistan",
    dial_code: "+998",
    code: "UZ",
    emoji: "🇺🇿",
  },
  {
    name: "Vanuatu",
    dial_code: "+678",
    code: "VU",
    emoji: "🇻🇺",
  },
  {
    name: "Venezuela, Bolivarian Republic of Venezuela",
    dial_code: "+58",
    code: "VE",
    emoji: "🇻🇪",
  },
  {
    name: "Vietnam",
    dial_code: "+84",
    code: "VN",
    emoji: "🇻🇳",
  },
  {
    name: "Virgin Islands, British",
    dial_code: "+1284",
    code: "VG",
    emoji: "🇻🇬",
  },
  {
    name: "Virgin Islands, U.S.",
    dial_code: "+1340",
    code: "VI",
    emoji: "🇻🇮",
  },
  {
    name: "Wallis and Futuna",
    dial_code: "+681",
    code: "WF",
    emoji: "🇼🇫",
  },
  {
    name: "Yemen",
    dial_code: "+967",
    code: "YE",
    emoji: "🇾🇪",
  },
  {
    name: "Zambia",
    dial_code: "+260",
    code: "ZM",
    emoji: "🇿🇲",
  },
  {
    name: "Zimbabwe",
    dial_code: "+263",
    code: "ZW",
    emoji: "🇿🇼",
  },
];

const SignupForm = () => {
  let url = process.env.NEXT_PUBLIC_BKEND_URL;
  let fendUrl = process.env.NEXT_PUBLIC_FTEND_URL;
  let apiUsername = process.env.NEXT_PUBLIC_API_USERNAME;
  let apiPassword = process.env.NEXT_PUBLIC_API_PASSWORD;
  let [token, setToken] = useState(null);
  let router = useRouter();

  const [messageApi, contextHolder] = message.useMessage();
  let [loaded, setLoaded] = useState(false);
  let [submitting, setSubmitting] = useState(false);
  let [type, setType] = useState("VENDOR");
  let [dpts, setDpts] = useState([]);
  let [servCategories, setServCategories] = useState([]);
  let [otherAreaOfExpertise, setOtherAreaOfExpertise] = useState(false);

  const [form] = Form.useForm();
  const [rdbCertId, setRdbCertId] = useState(null);
  const [vatCertId, setVatCertId] = useState(null);
  const [rdbSelected, setRDBSelected] = useState(false);
  const [vatSelected, setVatSelected] = useState(false);
  const [password, setPassword] = useState("");
  const regexPatternSpecialCh = "[!@#$%^&*()\\-_=+[\\]{};:'\"\\\\|,.<>/?]";
  const searchParams = useSearchParams();

  const onFinish = (values) => {
    setSubmitting(true);
    let services = values.services;
    let updatedServices = services.map((s) => {
      let s2 = s;
      if (s == "Other") {
        s2 = `Other - ${values.otherAreaOfExpertise}`;
      }
      return s2;
    });

    fetch(`${url}/users`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userType: type,
        email: values.email,
        telephone: values.prefix + values.phone,
        experienceDurationInYears: values.experience,
        experienceDurationInMonths: values.experience * 12,
        webSite: values.website,
        status: "pending-approval",
        password: values.password,
        tin: values.tin,
        number: values.number,
        companyName: values.companyName,
        department: values.dpt,
        contactPersonNames: values.contactPersonNames,
        title: values.title,
        hqAddress: values.hqAddress,
        country: values.country,
        passportNid: values.passportNid,
        services: values.services,
        rdbCertId: rdbSelected ? rdbCertId : null,
        vatCertId: vatSelected ? vatCertId : null,
        tempPassword: "password",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        if (!res.error) {
          messageApi.open({
            type: "success",
            content: "Successfully registered!",
          });
          router.push("/auth");
        } else {
          messageApi.open({
            type: "error",
            content: res.errorMessage,
          });
          router.push("/auth");
        }
      })
      .catch((err) => {
        setSubmitting(false);
        messageApi.open({
          type: "error",
          content: "Something happened! Please try again.",
        });
      });
  };

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setRdbCertId(v4());
    setVatCertId(v4());
    setLoaded(true);
    fetch(`${url}/dpts`, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setDpts(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });

    fetch(`${url}/serviceCategories`, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " + base64_encode(`${apiUsername}:${apiPassword}`),
        token: token,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        res.push({
          _id: "other",
          description: "Other",
        });
        setServCategories(res);
      })
      .catch((err) => {
        messageApi.open({
          type: "error",
          content: "Connection Error!",
        });
      });
  }, []);

  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
        style={{ width: 90 }}
        showSearch
        allowClear
        options={countries.map((c, i) => {
          return {
            value: c.dial_code,
            key: i,
            label: c.dial_code,
          };
        })}
      >
        {countries.map((c, i) => {
          return (
            <Option key={i} value={c.dial_code}>
              {c.emoji} {c.name}
            </Option>
          );
        })}
        {/* <Option value="+250">+250</Option>
        <Option value="+254">+254</Option> */}
      </Select>
    </Form.Item>
  );

  const formItemLayout = {
    // labelCol: {
    //   xs: { span: 10 },
    //   sm: { span: 10 },
    // },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
    },
  };
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
    // <div className="flex h-screen">
    //   {contextHolder}
    //   {loaded ? (
    //     <div className="flex bg-slate-50 py-5 my-10 px-10 rounded-lg shadow-lg overflow-y-auto">
    //       <Form
    //         {...formItemLayout}
    //         form={form}
    //         name="register"
    //         onFinish={onFinish}
    //         initialValues={{
    //           residence: ["zhejiang", "hangzhou", "xihu"],
    //           firstName: "",
    //           prefix: "+250",
    //           email: "",
    //         }}
    //         scrollToFirstError
    //       >
    //         <div>
    //           {submitting ? (
    //             <Spin indicator={antIcon} />
    //           ) : (
    //             <div className="flex flex-row text-sm items-center">
    //               <div>Already have an account?</div>
    //               <Button type="link" onClick={() => router.push("/auth")}>
    //                 Login
    //               </Button>
    //             </div>
    //           )}
    //         </div>
    //         <Row className="flex flex-row space-x-5 items-center justify-between">
    //           <div>
    //             <Typography.Title level={2}>Create an account</Typography.Title>
    //           </div>

    //           <Image
    //             alt=""
    //             className="pt-3"
    //             src="/favicon.png"
    //             width={38}
    //             height={40}
    //           />
    //         </Row>
    //         {/* <Form.Item
    //           name="type"
    //           label="Account type"
    //           rules={[
    //             { required: true, message: "Please select account type!" },
    //           ]}
    //         >
    //           <Select
    //             placeholder="select account type"
    //             onChange={(value) => setType(value)}
    //           >
    //             <Option value="VENDOR">Vendor</Option>
    //             <Option value="DPT-USER">Department User</Option>
    //           </Select>
    //         </Form.Item> */}

    //         {type === "VENDOR" && (
    //           <>
    //             <div className="grid md:grid-cols-2 gap-x-10">
    //               {/* General Information */}
    //               <div>
    //                 <Typography.Title className="" level={4}>
    //                   General Information
    //                 </Typography.Title>
    //                 <div className="">
    //                   {/* Grid 1 */}
    //                   <div className="grid grid-cols-2 gap-x-5 -my-1">
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Company Name<div className="text-red-500">*</div>
    //                       </div>

    //                       <Form.Item
    //                         name="companyName"
    //                         // label="Company name"
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                         ]}
    //                       >
    //                         <Input />
    //                       </Form.Item>
    //                     </div>

    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         TIN<div className="text-red-500">*</div>
    //                         <div>
    //                           <Tooltip
    //                             placement="top"
    //                             title="For foreign business, please provide your base country incorporation or registration ID."
    //                             arrow={false}
    //                           >
    //                             <QuestionCircleOutlined />
    //                           </Tooltip>
    //                         </div>
    //                       </div>
    //                       <Form.Item
    //                         name="tin"
    //                         // label="TIN"
    //                         rules={[
    //                           // { len: 10, message: "TIN should be 10 charachers" },
    //                           {
    //                             type: "integer",
    //                             message: "Input required",
    //                           },
    //                           { required: true, message: "Input required" },
    //                         ]}
    //                       >
    //                         <InputNumber style={{ width: "100%" }} />
    //                       </Form.Item>
    //                     </div>
    //                   </div>

    //                   <div className="grid grid-cols-2 gap-x-5 -my-1">
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Contact person Names
    //                         <div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="contactPersonNames"
    //                         // label="Contact Person's Names"
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                         ]}
    //                       >
    //                         <Input />
    //                       </Form.Item>
    //                     </div>
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Contact Person Title
    //                         <div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="title"
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                         ]}
    //                       >
    //                         <Input />
    //                       </Form.Item>
    //                     </div>
    //                   </div>

    //                   <div className="grid grid-cols-2 gap-x-5 -my-1">
    //                     <div>
    //                     <div className="flex flex-row spacex-3">
    //                         Email<div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="email"
    //                         // label="E-mail"
    //                         rules={[
    //                           {
    //                             type: "email",
    //                             message: "The input is not valid E-mail!",
    //                           },
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                         ]}
    //                       >
    //                         <Input />
    //                       </Form.Item>
    //                     </div>
    //                     <div>
    //                       <div>Website</div>
    //                       <Form.Item name="website">
    //                         <AutoComplete
    //                           options={websiteOptions}
    //                           onChange={onWebsiteChange}
    //                           placeholder="website"
    //                         >
    //                           <Input />
    //                         </AutoComplete>
    //                       </Form.Item>
    //                     </div>
    //                   </div>

    //                   <div className="grid grid-cols-2 gap-x-5 -my-1">
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Password<div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="password"
    //                         // label="Password"
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                           {
    //                             pattern: new RegExp("([0-9]\\d*)+"),
    //                             message: "Please input at least one digit",
    //                           },
    //                           {
    //                             pattern: new RegExp("([a-zA-Z]\\s*)+"),
    //                             message:
    //                               "Password should have both small and capital letters",
    //                           },
    //                           {
    //                             pattern: new RegExp(regexPatternSpecialCh, "g"),
    //                             message:
    //                               "Password should have a special character",
    //                           },
    //                           {
    //                             pattern: new RegExp("(.{8,})"),
    //                             message:
    //                               "Password should have atleast 8 characters",
    //                           },
    //                         ]}
    //                         hasFeedback
    //                       >
    //                         <Input.Password onChange={(v) => setPassword(v)} />
    //                       </Form.Item>
    //                     </div>
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Confirm password
    //                         <div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="confirm"
    //                         // label="Confirm Password"
    //                         dependencies={["password"]}
    //                         hasFeedback
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                           ({ getFieldValue }) => ({
    //                             validator(_, value) {
    //                               if (
    //                                 !value ||
    //                                 getFieldValue("password") === value
    //                               ) {
    //                                 return Promise.resolve();
    //                               }
    //                               return Promise.reject(
    //                                 new Error(
    //                                   "The two passwords that you entered do not match!"
    //                                 )
    //                               );
    //                             },
    //                           }),
    //                         ]}
    //                       >
    //                         <Input.Password />
    //                       </Form.Item>
    //                     </div>
    //                   </div>

    //                   <div className="grid grid-cols-2 gap-x-5 -my-1">
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Phone number <div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="phone"
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                         ]}
    //                       >
    //                         <Input addonBefore={prefixSelector} />
    //                       </Form.Item>
    //                     </div>
    //                     <div>
    //                       <div className="flex flex-row spacex-3">
    //                         Area(s) of expertise
    //                         <div className="text-red-500">*</div>
    //                       </div>
    //                       <Form.Item
    //                         name="services"
    //                         rules={[
    //                           {
    //                             required: true,
    //                             message: "Input required",
    //                           },
    //                         ]}
    //                       >
    //                         <Select
    //                           mode="multiple"
    //                           allowClear
    //                           // style={{width:'100%'}}
    //                           placeholder="Please select"
    //                         >
    //                           {servCategories?.map((s) => {
    //                             return (
    //                               <Option key={s._id} value={s.description}>
    //                                 {s.description}
    //                               </Option>
    //                             );
    //                           })}
    //                         </Select>
    //                       </Form.Item>
    //                     </div>
    //                   </div>

    //                   <div className="grid grid-cols-2 gap-x-5 -my-1">
    //                     <div>
    //                       <div>Experience (in Years)</div>
    //                       <Form.Item
    //                         name="experience"
    //                         rules={[
    //                           {
    //                             type: "integer",
    //                             message: "The input is not valid Number",
    //                           },
    //                         ]}
    //                       >
    //                         <InputNumber style={{ width: "100%" }} />
    //                       </Form.Item>
    //                     </div>
    //                   </div>
    //                 </div>
    //               </div>

    //               {/* Address information */}
    //               <div>
    //                 <Typography.Title className="" level={4}>
    //                   Address Information
    //                 </Typography.Title>

    //                 <div>
    //                   {/* Grid 1 */}
    //                   <div className="grid grid-cols-2 gap-x-5">
    //                     <div>
    //                       <div>Hq Address</div>
    //                       <Form.Item name="hqAddress">
    //                         <Input />
    //                       </Form.Item>
    //                     </div>

    //                     <div>
    //                       <div>Country</div>
    //                       <Form.Item name="country">
    //                         <Input />
    //                       </Form.Item>
    //                     </div>
    //                   </div>
    //                 </div>

    //                 <Typography.Title className="" level={4}>
    //                   Uploads
    //                 </Typography.Title>

    //                 <div className="grid md:grid-cols-2 gap-x-5">
    //                   <div>
    //                     <div className="flex flex-row space-x-1">
    //                       <div>Incorporation document</div>
    //                       <div>
    //                         <Tooltip
    //                           placement="top"
    //                           title="Please attach your incorporation document. For businesses registered in Rwanda, please provide your RDB certificate."
    //                           arrow={false}
    //                         >
    //                           <QuestionCircleOutlined />
    //                         </Tooltip>
    //                       </div>
    //                     </div>

    //                     <Form.Item
    //                       name="rdbRegistraction"
    //                       rules={[
    //                         // {
    //                         //   validator: (_, value) =>
    //                         //     rdbSelected
    //                         //       ? Promise.resolve()
    //                         //       : Promise.reject(
    //                         //           new Error(
    //                         //             "Please attach your incorporation document"
    //                         //           )
    //                         //         ),
    //                         // },
    //                       ]}
    //                     >
    //                       <UploadRDCerts
    //                         uuid={rdbCertId}
    //                         setSelected={setRDBSelected}
    //                         setId={setRdbCertId}
    //                         iconOnly={false}
    //                         setStatus={()=>{}}
    //                       />
    //                     </Form.Item>
    //                   </div>
    //                   <div>
    //                     <div>VAT Certificate</div>
    //                     <Form.Item name="vatCertificate">
    //                       <UploadVatCerts
    //                         uuid={vatCertId}
    //                         setId={setVatCertId}
    //                         setSelected={setVatSelected}
    //                         setStatus={()=>{}}

    //                       />
    //                     </Form.Item>
    //                   </div>
    //                   <div></div>
    //                 </div>
    //               </div>
    //             </div>

    //             {/* <Form.Item
    //               name="agreement"
    //               valuePropName="checked"
    //               rules={[
    //                 {
    //                   validator: (_, value) =>
    //                     value
    //                       ? Promise.resolve()
    //                       : Promise.reject(
    //                           new Error("Should accept agreement")
    //                         ),
    //                 },
    //               ]}
    //               {...tailFormItemLayout}
    //             >
    //               <Checkbox>
    //                 I have read the <a href="">agreement</a>
    //               </Checkbox>
    //             </Form.Item> */}

    //             <Form.Item className="pb-5" {...tailFormItemLayout}>
    //               {submitting ? (
    //                 <Spin indicator={antIcon} />
    //               ) : (
    //                 <Button type="default" htmlType="submit">
    //                   Register
    //                 </Button>
    //               )}
    //             </Form.Item>
    //           </>
    //         )}
    //       </Form>
    //     </div>
    //   ) : (
    //     <Skeleton />
    //   )}
    // </div>
    <main className="overflow-hidden h-screen mb-10">
      {contextHolder}
      <div className="grid xl:grid-cols-2 items-start px-10 pt-5 h-[calc(100%-80px)] gap-x-10">
        <div className="hidden bg-[#0065DD] w-[calc(100%-45px)] h-[calc(100vh-25px)] rounded-lg text-center xl:flex flex-col justify-center items-center">
          <Image src={Login} className="w-[calc(100%-350px)] h-auto" />
          <h1 className="text-white text-[36px] mb-0 font-bold">
            Procurement made Easy
          </h1>
          <p className="text-white">
            <small className="text-[17px] leading-8">
              A tool that aims to simplify the procurement process for suppliers{" "}
              <br /> looking to work with Irembo.
            </small>
          </p>
        </div>
        <div className="payment-request px-10 pt-5 flex flex-col h-[calc(100%-25px)] overflow-auto">
          <div className="flex justify-between items-center mb-3">
            <small className="text-[#455A64]">
              Already have an account?{" "}
              <Link
                href="/auth"
                className="no-underline text-[14px] text-[#0065DD]"
              >
                Login
              </Link>
            </small>
            <Image src={Logo} alt="" className="w-[110px] h-auto" />
          </div>
          <div className="flex flex-col">
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
              className="flex flex-col h-[calc(100vh-80px)] justify-between"
            >
              <div>
                <h3 className="text-[#455A64]">General Company Information</h3>
                <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">Company Name</label>
                      <div className="text-red-500">*</div>
                    </div>

                    <Form.Item
                      name="companyName"
                      // label="Company name"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Type Company Name"
                        className="h-10 mt-1"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">TIN</label>
                      <div className="text-red-500">*</div>
                      <div>
                        <Tooltip
                          placement="top"
                          title="For foreign business, please provide your base country incorporation or registration ID."
                          arrow={false}
                        >
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </div>
                    </div>
                    <Form.Item
                      name="tin"
                      // label="TIN"
                      rules={[
                        // { len: 10, message: "TIN should be 10 charachers" },
                        {
                          type: "integer",
                          message: "Input required",
                        },
                        { required: true, message: "Input required" },
                      ]}
                    >
                      <InputNumber
                        Placeholder="Type TIN"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">HQ Adress</label>
                    </div>

                    <Form.Item name="hqAddress">
                      <Input
                        placeholder="Type full address"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">Country</label>
                    </div>

                    <Form.Item name="country">
                      <Input
                        placeholder="Type country"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-5">
                  <div>
                    <div className="flex flex-row spacex-3">
                      Area(s) of expertise
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="services"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Select
                        mode="multiple"
                        allowClear
                        size="large"
                        // style={{width:'100%'}}
                        onChange={(value) => {
                          if (_.includes(value, "Other")) {
                            setOtherAreaOfExpertise(true);
                            console.log(value);
                          } else {
                            setOtherAreaOfExpertise(false);
                          }
                        }}
                        placeholder="Please select"
                      >
                        {servCategories?.map((s) => {
                          return (
                            <Option key={s._id} value={s.description}>
                              {s.description}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </div>
                  <div>
                    <label className="text-[#6A757B]">
                      Experience (in Years)
                    </label>
                    <Form.Item
                      name="experience"
                      rules={[
                        {
                          type: "integer",
                          message: "The input is not valid Number",
                        },
                      ]}
                    >
                      <InputNumber className="mt-1 h-10 w-full" />
                    </Form.Item>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-5">
                  {otherAreaOfExpertise && (
                    <div>
                      <div className="flex flex-row spacex-3">
                        Specify your “Other” Area of Expertise
                        <div className="text-red-500">*</div>
                        <div>
                          <Tooltip
                            placement="top"
                            title="100 characters max."
                            arrow={false}
                          >
                            <QuestionCircleOutlined />
                          </Tooltip>
                        </div>
                      </div>

                      <Form.Item
                        name="otherAreaOfExpertise"
                        rules={[
                          {
                            required: true,
                            message: "Input required",
                          },
                        ]}
                      >
                        <Input style={{ width: "100%" }} />
                      </Form.Item>
                    </div>
                  )}
                </div>

                <h3 className="text-[#455A64] -mt-1">Supporting Documents</h3>
                <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                  <div>
                    <div className="flex gap-2">
                      <label className="text-[#6A757B] mb-3">
                        Incorporation document
                      </label>
                      <div>
                        <Tooltip
                          placement="top"
                          title="Please attach your incorporation document. For businesses registered in Rwanda, please provide your RDB certificate."
                          arrow={false}
                        >
                          <QuestionCircleOutlined />
                        </Tooltip>
                      </div>
                    </div>

                    <Form.Item
                      name="rdbRegistraction"
                      rules={
                        [
                          // {
                          //   validator: (_, value) =>
                          //     rdbSelected
                          //       ? Promise.resolve()
                          //       : Promise.reject(
                          //           new Error(
                          //             "Please attach your incorporation document"
                          //           )
                          //         ),
                          // },
                        ]
                      }
                    >
                      <UploadRDCerts
                        uuid={rdbCertId}
                        setSelected={setRDBSelected}
                        setId={setRdbCertId}
                        iconOnly={false}
                        setStatus={() => {}}
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B] mb-3">
                        VAT Certificate
                      </label>
                    </div>

                    <Form.Item name="vatCertificate">
                      <UploadVatCerts
                        uuid={vatCertId}
                        setId={setVatCertId}
                        setSelected={setVatSelected}
                        setStatus={() => {}}
                      />
                    </Form.Item>
                  </div>
                </div>
                <h3 className="text-[#455A64] mt-1">Account Information</h3>
                <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">
                        Contact person Names
                      </label>
                      <div className="text-red-500">*</div>
                    </div>

                    <Form.Item
                      name="contactPersonNames"
                      // label="Contact Person's Names"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Type Contact Person"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">
                        Contact Person Title
                      </label>
                      <div className="text-red-500">*</div>
                    </div>

                    <Form.Item
                      name="title"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        placeholder="E.g: Mrs, Mr, Mss"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <label className="text-[#6A757B]">Email</label>
                      <div className="text-red-500">*</div>
                    </div>

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
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Type Email"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex flex-row spacex-3">
                      <label className="text-[#6A757B] text-12px">
                        Phone number
                      </label>
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="phone"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                      ]}
                    >
                      <Input
                        className="mt-1 w-full"
                        addonBefore={prefixSelector}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="grid lg:grid-cols-2 items-center gap-x-5 -my-1">
                  <div>
                    <div className="flex flex-row spacex-3">
                      <label className="text-[#6A757B] text-12px">
                        Password
                      </label>
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="password"
                      // label="Password"
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                        {
                          pattern: new RegExp("([0-9]\\d*)+"),
                          message: "Please input at least one digit",
                        },
                        {
                          pattern: new RegExp("([a-zA-Z]\\s*)+"),
                          message:
                            "Password should have both small and capital letters",
                        },
                        {
                          pattern: new RegExp(regexPatternSpecialCh, "g"),
                          message: "Password should have a special character",
                        },
                        {
                          pattern: new RegExp("(.{8,})"),
                          message: "Password should have atleast 8 characters",
                        },
                      ]}
                      hasFeedback
                    >
                      <Input.Password
                        placeholder="* * * * * * * *"
                        className="h-10 mt-1 w-full"
                        onChange={(v) => setPassword(v)}
                      />
                    </Form.Item>
                  </div>
                  <div>
                    <div className="flex flex-row spacex-3">
                      <label className="text-[#6A757B] text-12px">
                        Confirm password
                      </label>
                      <div className="text-red-500">*</div>
                    </div>
                    <Form.Item
                      name="confirm"
                      // label="Confirm Password"
                      dependencies={["password"]}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: "Input required",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The two passwords that you entered do not match!"
                              )
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        placeholder="* * * * * * * *"
                        className="h-10 mt-1 w-full"
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>
              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value
                        ? Promise.resolve()
                        : Promise.reject(new Error("Should accept agreement")),
                  },
                ]}
                {...tailFormItemLayout}
              >
                <Checkbox>
                  I have read the{" "}
                  <a
                    href={`${fendUrl}/api/?folder=termsAndConditions&name=tcs.pdf`}
                    target="_blank"
                  >
                    agreement
                  </a>
                </Checkbox>
              </Form.Item>
              <Form.Item className="flex justify-end" {...tailFormItemLayout}>
                {submitting ? (
                  <Spin indicator={antIcon} />
                ) : (
                  <Button
                    className="bg-[#0065DD] border-none px-10 h-10 text-white"
                    type="default"
                    htmlType="submit"
                  >
                    Register
                  </Button>
                )}
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SignupForm;
