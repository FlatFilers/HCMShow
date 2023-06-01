import { FileFeedEvent, FileFeedEventType } from "../../lib/action";

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
const primaryEventKeywords = ["updated", "outcome-acknowledged", "scheduled"];
const redEventKeywords = ["deleted"];

const eventColors = (topic: string) => {
  if (greenEventKeywords.some((keyword: string) => topic.includes(keyword))) {
    return "bg-green-800";
  } else if (
    primaryEventKeywords.some((keyword: string) => topic.includes(keyword))
  ) {
    return "bg-primary";
  } else {
    return "bg-red-800";
  }
};

export const Event = ({ event }: Props) => {
  const capitalizeAndReplace = (topic: string) => {
    topic = topic.replace("records", "commit");
    topic = topic.replace("upload:completed", "file created");
    topic = topic.replace("upload", "file");
    const replaceColon = topic.replace(/:/g, " ");
    const capitalizedString =
      replaceColon.charAt(0).toUpperCase() + replaceColon.slice(1);

    return capitalizedString;
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
        <span className="">{event.description}</span>
      </td>

      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <span className="">{event.when}</span>
      </td>
    </>
  );
};
