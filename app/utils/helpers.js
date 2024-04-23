export const formatAmount = (value) => {
    return Intl.NumberFormat("en-US", {
      style: "decimal",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value);
  };