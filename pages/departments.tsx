import { GetServerSideProps, NextPage } from "next";
import { Department, Prisma, PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import { useFlashMessages } from "../lib/hooks/usehooks";

export type SerializeableDepartment = {
  id: string;
  departmentName: string;
  departmentCode: string;
};

interface Props {
  departments: SerializeableDepartment[];
}

const Departments: NextPage<Props> = ({ departments }) => {
  const router = useRouter();

  useFlashMessages(router.query, "/departments");

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Departments</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the deparments in your account
          </p>

          <p className="mt-2 text-sm text-gray-700">
            These are accessible via the API at{" "}
            <a href="/api/v1/departments">`/api/v1/departments`</a> provided the
            correct secret key. See <a href="#">the api docs</a> for more
            information.
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
                      Department ID
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Department Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Department Code
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {departments.map((department) => (
                    <tr key={department.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {department.id}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {department.departmentName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {department.departmentCode}
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

  // TODO: Do we scope to organization?
  const dbDepartment: Department[] = await prisma.department.findMany();

  const departments: SerializeableDepartment[] = dbDepartment.map(
    (department) => {
      return {
        id: department.id,
        departmentName: department.departmentName,
        departmentCode: department.departmentCode,
      };
    }
  );

  return {
    props: {
      departments,
    },
  };
};

export default Departments;
