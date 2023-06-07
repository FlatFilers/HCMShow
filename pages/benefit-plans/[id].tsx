import { GetServerSideProps, NextPage } from "next";
import { BenefitPlan, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

interface Props {
  benefitPlan: BenefitPlan;
}

const BenefitPlans: NextPage<Props> = ({ benefitPlan }) => {
  return (
    <div className="overflow-auto">
      <div className="w-[50%] mr-8 mb-16 bg-white shadow sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 bg-white border-b border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            BenefitPlan Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            BenefitPlan details
          </p>
        </div>
        <div className="px-4 py-5 sm:p-0 h-fit">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {benefitPlan.name}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Benefit Plan ID
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {benefitPlan.slug}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const benefitPlanId: string = context.params?.id as string;
  const prisma = new PrismaClient();

  const dbBbenefitPlan: BenefitPlan | null = await prisma.benefitPlan.findFirst(
    {
      where: {
        id: benefitPlanId,
      },
    }
  );

  let benefitPlan = null;
  if (dbBbenefitPlan) {
    benefitPlan = {
      ...dbBbenefitPlan,
      createdAt: DateTime.fromJSDate(dbBbenefitPlan.createdAt).toFormat(
        "MM/dd/yy hh:mm:ss a"
      ),
      updatedAt: DateTime.fromJSDate(dbBbenefitPlan.updatedAt).toFormat(
        "MM/dd/yy hh:mm:ss a"
      ),
    };
  }

  if (!benefitPlan) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      benefitPlan: benefitPlan,
    },
  };
};

export default BenefitPlans;
