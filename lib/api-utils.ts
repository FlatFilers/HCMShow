import { NextApiRequest } from "next";

export const isNotAuthorized = ({ req }: { req: NextApiRequest }): boolean => {
  const serverAuthToken = req.headers["x-server-auth"];
  const listenerAuthToken = req.headers["x-listener-auth"];

  if (listenerAuthToken) {
    return listenerAuthToken !== process.env.LISTENER_AUTH_TOKEN;
  } else if (serverAuthToken) {
    return serverAuthToken !== process.env.SERVER_AUTH_TOKEN;
  } else {
    return true;
  }
};
