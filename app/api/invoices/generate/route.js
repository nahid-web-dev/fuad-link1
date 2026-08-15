import { adminDb } from "@/lib/firebase";
import { getLightningInvoice, usdtToSats } from "@/lib/lib";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const OWNER = process.env.NEXT_PUBLIC_OWNER;
    console.log("owner", OWNER);
    // 2. Extract inputs from request body
    const { linkname, amount } = await req.json();

    const inflatedAmount = (Number(amount) + Number(amount) * 0.05).toFixed(2);

    if (!linkname || !amount) {
      return NextResponse.json({
        success: false,
        message: "linkname and amount are required.",
      });
    }

    // 3. Find the link to fetch its createdBy property
    const linkQuery = await adminDb
      .collection("links")
      .where("linkname", "==", linkname)
      .where("owner", "==", OWNER)
      .get();

    if (linkQuery.empty) {
      return NextResponse.json({
        success: false,
        message: "Link not found.",
      });
    }

    const linkData = linkQuery.docs[0].data();
    const generatedBy = linkData.createdBy;

    const walletQuery = await adminDb
      .collection("wallets")
      .where("owner", "==", OWNER)
      .get();

    const walletData = walletQuery.docs[0].data();

    const amountInSats = await usdtToSats(inflatedAmount);

    const invoice = await getLightningInvoice(walletData?.mail, amountInSats);

    // 4. Construct invoice schema
    const newInvoice = {
      generatedBy,
      amount: inflatedAmount,
      createdAt: new Date().toISOString(),
      owner: OWNER,
      statusLink: invoice?.verify || "",
      withdrawStatus: "--",
    };

    // 5. Save invoice to Firestore
    await adminDb.collection("invoices").add(newInvoice);

    return NextResponse.json({
      success: true,
      message: "Invoice created successfully.",
      link: invoice?.pr,
    });
  } catch (error) {
    console.error("Error creating invoice:", error?.message);
    return NextResponse.json({
      success: false,
      message: error?.message || "Internal server error!",
    });
  }
}
