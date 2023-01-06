import { GetServerSideProps, NextPage } from "next";
import { Employee, PrismaClient } from "@prisma/client";
import Link from "next/link";

interface Props {
  employees: Employee[];
}

const Employees: NextPage<Props> = ({ employees }) => {
  return (
    <div>
      {(!employees || employees.length === 0) && (
        <div>
          <p>No employees</p>
        </div>
      )}

      {employees &&
        employees.length > 0 &&
        employees.map((employee) => {
          return (
            <Link href={`/employees/${employee.id}`}>
              <p>ID: {employee.id}</p>
            </Link>
          );
        })}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const prisma = new PrismaClient();

  const employees: Employee[] = await prisma.employee.findMany();

  return {
    props: {
      employees,
    },
  };
};

export default Employees;
