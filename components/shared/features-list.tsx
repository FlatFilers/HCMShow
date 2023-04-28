import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

type Props = {
  type: string;
  features: { [key: string]: any };
  githubUrl: string;
};

const FeaturesList = ({ type, features, githubUrl }: Props) => {
  let klasses = "";
  if (type === "project-onboarding") {
    klasses = "text-project-onboarding";
  } else if (type === "embedded-portal") {
    klasses = "text-embedded-portal";
  } else if (type === "file-feed") {
    klasses = "text-file-feed";
  } else if (type === "dynamic-portal") {
    klasses = "text-dynamic-portal";
  }

  return (
    <div>
      <p className="font-semibold mb-4">Flatfile features covered:</p>
      <ul className="space-y-3 mb-4">
        {Object.keys(features).map((key) => {
          const ComponentName = features[key as keyof typeof features];

          return (
            <li className="flex flex-row items-center">
              <ComponentName className={`${klasses} mr-2 w-6 h-6`} />
              <span className="text-sm">{key}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-gray-600">
        View the code for this workflow{" "}
        <a target='_blank' className={`${klasses} underline`} href={githubUrl}>
          on Github.
        </a>
      </p>
    </div>
  );
};

export default FeaturesList;
