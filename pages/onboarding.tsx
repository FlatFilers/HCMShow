import { NextPage } from "next";
// import client from "@flatfile/api";

interface Props {}

const Onboarding: NextPage<Props> = () => {
  // const c = new client.DefaultApi();

  // c.addSpaceConfig;

  return (
    <div className="px-4 text-gray-900">
      <p>Onboarding Flow</p>

      <a
        className="underline"
        download={"sample-employees.csv"}
        href={"/sample-data/sample-employees.csv"}
      >
        Click here to download the sample data
      </a>

      <p>TODO: Tenant ID</p>

      <form action="/api/flatfile/create-space">
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default Onboarding;
