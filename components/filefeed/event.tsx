import { FileFeedEvent } from "../../lib/action";

type Props = {
  event: FileFeedEvent;
};

const greenEventKeywords = [
  "added",
  "completed",
  "created",
  "ready",
  "uploaded",
];
const redEventKeywords = ["deleted"];
const primaryEventKeywords = ["updated", "outcome-acknowledged", "scheduled"];

const eventColors = (topic: string) => {
  if (greenEventKeywords.some((keyword: string) => topic.includes(keyword))) {
    return "bg-green-800";
  } else if (
    redEventKeywords.some((keyword: string) => topic.includes(keyword))
  ) {
    return "bg-red-800";
  } else {
    return "bg-primary";
  }
};

export const Event = ({ event }: Props) => {
  const capitalizeAndReplace = (topic: string) => {
    try {
      const splitTopic = topic.split(":");
      const capitalizedWords = splitTopic.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
      const capitalizedString = capitalizedWords.join(" ");

      return capitalizedString;
    } catch (error) {
      console.log(
        "Error formatting topic. Returning unformatted event topic. Error:",
        error
      );

      return topic;
    }
  };

  return (
    <>
      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <div className="flex flex-row items-center">
          {event.topic && (
            <>
              <div className={`blob ${eventColors(event.topic)}`}></div>
              <span className="">{capitalizeAndReplace(event.topic)}</span>
            </>
          )}
        </div>
      </td>

      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <span className="">{event.when}</span>
      </td>
    </>
  );
};
