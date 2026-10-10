export const formatINR = (value) => {
  const numericValue = Number(value ?? 0);
  const amount = Number.isFinite(numericValue) ? numericValue : 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
