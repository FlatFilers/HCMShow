import { NextPageWithLayout } from "./_app";
import { useState, useCallback, useEffect } from "react";
import { useSpace, ISpaceConfig } from "@flatfile/react";
import { GetServerSideProps } from "next";
import { getToken } from "next-auth/jwt";
import {
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { getAccessToken } from "../lib/flatfile";
import { Action, PrismaClient, Space } from "@prisma/client";
import { DateTime } from "luxon";
import toast from "react-hot-toast";
import { SpaceType } from "../lib/space";
import { FlatfileSpaceData } from "../lib/flatfile";
import { useRouter } from "next/router";

interface Props {}

const DynamicTemplates: NextPageWithLayout<Props> = ({}) => {
  return <div>hi</div>;
};

// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const token = await getToken({
//     req: context.req,
//   });

//   if (!token) {
//     console.log("No session token found");

//     return {
//       notFound: true,
//     };
//   }

//   return {};
// };

export default DynamicTemplates;
