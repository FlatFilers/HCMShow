type Props = {
  type: string;
  features: { [key: string]: any };
  githubUrl: string;
};

const FeaturesList = ({ type, features, githubUrl }: Props) => {
  return (
    <div>
      <p className="font-semibold mb-4">Flatfile features covered:</p>
      <ul className="space-y-3 mb-4">
        {Object.keys(features).map((key) => {
          const ComponentName = features[key as keyof typeof features];

          return (
            <li key={key} className="flex flex-row items-center">
              <ComponentName className={`text-gray-400 mr-2 w-6 h-6`} />
              <span className="text-sm">{key}</span>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-gray-400">
        View the code for this workflow{" "}
        <a
          target="_blank"
          className={`text-gray-400 underline`}
          href={githubUrl}
        >
          on Github.
        </a>
      </p>
    </div>
  );
};

export default FeaturesList;
