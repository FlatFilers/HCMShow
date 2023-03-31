import { FileFeedEvent, FileFeedEventType } from "../../lib/action";

type Props = {
  event: FileFeedEvent;
};

export const Event = ({ event }: Props) => {
  return (
    <>
      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
        <div className="flex flex-row items-center">
          {event.topic === FileFeedEventType.RecordsCreated && (
            <>
              <div className="blob bg-green-800"></div>
              <span className="">Records created</span>
            </>
          )}
          {event.topic === FileFeedEventType.RecordsUpdated && (
            <>
              <div className="blob bg-primary"></div>
              <span className="">Records updated</span>
            </>
          )}
          {event.topic === FileFeedEventType.RecordsDeleted && (
            <>
              <div className="blob bg-red-800"></div>
              <span className="">Records deleted</span>
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
