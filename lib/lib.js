import axios from "axios";

export async function usdtToSats(usdtAmount) {
  const response = await fetch(
    "https://api.coinbase.com/v2/prices/BTC-USD/spot",
    {
      // Caches the price on the server for 60 seconds before fetching a new one
      next: { revalidate: 60 },
    },
  );

  if (!response.ok) {
    throw new Error(`Coinbase API error: ${response.status}`);
  }

  const data = await response.json();
  const btcPriceInUsd = parseFloat(data.data.amount);

  const btcAmount = Number(usdtAmount) / btcPriceInUsd;

  // Always round UP so the user never pays less
  return Math.ceil(btcAmount * 100000000);
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

  // Returns the BOLT11 invoice string (starts with lnbc...)
  return invoiceData;
}
