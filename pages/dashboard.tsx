import { NextPage } from "next";
import { Session } from "next-auth";

const Dashboard: NextPage<{ session: Session }> = ({ session }) => {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl text-gray-900 mx-auto">
          <div className="font-semibold mt-6">
            Hello, welcome to the Dashboard
          </div>
          <div className="mt-16">
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 h-36">
                Section 1
              </div>
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                Section 2
              </div>
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                Section 3
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1">
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 h-72">
                Section 4
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 ">
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 h-36">
                Section 5
              </div>
            </div>
          </div>
        </h1>
      </div>
    </div>
  );
};

export default Dashboard;
