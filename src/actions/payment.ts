"use server";
import lemonSqueezyClient from "@/lib/axios";

export const buySubscription = async (buyUserId: string) => {
  if (!process.env.LEMON_SQUEEZY_API_KEY) {
    console.error("Missing LEMON_SQUEEZY_API_KEY");
    return { status: 500, error: "Payment configuration error: Missing API Key" };
  }
  if (!process.env.LEMON_SQUEEZY_STORE_ID) {
    console.error("Missing LEMON_SQUEEZY_STORE_ID");
    return { status: 500, error: "Payment configuration error: Missing Store ID" };
  }
  if (!process.env.LEMON_SQUEEZY_VARIANT_ID) {
    console.error("Missing LEMON_SQUEEZY_VARIANT_ID");
    return { status: 500, error: "Payment configuration error: Missing Variant ID" };
  }

  try {
    const res = await lemonSqueezyClient(
      process.env.LEMON_SQUEEZY_API_KEY
    ).post("/checkouts", {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              buyerUserId: buyUserId,
            },
          },
          product_options: {},
          redirect_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
        },
        relationships: {
          store: {
            data: {
              type: "stores",
              id: process.env.LEMON_SQUEEZY_STORE_ID,
            },
          },
          variant: {
            data: {
              type: "variants",
              id: process.env.LEMON_SQUEEZY_VARIANT_ID,
            },
          },
        },
      },
    });

    const checkoutUrl = res.data.data.attributes.url;
    return { url: checkoutUrl, status: 200 };
  } catch (error) {
    console.error("• ERROR", error);
    return { message: "Internal Server Error", status: 500 };
  }
};
