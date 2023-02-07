import { GetServerSideProps, NextPage } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

type JobFamily = {
  id: string;
  name: string;
  effectiveDate: Date | null;
  summary: string | null;
  isInactive: boolean;
};

interface Props {
  job: JobFamily;
}

const Jobs: NextPage<Props> = ({ job }) => {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Job Information
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Job details</p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {job.name}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Start Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {job.effectiveDate?.toString()}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Summary</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {job.summary}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 my-auto">
              Status
            </dt>
            <dd
              className={`relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6
                           ${
                             job.isInactive ? "text-red-500" : "text-green-500"
                           }`}
            >
              {job.isInactive ? <div>Inactive</div> : <div>Active</div>}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const jobId: string = context.params?.id as string;
  const prisma = new PrismaClient();

  const job: JobFamily | null = await prisma.jobFamily.findFirst({
    where: {
      id: jobId,
    },
  });

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
