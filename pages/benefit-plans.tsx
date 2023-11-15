import { GetServerSideProps, NextPage } from "next";
import { BenefitPlan, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";

interface Props {
  benefitPlans: BenefitPlan[];
}

const Jobs: NextPage<Props> = ({ benefitPlans }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 text-white">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold">Benefit Plans</h1>
          <p className="mt-2 text-sm text-gray-400">
            A list of all the benefitPlans in your account including its name
            and its ID.
          </p>
        </div>
      </div>
      <div className="my-8 w-10/12 h-5/6">
        <table className="ui-table w-full">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Benefit Plan ID</th>
            </tr>
          </thead>
          <tbody>
            {benefitPlans.map((benefitPlan) => (
              <tr key={benefitPlan.id}>
                <td>
                  <Link href={`/benefit-plans/${benefitPlan.id}`}>
                    {benefitPlan.name}
                  </Link>
                </td>
                <td className="secondary">{benefitPlan.slug}</td>
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

  const dbBenefitPlans: BenefitPlan[] = await prisma.benefitPlan.findMany({
    where: {
      organizationId: token.organizationId,
    },
  });

  const benefitPlans = dbBenefitPlans.map((benefitPlan) => {
    return {
      id: benefitPlan.id,
      name: benefitPlan.name,
      slug: benefitPlan.slug,
    };
  });

  return {
    props: {
      benefitPlans,
    },
  };
};

export default Jobs;
