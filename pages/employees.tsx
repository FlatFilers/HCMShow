import { GetServerSideProps, NextPage } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import { useFlashMessages } from "../lib/hooks/usehooks";

const employeeWithRelations = Prisma.validator<Prisma.EmployeeArgs>()({
  include: {
    manager: true,
  },
});

type EmployeeWithRelations = Prisma.EmployeeGetPayload<
  typeof employeeWithRelations
>;

interface Props {
  employees: any[];
}

const Employees: NextPage<Props> = ({ employees }) => {
  const router = useRouter();

  useFlashMessages(router.query, "/employees");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the employees in your account including their name,
            manager, title, and location.
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
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Manager
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Hire Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      End Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Weekly Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link href={`/employees/${employee.id}`}>
                          {employee.firstName} {employee.lastName}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.manager && (
                          <div>
                            {employee.manager.firstName}{" "}
                            {employee.manager.lastName}
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.positionTitle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.hireDate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.endEmploymentDate
                          ? employee.endEmploymentDate
                          : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.scheduledWeeklyHours}
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

  const prisma = new PrismaClient();

  const dbEmployees: EmployeeWithRelations[] = await prisma.employee.findMany({
    where: {
      organizationId: token.organizationId,
    },
    include: {
      manager: true,
    },
  });

  let employees = null;
  if (dbEmployees) {
    employees = dbEmployees.map((employee) => {
      return {
        ...employee,
        createdAt: DateTime.fromJSDate(employee.createdAt).toFormat(
          "MM/dd/yy hh:mm:ss a"
        ),
        updatedAt: DateTime.fromJSDate(employee.updatedAt).toFormat(
          "MM/dd/yy hh:mm:ss a"
        ),
        hireDate: DateTime.fromJSDate(employee.hireDate).toFormat("MM/dd/yyyy"),
        endEmploymentDate: employee.endEmploymentDate
          ? DateTime.fromJSDate(employee.endEmploymentDate).toFormat(
              "MM/dd/yyyy"
            )
          : null,
        manager: {
          ...employee.manager,
          createdAt: employee.manager
            ? DateTime.fromJSDate(employee.manager.createdAt).toFormat(
                "MM/dd/yy hh:mm:ss a"
              )
            : null,
          updatedAt: employee.manager
            ? DateTime.fromJSDate(employee.manager.updatedAt).toFormat(
                "MM/dd/yy hh:mm:ss a"
              )
            : null,
          hireDate: employee.manager
            ? DateTime.fromJSDate(employee.manager.hireDate).toFormat(
                "MM/dd/yyyy"
              )
            : null,
        },
      };
    });
  }

  return {
    props: {
      employees,
    },
  };
};

export default Employees;
