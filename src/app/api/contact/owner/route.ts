import { NextRequest, NextResponse } from "next/server";
import {
  CONTACT_ZALO_URL,
  CONTACT_MESSENGER_URL,
} from "@/lib/constants";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const message = request.nextUrl.searchParams.get("text");

  let link: string | null = null;

  switch (type) {
    case "zalo":
      link = CONTACT_ZALO_URL;
      if (message) link += `?text=${message}`;
      break;
    case "facebook":
      link = CONTACT_MESSENGER_URL;
      break;
    default:
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const response = NextResponse.redirect(link, 302);
  response.headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return response;
}
