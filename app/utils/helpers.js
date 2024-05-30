
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
    return value?.toString();
  }
};
