import { NextResponse } from "next/server";
import { resolveCheckoutSelection } from "@/lib/checkoutCatalog";
import { createRazorpayClient } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { service, plan, form } = body;
    const selection = resolveCheckoutSelection(service, plan);

    if (!selection) {
      return NextResponse.json({ error: "Invalid service or plan" }, { status: 400 });
    }

    const trustedForm = {
      ...form,
      reportType: selection.reportType,
    };

    const options = {
      amount: selection.amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        service: selection.service,
        plan: selection.plan,
        formData: JSON.stringify(trustedForm),
      },
    };

    const razorpay = createRazorpayClient();
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ ...order, checkout: selection });
  } catch (error: unknown) {
    console.error("Failed to create Razorpay order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
