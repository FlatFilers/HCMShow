import { GetServerSideProps, NextPage } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";

const employeeWithRelations = Prisma.validator<Prisma.EmployeeArgs>()({
  include: {
    manager: true,
  },
});

type EmployeeWithRelations = Prisma.EmployeeGetPayload<
  typeof employeeWithRelations
>;

interface Props {
  employee: any;
}

const Employees: NextPage<Props> = ({ employee }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 w-1/2">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Employee Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Employee personal details
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.employeeId}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.firstName} {employee.lastName}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Manager</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.manager && (
                  <div>
                    {employee.manager.firstName} {employee.manager.lastName}
                  </div>
                )}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Title</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.positionTitle}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Hire Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.hireDate}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">End Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.endEmploymentDate ? employee.endEmploymentDate : "-"}
              </dd>
            </div>
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Weekly Hours
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {employee.scheduledWeeklyHours}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const employeeId: string = context.params?.id as string;
  const prisma = new PrismaClient();

  const dbEmployee: EmployeeWithRelations | null =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        manager: true,
      },
    });

  let employee = null;
  if (dbEmployee) {
    employee = {
      ...dbEmployee,
      createdAt: DateTime.fromJSDate(dbEmployee.createdAt).toFormat(
        "MM/dd/yy hh:mm:ss a"
      ),
      updatedAt: DateTime.fromJSDate(dbEmployee.updatedAt).toFormat(
        "MM/dd/yy hh:mm:ss a"
      ),
      hireDate: DateTime.fromJSDate(dbEmployee.hireDate).toFormat("MM/dd/yyyy"),
      endEmploymentDate: dbEmployee.endEmploymentDate
        ? DateTime.fromJSDate(dbEmployee.endEmploymentDate).toFormat(
            "MM/dd/yyyy"
          )
        : null,
      manager: {
        ...dbEmployee.manager,
        createdAt: dbEmployee.manager
          ? DateTime.fromJSDate(dbEmployee.manager.createdAt).toFormat(
              "MM/dd/yy hh:mm:ss a"
            )
          : null,
        updatedAt: dbEmployee.manager
          ? DateTime.fromJSDate(dbEmployee.manager.updatedAt).toFormat(
              "MM/dd/yy hh:mm:ss a"
            )
          : null,
        hireDate: dbEmployee.manager?.hireDate
          ? DateTime.fromJSDate(dbEmployee.manager.hireDate).toFormat(
              "MM/dd/yyyy"
            )
          : null,
        endEmploymentDate: dbEmployee.manager?.endEmploymentDate
          ? DateTime.fromJSDate(dbEmployee.manager.endEmploymentDate).toFormat(
              "MM/dd/yyyy"
            )
          : null,
      },
    };
  }

  if (!employee) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      employee: employee,
    },
  };
};

export default Employees;
