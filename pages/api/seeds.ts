// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { main } from "../../lib/seeds/main";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // TODO: Hack to run seeds on Heroku
  // await main();

  res.status(200).json({ name: "John Doe" });
}
