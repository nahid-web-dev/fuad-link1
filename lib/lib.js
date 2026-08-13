import axios from "axios";

export async function usdtToSats(usdtAmount) {
  // Fetch current BTC price in USDT from Binance (or CoinGecko)
  const response = await axios.get(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  );
  const btcPriceInUsdt = parseFloat(response.data.price);

  // Conversion: (USDT / BTC_Price) * 100,000,000 sats per BTC
  const btcAmount = usdtAmount / btcPriceInUsdt;
  const satoshis = Math.round(btcAmount * 100000000);

  return satoshis;
}

export async function getLightningInvoice(lightningAddress, satoshis) {
  const [username, domain] = lightningAddress.split("@");

  if (!username || !domain) {
    throw new Error("Invalid Lightning Address format");
  }

  // Step 1: Resolve the LNURL-pay endpoint
  const lnurlUrl = `https://${domain}/.well-known/lnurlp/${username}`;

  // Axios automatically parses JSON and throws an error for non-2xx status codes
  const { data: lnurlData } = await axios.get(lnurlUrl);
  console.log(lnurlData);

  // Convert satoshis to millisatoshis
  const amountMsats = satoshis * 1000;

  // Validate limits set by the wallet
  if (
    amountMsats < lnurlData.minSendable ||
    amountMsats > lnurlData.maxSendable
  ) {
    throw new Error(
      `Amount must be between ${lnurlData.minSendable / 1000} and ${lnurlData.maxSendable / 1000} sats.`,
    );
  }

  // Step 2: Request the invoice from the callback URL
  // Axios handles query parameters using the `params` option
  const { data: invoiceData } = await axios.get(lnurlData.callback, {
    params: {
      amount: amountMsats,
    },
  });

  if (invoiceData.status === "ERROR") {
    throw new Error(invoiceData.reason);
  }

  console.log(invoiceData);

  // Returns the BOLT11 invoice string (starts with lnbc...)
  return invoiceData;
}
