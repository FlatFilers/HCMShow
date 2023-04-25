import { signIn } from "next-auth/react";
import Head from "next/head";
import { FormEvent, ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";
import { LockClosedIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/router";
import Image from "next/image";
import { homeNavItem } from "../components/sidebar-layout";

const Signup: NextPageWithLayout = () => {
  const router = useRouter();
  const { error } = router.query;
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
    const firstName = (
      event.currentTarget.elements.namedItem("first-name") as HTMLInputElement
    ).value;
    const lastName = (
      event.currentTarget.elements.namedItem("last-name") as HTMLInputElement
    ).value;
    const companyName = (
      event.currentTarget.elements.namedItem("company-name") as HTMLInputElement
    ).value;

    const homeItem = homeNavItem(router);

    signIn("credentials", {
      email,
      password,
      firstName,
      lastName,
      companyName,
      isSignup: true,
      callbackUrl: homeItem.href,
    });
  };

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="relative flex flex-col items-center w-full">
          <div className="relative h-20 w-44">
            <Image
              className=""
              src={"/images/hcm_logo.png"}
              alt="Your Company"
              fill={true}
              sizes="(max-width: 768px) 100vw,
                (max-width: 1200px) 50vw,
                33vw"
              priority
            />
          </div>
          <p className="mt-4 text-gray-500 text-center text-md">
            Create your account
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
                className="bg-white relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div className="flex flex-row items-center">
              <div className="w-1/2">
                <label htmlFor="first-name" className="sr-only">
                  First name
                </label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  required
                  className="bg-white relative block w-full appearance-none rounded-none border-r-0 border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  placeholder="First name"
                />
              </div>
              <div className="w-1/2">
                <label htmlFor="last-name" className="sr-only">
                  Last name
                </label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  required
                  className="bg-white relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="company-name" className="sr-only">
                Company name
              </label>
              <input
                id="company-name"
                name="company-name"
                type="text"
                required
                className="bg-white relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                placeholder="Company name"
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
                className="bg-white relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
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
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
                  ? "bg-primary-dark hover:cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark"
              } group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2`}
            >
              {buttonText}
            </button>
          </div>

          <div className="text-sm">
            <a
              href="/"
              className="font-medium text-primary hover:text-primary-dark mt-4 text-right block"
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
