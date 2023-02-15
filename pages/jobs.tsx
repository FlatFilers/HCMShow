import { GetServerSideProps, NextPage } from "next";
import { Job, Prisma, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";

interface Props {
  jobs: Job[];
}

const Jobs: NextPage<Props> = ({ jobs }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 h-screen w-screen">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Jobs</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the jobs in your account including its name, effective
            date, a summary, and its current status.
          </p>
        </div>
      </div>
      <div className="my-8 w-10/12 h-5/6 overflow-auto">
        <div className="border border-gray-100 rounded-l-lg">
          <table className="h-full w-full">
            <thead className="bg-gray-50 sticky inset-0 w-full h-20">
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
                  Start Date
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Summary
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Work Shift Required
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Public Job
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white w-full">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="text-blue-600 underline whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                    <Link href={`/jobs/${job.id}`}>{job.name}</Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {<div>{job.effectiveDate?.toLocaleString()}</div>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {job.summary ? job.summary?.slice(0, 40) + "..." : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {job.description
                      ? job.description?.slice(0, 40) + "..."
                      : ""}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {job.workShift ? "Yes" : "No"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {job.jobPublic ? "Yes" : "No"}
                  </td>
                  <td
                    className={`whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6
                             ${
                               job.isInactive
                                 ? "text-red-500"
                                 : "text-green-500"
                             }`}
                  >
                    {job.isInactive ? <div>Inactive</div> : <div>Active</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });

  if (!token) {
    console.log("No session token found");

    return {
      notFound: true,
    };
  }

  const prisma = new PrismaClient();

  const jobs: Job[] = await prisma.job.findMany();

  return {
    props: {
      jobs,
    },
  };
};

export default Jobs;
