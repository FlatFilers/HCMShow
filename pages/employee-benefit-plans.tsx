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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Employee Benefit Plans
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the employees in your account and the benefit plans
            they are subscribed to.{" "}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Employee ID
                    </th>
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
                      Benefit Plan
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Enrolled
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Coverage Begin Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Employer Contribution
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Coverage Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employeeBenefitPlans.map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link href={`/employees/${r.id}`}>{r.employeeId}</Link>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link href={`/employees/${r.id}`}>
                          {r.employeeName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <Link href={`/benefit-plans/${r.benefitPlanId}`}>
                          {r.benefitPlanName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {r.currentlyEnrolled ? "Yes" : "No"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {r.coverageBeginDate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {r.employeerContribution}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {r.benefitCoverageType}
                      </td>
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
