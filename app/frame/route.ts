import { NextRequest, NextResponse } from "next/server";
import { getConnectedAddressForUser } from "@/utils/fc";
import { mintNft, balanceOf } from "@/utils/mint";
import { PinataFDK } from "pinata-fdk";

const fdk = new PinataFDK({
  pinata_jwt: process.env.PINATA_JWT as string,
  pinata_gateway: process.env.GATEWAY_URL as string,
});

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const frameMetadata = await fdk.getFrameMetadata({
      post_url: `${process.env.BASE_URL}/frame`,
      buttons: [{ label: "Mint NFT", action: "post" }],
      aspect_ratio: "1:1",
      cid: "QmNjEMqGKBcqfNRwx5xDoitXUHFfkM7N8nx6JLjHvbTMhR",
    });
    return new NextResponse(frameMetadata);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error });
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const body = await req.json();
  const fid = body.untrustedData.fid;
  const address = await getConnectedAddressForUser(fid);
  const balance = await balanceOf(address);
  const { isValid, message } = await fdk.validateFrameMessage(body);
  console.log(balance);
  if (typeof balance === "number" && balance !== null && balance < 1) {
    try {
      const mint = await mintNft(address);
      console.log(mint);
      const frameMetadata = await fdk.getFrameMetadata({
        post_url: `${process.env.BASE_URL}/redirect`,
        buttons: [
          { label: "Blog Tutorial", action: "post_redirect" },
          { label: "Video Tutorial", action: "post_redirect" },
        ],
        aspect_ratio: "1:1",
        cid: "QmNjEMqGKBcqfNRwx5xDoitXUHFfkM7N8nx6JLjHvbTMhR",
      });
      if (isValid) {
        await fdk.sendAnalytics("frame-mint-tutorial-mint", body);
      }

      return new NextResponse(frameMetadata);
    } catch (error) {
      console.log(error);
      return NextResponse.json({ error: error });
    }
  } else {
    const frameMetadata = await fdk.getFrameMetadata({
      post_url: `${process.env.BASE_URL}/redirect`,
      buttons: [
        { label: "Blog Tutorial", action: "post_redirect" },
        { label: "Video Tutorial", action: "post_redirect" },
      ],
      aspect_ratio: "1:1",
      cid: "QmNjEMqGKBcqfNRwx5xDoitXUHFfkM7N8nx6JLjHvbTMhR",
    });
    if (isValid) {
      await fdk.sendAnalytics("frame-mint-tutorial-mint", body);
    }

    return new NextResponse(frameMetadata);
  }
}

{
  "untrustedData": {
    "fid": 2,
    "url": "https://fcpolls.com/polls/1",
    "messageHash": "0xd2b1ddc6c88e865a33cb1a565e0058d757042974",
    "timestamp": 1706243218,
    "network": 1,
    "buttonIndex": 2,
    "inputText": "hello world", // "" if requested and no input, undefined if input not requested
    "castId": {
      "fid": 226,
      "hash": "0xa48dd46161d8e57725f5e26e34ec19c13ff7f3b9"
    }
  },
  "trustedData": {
    "messageBytes": "d2b1ddc6c88e865a33cb1a565e0058d757042974..."
  }
}
