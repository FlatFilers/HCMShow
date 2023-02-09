import { signIn } from "next-auth/react";
import Head from "next/head";
import { FormEvent, ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import Image from "next/image";
import logo from "../public/hcm_show_clear.png";

const Signup: NextPageWithLayout = () => {
  const { error } = useRouter().query;
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Create My Account");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setButtonText("Signing up...");

    const email = (
      event.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      event.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;

    signIn("credentials", {
      email,
      password,
      isSignup: true,
      callbackUrl: "/onboarding",
    });
  };

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="mb-8">
          <Image
            className="mx-auto"
            src={logo}
            alt="Your Company"
            width={200}
            height={200}
          />
          <p className="mt-4 text-gray-500 text-center text-sm">
            Create a new account below.
          </p>
        </div>
        <form className="mt-4 space-y-2" action="#" onSubmit={handleSubmit}>
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

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
            <div className="hidden items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? "bg-indigo-400"
                  : "bg-primary hover:bg-indigo-700 "
              } group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              {buttonText}
            </button>
          </div>

          <div className="text-sm">
            <a
              href="/"
              className="font-medium text-primary hover:text-indigo-500 mt-4 text-right block"
            >
              Or Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

Signup.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default Signup;
