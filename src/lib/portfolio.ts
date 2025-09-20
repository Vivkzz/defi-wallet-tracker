import { ethers } from 'ethers';

const erc20Abi = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function decimals() view returns (uint8)',
];

export const getTokenBalance = async (tokenAddress: string, ownerAddress: string, provider: ethers.providers.Provider) => {
  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await tokenContract.balanceOf(ownerAddress);
  const symbol = await tokenContract.symbol();
  const name = await tokenContract.name();
  const decimals = await tokenContract.decimals();
  return { balance, symbol, name, decimals, contractAddress: tokenAddress };
};

export const getAllTokens = async (address: string, apiKey: string) => {
  const url = `https://api.etherscan.io/api?module=account&action=addresstokenbalance&address=${address}&page=1&offset=100&apikey=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.status === "1") {
    return data.result;
  }
  return [];
};