import { NextApiRequest } from "next";

export const isNotAuthorized = ({ req }: { req: NextApiRequest }): boolean => {
  const serverAuthToken = req.headers["x-server-auth"];
  return !serverAuthToken || serverAuthToken !== process.env.SERVER_AUTH_TOKEN;
};
