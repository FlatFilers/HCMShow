import { GetServerSideProps, NextPage } from "next";
import { Job, Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import { type } from "os";

type SerializeableJob = {
  name: string;
  department: string;
  effectiveDate: string;
  isInactive: boolean;
};

interface Props {
  job: SerializeableJob;
}

const Jobs: NextPage<Props> = ({ job }) => {
  return (
    <div className="h-screen overflow-auto">
      <div className="w-1/2 mr-8 mb-16 bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 bg-white border-b border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Job Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Job details</p>
        </div>
        <div className="px-4 py-5 sm:p-0 h-fit">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.name}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Effective Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.effectiveDate}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.department}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 my-auto">
                Status
              </dt>
              <dd
                className={`whitespace-nowrap py-4 pr-4 text-sm font-medium sm:pr-6
                             ${
                               job.isInactive
                                 ? "text-red-500"
                                 : "text-green-500"
                             }`}
              >
                {job.isInactive ? <div>Inactive</div> : <div>Active</div>}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const jobId: string = context.params?.id as string;
  const prisma = new PrismaClient();

  const dbJob: Job | null = await prisma.job.findFirst({
    where: {
      id: jobId,
    },
  });

  let job = null;
  if (dbJob) {
    job = {
      id: dbJob.id,
      name: dbJob.name,
      department: dbJob.department,
      effectiveDate: DateTime.fromJSDate(dbJob.effectiveDate).toFormat(
        "MM/dd/yyyy"
      ),
      isInactive: dbJob.isInactive,
    };
  }

  if (!job) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      job: job,
    },
  };
};

export default Jobs;
