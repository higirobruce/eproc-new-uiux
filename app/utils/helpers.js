// export const formatAmount = (value) => {
//     return Intl.NumberFormat("en-US", {
//       style: "decimal",
//       maximumFractionDigits: 2,
//       minimumFractionDigits: 2
//     }).format(value);
//   };

export const formatAmount = (value) => {
  if (value >= 1000000000000) {
    return Math.round(value / 1000000000000) + "T";
  }
  else if (value >= 1000000000) {
    return Math.round(value / 1000000000) + "B";
  }
  else if (value >= 1000000) {
    return Math.round(value / 1000000) + "M";
  } else if (value >= 1000) {
    return Math.round(value / 1000) + "K";
  } else {
    return value;
  }
};
