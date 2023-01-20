import { signIn } from "next-auth/react";
import Head from "next/head";
import { FormEvent, ReactElement } from "react";
import { NextPageWithLayout } from "./_app";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const email = (
    event.currentTarget.elements.namedItem("email") as HTMLInputElement
  ).value;
  const password = (
    event.currentTarget.elements.namedItem("password") as HTMLInputElement
  ).value;

  signIn("credentials", { email, password, callbackUrl: "/employees" });
};

const Home: NextPageWithLayout = () => {
  const { error } = useRouter().query;
  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white h-screen">
      <div className="w-full max-w-md space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign in
          </h2>
        </div>
        {error && <div className="text-red-600 mx-auto">{error}</div>}
        <form className="mt-8 space-y-2" action="#" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="bg-white relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="bg-white relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="hidden h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="hidden ml-2 block text-sm text-gray-900 bg-white"
              >
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <LockClosedIcon
                  className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                  aria-hidden="true"
                />
              </span>
              Sign in
            </button>
          </div>

          <div className="text-sm">
            <a
              href="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500 mt-4 block text-right"
            >
              Or Signup
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Home;
