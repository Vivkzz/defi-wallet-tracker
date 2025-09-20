const COVALENT_API_KEY = "cqt_rQGcQ4Wf3vK7Rxh3bvmxggyfP4xT";

export const getPortfolio = async (address: string, chain: string) => {
  const url = `https://api.covalenthq.com/v1/${chain}/address/${address}/balances_v2/?key=${COVALENT_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error_message);
  }
  return data.data;
};