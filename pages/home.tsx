import { NextPage } from "next";
import { workflowItems } from "../components/sidebar-layout";

interface Props {}

const Home: NextPage<Props> = ({}) => {
  const sections = workflowItems();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="my-8">
        <div className="card-bg mb-6 text-white flex flex-row items-center justify-between">
          <div className="mr-8">
            <h1 className="text-4xl font-semibold mb-8">HCM.show</h1>

            <div className="max-w-4xl space-y-8 font-light leading-7">
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
                className="button-bg"
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

        <div className="grid grid-cols-2 gap-6">
          {sections.map((s) => {
            return (
              <a
                key={s.slug}
                href={s.href}
                className={`card-bg flex flex-col justify-between space-y-6 text-white border-2 border-transparent ${s.highlightColor} rounded-xl p-6 transform hover:scale-[101%] transition duration-200`}
              >
                <div className="">
                  <div className="flex flex-row items-center mb-2">
                    <img src={s.imageUri} className="mr-3" />
                    <p className="text-xl font-semibold">{s.name}</p>
                  </div>

                  <div
                    className={`mb-6 border-t-[2px] w-[20px] ${s.color}`}
                  ></div>

                  <p className="leading-8">{s.description}</p>
                </div>

                <div>
                  <button className="button-bg">Open {s.name}</button>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
