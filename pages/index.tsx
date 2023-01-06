import { signIn } from "next-auth/react";
import Head from "next/head";
import { FormEvent, ReactElement } from "react";
import { NextPageWithLayout } from "./_app";

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const email = (
    event.currentTarget.elements.namedItem("email") as HTMLInputElement
  ).value;
  const password = (
    event.currentTarget.elements.namedItem("password") as HTMLInputElement
  ).value;

  signIn("credentials", { email, password, callbackUrl: "/dashboard" });
};

const Home: NextPageWithLayout = () => {
  return (
    <div className="">
      <Head>
        <title>HCM Show</title>
        <meta name="description" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-row items-center justify-center min-h-screen bg-white">
        <div>
          <h1 className="mb-4 text-black">Log in to your account</h1>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="mr-2 text-black">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mr-2 text-black">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button className="px-6 py-1 mt-4 bg-white text-black rounded-lg border border-black">
                Log in
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return page;
};

Home.skipAuth = true;

export default Home;
