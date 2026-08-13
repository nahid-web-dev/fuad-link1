import axios from "axios";

export async function usdtToSats(usdtAmount) {
  console.log("reached inside usdttosats");
  // Fetch current BTC price in USDT from Binance (or CoinGecko)
  const response = await axios.get(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  );
  console.log("reached after usdttosats api call");
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

  console.log("reached inside getlightninginvoice");

  // Step 1: Resolve the LNURL-pay endpoint
  const lnurlUrl = `https://${domain}/.well-known/lnurlp/${username}`;

  // Axios automatically parses JSON and throws an error for non-2xx status codes
  const { data: lnurlData } = await axios.get(lnurlUrl);

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

  console.log("reached end of getlightninginvoice");

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

  // Returns the BOLT11 invoice string (starts with lnbc...)
  return invoiceData;
}
