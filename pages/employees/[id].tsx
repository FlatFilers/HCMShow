import { GetServerSideProps, NextPage } from "next";
import { Prisma, PrismaClient } from "@prisma/client";

const employeeWithRelations = Prisma.validator<Prisma.EmployeeArgs>()({
  include: {
    manager: true,
  },
});

type EmployeeWithRelations = Prisma.EmployeeGetPayload<
  typeof employeeWithRelations
>;

interface Props {
  employee: EmployeeWithRelations;
}

const Employees: NextPage<Props> = ({ employee }) => {
  return (
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
        </dl>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const employeeId: string = context.params?.id as string;
  const prisma = new PrismaClient();

  const employee: EmployeeWithRelations | null =
    await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        manager: true,
      },
    });

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
