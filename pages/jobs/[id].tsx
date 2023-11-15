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
      <div className="ui-resource w-1/2 mr-8 mb-16">
        <div>
          <h3>{job.name}</h3>
          <p>Job details</p>
        </div>
        <div>
          <dl>
            <div>
              <dt>Effective Date</dt>
              <dd>{job.effectiveDate}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{job.department}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
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

  if (!dbJob) {
    return {
      notFound: true,
    };
  }

  const job = {
    id: dbJob.id,
    name: dbJob.name,
    department: dbJob.department,
    effectiveDate: DateTime.fromJSDate(dbJob.effectiveDate).toFormat(
      "MM/dd/yyyy"
    ),
    isInactive: dbJob.isInactive,
  };

  return {
    props: {
      job,
    },
  };
};

export default Jobs;
