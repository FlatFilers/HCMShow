import { NextPage } from "next";
// import client from "@flatfile/api";

interface Props {}

const Onboarding: NextPage<Props> = () => {
  // const c = new client.DefaultApi();

  // c.addSpaceConfig;

  return (
    <div className="px-4 text-gray-900">
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
  );
};

export default Onboarding;
