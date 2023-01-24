import { PrismaClient, Space } from "@prisma/client";
import { GetServerSideProps, NextPage } from "next";
import { getToken } from "next-auth/jwt";

interface Props {
  space?: Space;
}

const Onboarding: NextPage<Props> = ({ space }) => {
  return (
    <div className="px-4 text-gray-900">
      {!space && (
        <div>
          <p className="text-2xl mb-8">Onboarding Setup</p>

          <p className="mb-2">First, download the sample data below. 👇</p>

          <a
            className="hover:text-white mb-12 inline-flex items-center justify-center rounded-md border text-gray-900 border-indigo-600 px-4 py-2 text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            download={"sample-employees.csv"}
            href={"/sample-data/sample-employees.csv"}
          >
            Download sample data
          </a>

          <p className="mb-2">
            Next click the button below to begin your onboarding in Flatfile. 👇
          </p>

          <form action="/api/flatfile/create-space">
            <button
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
              type="submit"
            >
              Create Space
            </button>
          </form>
        </div>
      )}

      {space && (
        <div>
          <p className="text-2xl mb-8">Onboarding</p>

          <p className="mb-4">Visit your space below to upload records. 👇</p>

          <a
            href="#"
            className="mb-8 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Visit Space
          </a>

          <p className="text-sm block text-gray-600">
            To download the sample data again{" "}
            <a
              className="underline text-indigo-600"
              download={"sample-employees.csv"}
              href={"/sample-data/sample-employees.csv"}
            >
              click here.
            </a>
          </p>
        </div>
      )}
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
  const space = await prisma.space.findFirst({
    where: {
      userId: token.sub,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!space) {
    return {
      props: {},
    };
  }

  return {
    props: { space },
  };
};

export default Onboarding;
