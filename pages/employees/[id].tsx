import { GetServerSideProps, NextPage } from "next";
import { Employee, PrismaClient } from "@prisma/client";

interface Props {
  employee: Employee;
}

const Employees: NextPage<Props> = ({ employee }) => {
  return (
    <div>
      {!employee && (
        <div>
          <p>No employee found</p>
        </div>
      )}

      {employee && (
        <div>
          <p>ID: {employee.id}</p>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const employeeId: string = context.params?.id as string;
  const prisma = new PrismaClient();

  const employee: Employee | null = await prisma.employee.findUnique({
    where: {
      id: employeeId,
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
