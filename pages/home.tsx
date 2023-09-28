import { NextPage } from "next";
import { workflowItems } from "../components/sidebar-layout";

interface Props {}

const Home: NextPage<Props> = ({}) => {
  const sections = workflowItems();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="my-8">
        <div
          className="mb-12 text-white flex flex-row items-center justify-between"
          style={{
            boxShadow: "0px 48px 48px 0px #00000033",
            background: "#2E323C99",
            borderRadius: "20px",
            padding: "40px",
          }}
        >
          <div className="mr-8">
            <h1 className="text-4xl font-semibold mb-8">HCM.show</h1>

            <div className="max-w-4xl space-y-8 font-light">
              <p>
                During the search for HCM solutions, our HR Director discovered
                HCM.show, a sleek and fully-functional HCM SaaS product that
                made all other options seem like clunky relics from the past.
              </p>

              <p>
                As they delved deeper into the capabilities of HCM.show, they
                realized they needed a reliable method for capturing,
                validating, and loading job information, employee data, and
                benefit elections into the system.
              </p>

              <p>
                With Flatfile, the team had the ability to configure a variety
                of data onboarding options, from a long-term onboarding projects
                to an ongoing file feeds from a vendor. Thanks to Flatfile, the
                HR Director was able to streamline their various data onboarding
                workflows and elevate their HR game.
              </p>

              <p>You can view the code for this app on Github.</p>

              <a
                style={{
                  background:
                    "linear-gradient(93.58deg, #363E52 -2%, #2B3242 117.56%)",
                  boxShadow:
                    "8.74046516418457px 9.711627960205078px 18.45209312438965px 0px #3D49644D inset",
                }}
                className="inline-flex flex-row justfy-center items-center px-8 py-4 font-semibold rounded-xl cursor-pointer hover:brightness-95"
                href="https://github.com/FlatFilers/HCMShow"
                target="_blank"
              >
                <span className="mr-4">View on Github</span>
                <img src="/images/github-white.svg" />
              </a>
            </div>
          </div>

          <img src="/images/hcm-home.svg" />
        </div>

        <div className="grid grid-cols-2 gap-8">
          {sections.map((s) => {
            return (
              <a
                key={s.slug}
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

export default Home;
