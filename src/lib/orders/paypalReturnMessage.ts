export function buildPayPalReturnMessage(input: {
  token: string | null;
  payerId: string | null;
  status: string;
}) {
  return {
    type: "paypal:return" as const,
    token: input.token,
    payerId: input.payerId,
    status: input.status,
  };
}
