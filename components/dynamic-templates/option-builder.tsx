import { Option } from "../../pages/dynamic-templates";

type Props = {
  options: Option[];
  updateInput: (option: Option, value: string) => void;
  updateOutput: (option: Option, value: string) => void;
  addNewOption: () => void;
  removeOption: (option: Option) => void;
};

export const OptionBuilder = ({
  options,
  updateInput,
  updateOutput,
  addNewOption,
  removeOption,
}: Props) => {
  return (
    <div className="max-w-lg">
      <div className="flex flex-row justify-between items-center mb-2">
        <p className="text-xs w-1/2 text-gray-600">Input value in sheet</p>
        <p className="text-xs w-1/2 text-gray-600">Output value on record</p>
      </div>

      {options.map((option) => {
        return (
          <div
            key={option.id}
            className="flex flex-row justify-between items-center mb-2"
          >
            <input
              type="text"
              defaultValue={option.input}
              onChange={(e) => {
                updateInput(option, e.target.value);
              }}
              className="border border-gray-200 rounded px-4 py-2 mr-2 w-1/2"
            />

            <input
              type="text"
              defaultValue={option.output}
              onChange={(e) => {
                updateOutput(option, e.target.value);
              }}
              className="border border-gray-200 rounded px-4 py-2 w-1/2"
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-300 ml-2 cursor-pointer"
              onClick={() => {
                removeOption(option);
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      })}

      <div
        onClick={addNewOption}
        className="flex flex-row items-center justify-start text-gray-400 text-sm cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m6-6H6"
          />
        </svg>

        <p>New Option</p>
      </div>
    </div>
  );
};
