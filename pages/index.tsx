import { signIn } from "next-auth/react";
import { FormEvent, ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";
import { useRouter } from "next/router";
import { homeNavItem } from "../components/sidebar-layout";
import SVG from "react-inlinesvg";

const Home: NextPageWithLayout = () => {
  const { error } = useRouter().query;

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Sign in");

  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setButtonText("Signing in...");

    const email = (
      event.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      event.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;

    const homeItem = homeNavItem(router);

    signIn("credentials", {
      email,
      password,
      callbackUrl: homeItem.href,
    });
  };

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#1E2535] h-screen">
      <div className="w-full max-w-md space-y-8">
        <div className="relative flex flex-col items-center w-full">
          <SVG src="/images/hcm-logo.svg" />
          <p className="mt-8 text-white text-center text-xl">
            Sign in to HCM.show
          </p>
        </div>

        <form className="mt-8 space-y-2" action="#" onSubmit={handleSubmit}>
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
                className="bg-white relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 sm:text-sm"
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
                className="bg-white relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-gray-400 focus:outline-none focus:ring-gray-400 sm:text-sm"
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
                className="hidden h-4 w-4 rounded border-gray-300 text-gray-400 focus:ring-gray-400"
              />
              <label
                htmlFor="remember-me"
                className="hidden ml-2 text-sm text-gray-900 bg-white"
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
              href="/signup"
              className="font-medium text-gray-400 mt-4 block text-right underline"
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
