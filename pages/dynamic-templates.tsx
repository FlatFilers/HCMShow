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

// employeeType: FF.OptionField({
//   label: 'Employee Type',
//   description: "The worker's employee type.",
//   primary: false,
//   required: true,
//   unique: false,
//   options: {
//     ft: 'Full-Time',
//     pt: 'Part-Time',
//     tm: 'Temporary',
//     ct: 'Contract',
//   },
// }),

const initialOptions: { [key: string]: string } = {
  ft: "Full-Time",
  pt: "Part-Time",
  tm: "Temporary",
  ct: "Contract",
};

const DynamicTemplates: NextPageWithLayout<Props> = ({}) => {
  const [options, setOptions] = useState(initialOptions);

  return (
    <div className="ml-12 mt-16">
      <p className="text-2xl mb-2">Customize your workspace</p>
      <p className="mb-12">
        Adjust the field options below, then click Open Portal to add your data.
      </p>

      <div className="max-w-sm">
        <div className="flex flex-row justify-between items-center mb-2">
          <p className="w-1/2">Input value in sheet</p>
          <p className="w-1/2">Output value on record</p>
        </div>

        {Object.keys(options).map((key) => {
          return (
            <div className="flex flex-row justify-between items-center mb-2">
              <input
                type="text"
                value={key}
                className="border border-gray-200 rounded px-4 py-2 mr-2 w-1/2"
              />

              <input
                type="text"
                value={options[key]}
                className="border border-gray-200 rounded px-4 py-2 w-1/2"
              />

              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-gray-300 ml-2 cursor-pointer"
                onClick={() => {
                  setOptions((prev) => {
                    const newOptions = { ...prev };
                    delete newOptions[key];
                    return newOptions;
                  });
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          );
        })}

        <div
          onClick={() => {
            setOptions({...options, { "": "" }});
          }}
          className="flex flex-row items-center justify-start text-gray-400 text-sm cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m6-6H6"
            />
          </svg>

          <p>New Option</p>
        </div>
      </div>
    </div>
  );
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
