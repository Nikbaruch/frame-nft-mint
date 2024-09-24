import { NextRequest, NextResponse } from "next/server";
import { getConnectedAddressForUser } from "@/utils/fc";
import { mintNft, balanceOf } from "@/utils/mint";
import { PinataFDK } from "pinata-fdk";

const fdk = new PinataFDK({
  pinata_jwt: process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2Y2M1YmU2NS1kODYxLTQ1ZTAtYWViNy04YTgzMDdjODRlYTAiLCJlbWFpbCI6Im5pY29sYXMubGFmYXkwMUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNmFkNzNiNzUyYTYyZTExNzgwMWQiLCJzY29wZWRLZXlTZWNyZXQiOiIyODgzNjRmNWQ1NTkyNWY1ZTg0Y2Y1NDg3NmI0YzI4NDIyNmY5ZjIwOTczYzFjYmFlZjdjYmIyMjhjYWQ2NzY2IiwiZXhwIjoxNzU4NTMwNDA0fQ.YJYYS55FrpUyQI8EXnV2KC-UFtJYJ3SFX1K9PS4cEqE as string,
  pinata_gateway: process.env.gold-intimate-ostrich-580.mypinata.cloud as string,
});

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const frameMetadata = await fdk.getFrameMetadata({
      post_url: `${process.env.https://frame-nft-mint-pied.vercel.app/}/frame`,
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
        post_url: `${process.env.https://frame-nft-mint-pied.vercel.app/}/redirect`,
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
      post_url: `${process.env.https://frame-nft-mint-pied.vercel.app/}/redirect`,
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
