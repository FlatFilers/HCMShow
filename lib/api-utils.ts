import { NextApiRequest } from "next";

export const isNotAuthorized = ({ req }: { req: NextApiRequest }): boolean => {
  const listenerAuthToken = req.headers["x-listener-auth"];
  return (
    !listenerAuthToken || listenerAuthToken !== process.env.LISTENER_AUTH_TOKEN
  );
};
