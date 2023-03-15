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
import { OptionBuilder } from "../components/dynamic-templates/option-builder";

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

export interface Option {
  id: number;
  input: string;
  output: string;
}

const initialOptions: Option[] = [
  { id: 1, input: "ft", output: "Full-Time" },
  { id: 2, input: "pt", output: "Part-Time" },
  { id: 3, input: "tm", output: "Temporary" },
  { id: 4, input: "ct", output: "Contract" },
];

const DynamicTemplates: NextPageWithLayout<Props> = ({}) => {
  const [options, setOptions] = useState(initialOptions);

  return (
    <div className="ml-12 mt-16">
      <p className="text-2xl mb-2">Customize your workspace</p>
      <p className="mb-12">
        Adjust the field options below, then click Open Portal to add your data.
      </p>

      <OptionBuilder
        options={options.sort((a, b) => a.id - b.id)}
        updateInput={(option, value) => {
          const filteredOptions = options.filter((o) => {
            return o.id !== option.id;
          });

          setOptions([...filteredOptions, { ...option, input: value }]);
        }}
        updateOutput={(option, value) => {
          const filteredOptions = options.filter((o) => {
            return o.id !== option.id;
          });

          setOptions([...filteredOptions, { ...option, output: value }]);
        }}
        addNewOption={() => {
          const maxId = options.reduce((max, option) => {
            return Math.max(max, option.id);
          }, 0);

          setOptions([...options, { id: maxId + 1, input: "", output: "" }]);
        }}
        removeOption={(option) => {
          const filteredObjects = options.filter((o) => {
            return o.id !== option.id;
          });

          setOptions(filteredObjects);
        }}
      />
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
