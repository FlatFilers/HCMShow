import { GetServerSideProps, NextPage } from "next";
import { BenefitPlan, PrismaClient } from "@prisma/client";

interface Props {
  benefitPlan: BenefitPlan;
}

const BenefitPlans: NextPage<Props> = ({ benefitPlan }) => {
  return (
    <div className="overflow-auto">
      <div className="ui-resource">
        <div>
          <h3>{benefitPlan.name}</h3>
          <p>Benefit plan details</p>
        </div>
        <div>
          <dl>
            <div>
              <dt>Benefit Plan ID</dt>
              <dd>{benefitPlan.slug}</dd>
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
      id: dbBbenefitPlan.id,
      name: dbBbenefitPlan.name,
      slug: dbBbenefitPlan.slug,
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
