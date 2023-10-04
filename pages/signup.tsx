import { signIn } from "next-auth/react";
import { FormEvent, ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";
import { useRouter } from "next/router";
import { homeNavItem } from "../components/sidebar-layout";
import SVG from "react-inlinesvg";

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
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-screen bg-[#1E2535]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center w-full">
          <SVG src="/images/hcm-logo.svg" />
          <p className="mt-8 text-white text-center text-xl">
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
                className="bg-white relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-gray-400 sm:text-sm"
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
                  className="bg-white relative block w-full appearance-none rounded-none border-r-0 border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-gray-400 sm:text-sm"
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
                  className="bg-white relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-gray-400 sm:text-sm"
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
                className="bg-white relative block w-full appearance-none rounded-none border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-gray-400 sm:text-sm"
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
                className="bg-white relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-gray-400 sm:text-sm"
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
                className="h-4 w-4 rounded border-gray-300 text-gray-400 focus:ring-gray-400"
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
              className={`button-bg group relative flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2`}
            >
              {buttonText}
            </button>
          </div>

          <div className="text-sm">
            <a
              href="/"
              className="font-medium text-gray-400 mt-4 text-right block underline"
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
