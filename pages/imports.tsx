import { PrismaClient, Space, prisma } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { useState } from "react";
import getAccessToken from "../lib/flatfile";
import React from "react";
// import client from "@flatfile/api";

interface Field {
  value: string | null;
  valid: boolean;
  message: [];
}

interface Record {
  id: string;
  values: {
    endEmployementDate: Field;
    employeeId: Field;
    managerId: Field;
    employeeType: Field;
    hireDate: Field;
  };
}

interface Props {
  records: Record[];
}

type FilterTypes = "All" | "Valid" | "Error";

const Imports: NextPage<Props> = ({ records }) => {
  const [filterSelected, setFilterSelected] = useState<FilterTypes>("All");

  let isAnyRecordInvalid = (values: object) =>
    Object.values(values).some((value: Field) => value.valid === false);

  let getRecordsBasedOnStatus = (records: Record[], filterSelected: string) => {
    if (filterSelected === "Valid") {
      return records.filter((record: Record) =>
        Object.values(record.values).every(
          (value: Field) => value.valid === true
        )
      );
    } else {
      return records.filter((record: Record) =>
        isAnyRecordInvalid(record.values)
      );
    }
  };

  let filteredRecords = () => {
    if (filterSelected === "All") {
      return records;
    } else {
      return getRecordsBasedOnStatus(records, filterSelected);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="w-full flex flex-row justify-between items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Imports</h1>
            <p className="mt-2 text-sm text-gray-700">
              Your import history from Flatfile will show here.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <form action="/api/sync-records" method="post">
              <button
                type="submit"
                className="w-32 bg-indigo-600 hover:bg-indigo-700 group relative flex justify-center rounded-md border border-transparent py-2 px-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 mb-2"
              >
                Sync Records
              </button>
            </form>

            <p className="text-xs text-gray-400">
              Last sync 1/23/23 12:45:04PM
            </p>
          </div>
        </div>
      </div>
      <div className="text-gray-800 pt-10 w-full flex flex-row">
        <div className="ml-auto self-end flex flex-row align-middle">
          <div className="align-middle my-auto mr-4 text-sm font-semibold text-gray-900">
            Status
          </div>
          <select
            className="rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={filterSelected}
            onChange={(e) => setFilterSelected(e.target.value as FilterTypes)}
          >
            <option className="relative top-10" value="All">
              All
            </option>
            <option value="Valid">Valid</option>
            <option value="Error">Error</option>
          </select>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Manager
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      End Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredRecords().map(({ id, values }) => {
                    return (
                      <tr key={id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {values.employeeId.value}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {values.managerId && (
                            <div>{values.managerId.value}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {values.employeeType.value}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {values.hireDate.value}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {values.endEmployementDate.value}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm text-gray-500 ${
                            isAnyRecordInvalid(values)
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {isAnyRecordInvalid(values) ? "Error" : "Valid"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const basePath: string = "https://api.x.flatfile.com/v1";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const accessToken = await getAccessToken();

  // fetch the records
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const prisma = new PrismaClient();
  const space: Space = (await prisma.space.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  })) as Space;

  console.log("space", space);

  const { workbookId, sheetId } = await getWorkbookIdAndSheetId(
    space.flatfileSpaceId,
    headers
  );

  const recordsResponse = await fetch(
    `${basePath}/workbooks/${workbookId}/sheets/${sheetId}/records`,
    {
      method: "GET",
      headers: headers,
    }
  );

  console.log("recordsResponse", recordsResponse);

  if (!recordsResponse.ok) {
    console.log("Error getting space");
    return {
      props: {},
    };
  }

  const recordsResult = await recordsResponse.json();

  console.log("recordsResult", recordsResult);

  const records = recordsResult.data.records;

  console.log("records", records);
  console.log("records emp", records[0].values.employeeId);
  console.log("records man", records[0].values.managerId);
  console.log("records type", records[0].values.employeeType);
  console.log("records hiredate", records[0].values.hireDate);
  console.log("records end emp date", records[0].values.endEmployementDate);

  return {
    props: {
      records,
    },
  };
};

const getWorkbookIdAndSheetId = async (
  flatfileSpaceId: string,
  headers: any
): Promise<{ workbookId: string; sheetId: string }> => {
  const response = await fetch(
    `${basePath}/workbooks?spaceId=${flatfileSpaceId}`,
    {
      method: "GET",
      headers,
    }
  );

  console.log("getWorkbooks response", response);

  const result = await response.json();

  // TODO: Assuming just 1 of each. Maybe ok for this demo case?
  console.log("workbooks", result["data"].length);
  console.log("sheet", result["data"][0]["sheets"].length);

  return {
    workbookId: result["data"][0]["id"],
    sheetId: result["data"][0]["sheets"][0]["id"],
  };
};

export default Imports;
