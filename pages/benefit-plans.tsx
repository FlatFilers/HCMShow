import { GetServerSideProps, NextPage } from "next";
import { BenefitPlan, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";

interface Props {
  benefitPlans: BenefitPlan[];
}

const Jobs: NextPage<Props> = ({ benefitPlans }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Benefit Plans</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the benefitPlans in your account including its name
            and its ID.
          </p>
        </div>
      </div>
      <div className="my-8 w-10/12 h-5/6">
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
                  Benefit Plan ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white w-full">
              {benefitPlans.map((benefitPlan) => (
                <tr key={benefitPlan.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                    <Link href={`/benefit-plans/${benefitPlan.id}`}>
                      {benefitPlan.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {benefitPlan.slug}
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

  const benefitPlans: BenefitPlan[] = await prisma.benefitPlan.findMany();

  return {
    props: {
      benefitPlans,
    },
  };
};

export default Jobs;
