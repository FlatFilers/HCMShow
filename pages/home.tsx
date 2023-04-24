import { GetServerSideProps, NextPage } from "next";
import { BenefitPlan, PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getToken } from "next-auth/jwt";
import { useRouter } from "next/router";
import { workflowItems } from "../components/sidebar-layout";

interface Props {}

const Home: NextPage<Props> = ({}) => {
  const router = useRouter();

  const sections = workflowItems(router);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="my-8 w-10/12 h-5/6 mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-center mt-8 mb-8">
            HCM.show
          </h2>

          <div className="max-w-4xl mx-auto">
            <p className="mb-2 text-gray-700">
              During the search for HCM solutions, our HR Director discovered
              HCM.show, a sleek and fully-functional HCM SaaS product that made
              all other options seem like clunky relics from the past.
            </p>

            <p className="mb-2 text-gray-700">
              As they delved deeper into the capabilities of HCM.show, they
              realized they needed a reliable method for capturing, validating,
              and loading job information, employee data, and benefit elections
              into the system.
            </p>

            <p className="mb-2 text-gray-700">
              With Flatfile, the team had the ability to configure a variety of
              data onboarding options, from a long-term onboarding projects to
              an ongoing file feeds from a vendor. Thanks to Flatfile, the HR
              Director was able to streamline their various data onboarding
              workflows and elevate their HR game.
            </p>

            <p className="mb-2 text-gray-700">
              You can view the code for this app{" "}
              <a
                className="underline"
                href="https://github.com/FlatFilers/HCMShow"
              >
                on Github.
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {sections.map((s) => {
            return (
              <a
                href={s.href}
                className={`border-2 border-gray-100 ${s.highlightColor} rounded-xl p-6 transform hover:scale-[101%] transition duration-200`}
              >
                <div className={`border-t-[6px] w-12 mb-4 ${s.color}`}></div>
                <p className="mb-4 font-semibold">{s.name}</p>
                <p className="text-gray-700">{s.description}</p>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // const token = await getToken({
  //   req: context.req,
  // });

  // if (!token) {
  //   console.log("No session token found");

  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: {},
  };
};

export default Home;
