import { polar } from "@/lib/polar";
import { NextResponse } from "next/server";

const planProductIds = {
  Basic: process.env.POLAR_BASIC_ID,
  Starter: process.env.POLAR_STARTER_ID,
  Pro: process.env.POLAR_PRO_ID,
  Unlimited: process.env.POLAR_UNLIMITED_ID,
};

export async function POST(request) {
  try {
    const { plan, email } = await request.json();

    if (!plan || !email) {
      return NextResponse.json(
        { error: "Missing required checkout arguments." },
        { status: 400 }
      );
    }

    const productId = planProductIds[plan];

    if (!productId) {
      return NextResponse.json(
        { error: `Checkout not configured for plan: ${plan}` },
        { status: 400 }
      );
    }

    const successUrl = process.env.POLAR_SUCCESS_URL;

    if (!successUrl) {
      return NextResponse.json(
        { error: "POLAR_SUCCESS_URL is not configured." },
        { status: 500 }
      );
    }

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl,
      customerEmail: email,
    });

    if (!checkout?.url) {
      return NextResponse.json(
        { error: "Failed to create Polar checkout session." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    console.error("Polar checkout creation failed:", error);
    return NextResponse.json(
      { error: "Unexpected error creating checkout session." },
      { status: 500 }
    );
  }
}
