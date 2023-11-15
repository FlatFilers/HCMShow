import { GetServerSideProps, NextPage } from "next";
import { Job, Prisma, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { DateTime } from "luxon";

type SerializeableJob = {
  id: string;
  name: string;
  department: string;
  effectiveDate: string;
  isInactive: boolean;
};

interface Props {
  jobs: SerializeableJob[];
}

const Jobs: NextPage<Props> = ({ jobs }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 text-white">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold">Jobs</h1>
          <p className="mt-2 text-sm text-gray-400">
            A list of all the jobs in your account including its name, effective
            date, a summary, and its current status.
          </p>
        </div>
      </div>

      <div className="my-8 w-10/12 h-5/6">
        <table className="ui-table w-full">
          <thead className="w-full">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Effective Date</th>
              <th scope="col">Department</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="w-full">
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>
                  <Link href={`/jobs/${job.id}`}>{job.name}</Link>
                </td>
                <td>{job.effectiveDate}</td>
                <td className="secondary">{job.department}</td>
                <td>
                  {job.isInactive ? <div>Inactive</div> : <div>Active</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

  const dbJobs: Job[] = await prisma.job.findMany({
    where: {
      organizationId: token.organizationId,
    },
  });

  const jobs: SerializeableJob[] = dbJobs.map((job) => {
    return {
      id: job.id,
      name: job.name,
      department: job.department,
      effectiveDate: DateTime.fromJSDate(job.effectiveDate).toFormat(
        "MM/dd/yyyy"
      ),
      isInactive: job.isInactive,
    };
  });

  return {
    props: {
      jobs,
    },
  };
};

export default Jobs;
