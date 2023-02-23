import { Action } from "@prisma/client";
import { useState, FormEvent } from "react";
import toast from "react-hot-toast";

import { Event } from "./event";

type Props = {
  actions: Action[];
};

export const Events = ({ actions }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let defaultText = "Simulate File Feed Event";
  const [buttonText, setButtonText] = useState<string>(defaultText);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    setButtonText("Simulating...");
  };

  return (
    <div className="w-full">
      <p className="text-2xl mb-2">Ready and listening for files. 🎉 </p>

      <p className="text-gray-600 mb-4 max-w-lg">
        Next, click the button below to simulate a file upload occurring.
      </p>

      <form
        action="/api/flatfile/create-filefeed-event"
        onSubmit={handleSubmit}
        className="mb-8"
      >
        <button
          onClick={() => toast.loading("Simulating event...")}
          disabled={isSubmitting}
          className={`${
            isSubmitting
              ? "bg-primary-dark hover:cursor-not-allowed"
              : "bg-primary hover:bg-primary-dark "
          } inline-flex items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto}`}
          type="submit"
        >
          {buttonText}
        </button>
      </form>

      <div className="border-1 border border-gray-100 my-6"></div>

      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="w-20 py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Status
            </th>
            <th
              scope="col"
              className="w-48 px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Result
            </th>
            <th
              scope="col"
              className="w-48 px-6 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              When
            </th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a, i) => {
            const metadata = a.metadata as {
              state: string;
              description: string;
            };
            const state = metadata.state;

            return (
              <tr key={i}>
                <Event action={a} />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
