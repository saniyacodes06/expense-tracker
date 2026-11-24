const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

export function formatINR(value: number | string) {
  return inr.format(Number(value));
}

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-IN");
}
