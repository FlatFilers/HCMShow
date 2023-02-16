import { GetServerSideProps, NextPage } from "next";
import { Job, Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

interface Props {
  job: Job;
}

const Jobs: NextPage<Props> = ({ job }) => {
  return (
    <div className="h-screen overflow-auto">
      <div className="w-fit mr-8 mb-16 bg-white shadow sm:rounded-lg border border-gray-200">
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
              <dt className="text-sm font-medium text-gray-500">Effective Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {DateTime.fromJSDate(job.effectiveDate).toFormat("MM/dd/yyyy")}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Job Code Included in Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.includeJobCodeInName ? "Yes" : "No"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.title ? job.title : "None"}
              </dd>
            </div>
            {/* TODO: Truncate with expand and collapse for summary and description */}
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Summary</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.summary}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.description ? job.description : "None"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Additional Description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.additionalDescription ? job.additionalDescription : "None"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Workshift Required
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.workShift ? "Yes" : "No"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Job Public</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {job.jobPublic ? "Yes" : "No"}
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

  const job: Job | null = await prisma.job.findFirst({
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
