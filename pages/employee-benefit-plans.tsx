import { GetServerSideProps, NextPage } from "next";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import { useFlashMessages } from "../lib/hooks/usehooks";
import { prismaClient } from "../lib/prisma-client";

export type SerializeableEmployeeBenefitPlan = {
  id: string;
  employeeId: string;
  employeeName: string;
  benefitPlanId: string;
  benefitPlanName: string;
  currentlyEnrolled: boolean;
  coverageBeginDate: string;
  employeerContribution: number;
  benefitCoverageType: string;
};

interface Props {
  employeeBenefitPlans: SerializeableEmployeeBenefitPlan[];
}

const EmployeeBenefitPlans: NextPage<Props> = ({ employeeBenefitPlans }) => {
  const router = useRouter();

  useFlashMessages(router.query, "/employees");

  return (
    <div className="px-4 sm:px-6 lg:px-8 text-white">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold ">Employee Benefit Plans</h1>
          <p className="mt-2 text-sm text-gray-400">
            A list of all the employees in your account and the benefit plans
            they are subscribed to.{" "}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="ui-table min-w-full">
                <thead>
                  <tr>
                    <th scope="col">Employee ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Benefit Plan</th>
                    <th scope="col">Enrolled</th>
                    <th scope="col">Coverage Begin Date</th>
                    <th scope="col">Employer Contribution</th>
                    <th scope="col">Coverage Type</th>
                  </tr>
                </thead>
                <tbody>
                  {(!employeeBenefitPlans ||
                    employeeBenefitPlans.length === 0) && (
                    <tr>
                      <td colSpan={7} className="secondary">
                        No records
                      </td>
                    </tr>
                  )}

                  {employeeBenefitPlans.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/employees/${r.id}`}>{r.employeeId}</Link>
                      </td>
                      <td>{r.employeeName}</td>
                      <td>
                        <Link href={`/benefit-plans/${r.benefitPlanId}`}>
                          {r.benefitPlanName}
                        </Link>
                      </td>
                      <td>{r.currentlyEnrolled ? "Yes" : "No"}</td>
                      <td>{r.coverageBeginDate}</td>
                      <td>{r.employeerContribution}</td>
                      <td>{r.benefitCoverageType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = await getToken({
    req: context.req,
  });
  // console.log("gSSP token", token);

  if (!token) {
    console.log("No session token found");

    return {
      notFound: true,
    };
  }

  const dbEmployeeBenefitPlans =
    await prismaClient.employeeBenefitPlan.findMany({
      where: {
        employee: {
          organizationId: token.organizationId,
        },
      },
      orderBy: {
        employeeId: "asc",
      },
      include: {
        employee: true,
        benefitPlan: true,
      },
    });

  const employeeBenefitPlans = dbEmployeeBenefitPlans.map((r) => {
    return {
      id: r.employee.id,
      employeeId: r.employee.employeeId,
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      benefitPlanId: r.benefitPlan.id,
      benefitPlanName: r.benefitPlan.name,
      currentlyEnrolled: r.currentlyEnrolled,
      coverageBeginDate: DateTime.fromJSDate(r.coverageBeginDate).toFormat(
        "MM/dd/yyyy"
      ),
      employeerContribution: r.employeerContribution,
      benefitCoverageType: r.benefitCoverageType,
    };
  });

  return {
    props: {
      employeeBenefitPlans,
    },
  };
};

export default EmployeeBenefitPlans;
