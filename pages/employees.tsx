import { GetServerSideProps, NextPage } from "next";
import { Prisma, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useEffect } from "react";

const employeeWithRelations = Prisma.validator<Prisma.EmployeeArgs>()({
  include: {
    manager: true,
    location: true,
  },
});

type EmployeeWithRelations = Prisma.EmployeeGetPayload<
  typeof employeeWithRelations
>;

interface Props {
  employees: EmployeeWithRelations[];
}



const Employees: NextPage<Props> = ({ employees }) => {
  const router = useRouter();

useEffect(() => {
  if (router.query.message === 'Synced records') {   
    window.history.replaceState(null, '', '/employees')
    toast.success('Synced records', {id: "synced"})
  } else if (router.query.message === 'No Records Found') {   
    window.history.replaceState(null, '', '/employees')
    toast.error('No Records Found', {id: "no-records"})
  }
}, []);
  
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
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Origin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        <Link href={`/employees/${employee.id}`}>
                          {employee.name}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.manager && (
                          <div>{employee.manager?.name}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.positionTitle}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {employee.location.name}
                      </td>
                      <td
                        className={`relative whitespace-nowrap py-4 pl-3 pr-4 text-sm font-medium sm:pr-6
                           ${
                             employee.flatfileRecordId ? "text-green-500" : ""
                           }`}
                      >
                        {employee.flatfileRecordId && <div>Flatfile</div>}
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

  const employees: EmployeeWithRelations[] = await prisma.employee.findMany({
    where: {
      organizationId: token.organizationId,
    },
    include: {
      manager: true,
      location: true,
    },
  });

  return {
    props: {
      employees,
    },
  };
};

export default Employees;
