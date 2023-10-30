import { Option } from "../../pages/dynamic-portal";

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
    <div className="space-y-2">
      <div className="flex flex-row justify-between items-center">
        <p className="text-xs w-[45%] md:w-[47.5%]">Sheet Value</p>
        <p className="text-xs w-[45%] md:w-[47.5%]">Record Output</p>
        <p className="text-xs w-[10%] md:w-[5%]"></p>
      </div>

      <div className="space-y-2">
        {options.map((option) => {
          return (
            <div
              key={option.id}
              className="flex flex-row justify-between text-sm items-center space-x-2"
            >
              <input
                type="text"
                defaultValue={option.input}
                onChange={(e) => {
                  updateInput(option, e.target.value);
                }}
                className="text-darkest text-xs border border-darkest rounded px-2 py-1 w-[45%] md:w-[47.5%]"
              />

              <input
                type="text"
                defaultValue={option.output}
                onChange={(e) => {
                  updateOutput(option, e.target.value);
                }}
                className="text-darkest text-xs border border-darkest rounded px-2 py-1 w-[45%] md:w-[47.5%]"
              />

              <div className="w-[10%] md:w-[5%]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-300 cursor-pointer"
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
            </div>
          );
        })}
      </div>

      <div
        onClick={addNewOption}
        className="flex flex-row items-center justify-start text-gray-400 text-xs cursor-pointer"
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
