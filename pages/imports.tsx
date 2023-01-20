import {
  AccessTokenResponse,
  Configuration,
  ConfigurationParameters,
  DefaultApi,
  GetAccessTokenOperationRequest,
  GetAccessTokenRequest,
} from "@flatfile/api";
import { PrismaClient, Space, prisma } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
// import client from "@flatfile/api";

interface Field {
  value: string | null;
  valid: boolean;
  message: [];
}

interface Props {
  records: {
    id: string;
    values: {
      endEmployementDate: Field;
      employeeId: Field;
      managerId: Field;
      employeeType: Field;
      hireDate: Field;
    };
  }[];
}

const Imports: NextPage<Props> = ({ records }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Imports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Your import history from Flatfile will show here.
          </p>
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
                  {records.map(({ id, values }) => {
                    const isAnyRecordinvalid = Object.values(values).some(
                      (value) => value.valid === false
                    );
                    console.log("isAnyRecordinvalid", isAnyRecordinvalid);

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
                            isAnyRecordinvalid
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {isAnyRecordinvalid ? "Error" : "Valid"}
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
  // TODO: Very duplicated, clean up later
  const configParams: ConfigurationParameters = {
    basePath,
  };
  const config: Configuration = new Configuration(configParams);
  const client = new DefaultApi(config);

  const getAccessTokenRequest: GetAccessTokenRequest = {
    clientId: process.env.FLATFILE_CLIENT_ID,
    secret: process.env.FLATFILE_CLIENT_SECRET,
  };

  const getAccessTokenOperationRequest: GetAccessTokenOperationRequest = {
    getAccessTokenRequest,
  };
  const accessTokenResponse: AccessTokenResponse = await client.getAccessToken(
    getAccessTokenOperationRequest
  );

  console.log("response", accessTokenResponse);

  if (!accessTokenResponse.data?.accessToken) {
    console.log("Error getting access token");
    return {
      props: {},
    };
  }

  const accessToken: string = accessTokenResponse.data.accessToken;

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
