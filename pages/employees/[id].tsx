import { GetServerSideProps, NextPage } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import { DateTime } from "luxon";
import { SerializeableEmployee } from "../employees";

const employeeWithRelations = Prisma.validator<Prisma.EmployeeArgs>()({
  include: {
    manager: true,
  },
});

type EmployeeWithRelations = Prisma.EmployeeGetPayload<
  typeof employeeWithRelations
>;

interface Props {
  employee: SerializeableEmployee;
}

const Employees: NextPage<Props> = ({ employee }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 w-1/2">
      <div className="ui-resource overflow-hidden">
        <div>
          <h3>
            {employee.firstName} {employee.lastName}
          </h3>
          <p>Employee personal details</p>
        </div>
        <div>
          <dl>
            <div>
              <dt>Employee ID</dt>
              <dd>{employee.employeeId}</dd>
            </div>
            <div>
              <dt>Manager</dt>
              <dd>
                {employee.manager && (
                  <div>
                    {employee.manager.firstName} {employee.manager.lastName}
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt>Title</dt>
              <dd>{employee.positionTitle}</dd>
            </div>
            <div>
              <dt>Hire Date</dt>
              <dd>{employee.hireDate}</dd>
            </div>
            <div>
              <dt>End Date</dt>
              <dd>
                {employee.endEmploymentDate ? employee.endEmploymentDate : "-"}
              </dd>
            </div>
            <div>
              <dt>Weekly Hours</dt>
              <dd>{employee.scheduledWeeklyHours}</dd>
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

  if (!dbEmployee) {
    return {
      notFound: true,
    };
  }

  const employee: SerializeableEmployee = {
    id: dbEmployee.id,
    employeeId: dbEmployee.employeeId,
    firstName: dbEmployee.firstName,
    lastName: dbEmployee.lastName,
    hireDate: DateTime.fromJSDate(dbEmployee.hireDate).toFormat("MM/dd/yyyy"),
    endEmploymentDate: dbEmployee.endEmploymentDate
      ? DateTime.fromJSDate(dbEmployee.endEmploymentDate).toFormat("MM/dd/yyyy")
      : null,
    positionTitle: dbEmployee.positionTitle,
    scheduledWeeklyHours: dbEmployee.scheduledWeeklyHours,
    manager: dbEmployee.manager
      ? {
          firstName: dbEmployee.manager.firstName,
          lastName: dbEmployee.manager.lastName,
        }
      : null,
  };

  return {
    props: {
      employee,
    },
  };
};

export default Employees;
