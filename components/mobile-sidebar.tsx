import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftOnRectangleIcon,
  CodeBracketSquareIcon,
  InboxIcon,
  ListBulletIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { NavigationItem } from "./sidebar-layout";
import Image from "next/image";

type Props = {
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  signOut: Function;
  homeItem: NavigationItem;
  itemsNavigation: NavigationItem[];
  workflowsNavigation: NavigationItem[];
};

const MobileSidebar = ({
  pathname,
  sidebarOpen,
  setSidebarOpen,
  signOut,
  homeItem,
  itemsNavigation,
  workflowsNavigation,
}: Props) => {
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-40 md:hidden"
        onClose={setSidebarOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex flex-shrink-0 items-center px-4 relative ml-4 h-7 w-40">
                <Image
                  className=""
                  src={"/images/hcm_logo_LR.png"}
                  alt="Your Company"
                  fill={true}
                  sizes="(max-width: 768px) 100vw,
                  (max-width: 1200px) 50vw,
                  33vw"
                  priority
                />
              </div>
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="flex flex-col px-2 h-full justify-between mt-4">
                  <div>
                    <a
                      href={homeItem.href}
                      className={classNames(
                        homeItem.current
                          ? "bg-slate-200 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6"
                      )}
                    >
                      <homeItem.icon
                        className={classNames(
                          homeItem.current
                            ? "text-gray-800"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 flex-shrink-0 h-6 w-6"
                        )}
                        aria-hidden="true"
                      />
                      {homeItem.name}
                    </a>

                    <div className="mb-6">
                      <p className="text-xs uppercase font-semibold text-gray-600 mb-2 pl-2 mt-6">
                        Workflows
                      </p>

                      {workflowsNavigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-slate-200 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                          )}
                        >
                          <img src={item.imageUri} className="mr-3" />
                          {item.name}
                        </a>
                      ))}
                    </div>

                    <p className="text-xs uppercase font-semibold text-gray-600 mb-2 pl-2">
                      Data Tables
                    </p>

                    {itemsNavigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-slate-200 text-gray-900"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                        )}
                      >
                        <item.icon
                          className={classNames(
                            item.current
                              ? "text-gray-800"
                              : "text-gray-400 group-hover:text-gray-500",
                            "mr-3 flex-shrink-0 h-6 w-6"
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <a
                      key="Activity Log"
                      href="/activity-log"
                      className={classNames(
                        pathname === "/activity-log"
                          ? "bg-slate-200 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1"
                      )}
                    >
                      <ListBulletIcon
                        className={classNames(
                          pathname === "/activity-log"
                            ? "text-gray-800"
                            : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 flex-shrink-0 h-6 w-6"
                        )}
                        aria-hidden="true"
                      />
                      Activity Log
                    </a>

                    <a
                      key="api-docs"
                      href="/api-docs"
                      target="_blank"
                      className={`
                    ${
                      pathname === "/activity-log"
                        ? "bg-slate-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <CodeBracketSquareIcon
                        className={`
                      ${
                        pathname === "/api-docs"
                          ? "text-gray-800"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                      mr-3 flex-shrink-0 h-6 w-6`}
                        aria-hidden="true"
                      />
                      API Documentation
                    </a>

                    <div className="flex flex-row w-full border-t-2 border-gray-200 pt-2 mt-2">
                      <a
                        href="#"
                        onClick={() => signOut()}
                        className={classNames(
                          "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          "w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1"
                        )}
                      >
                        <ArrowLeftOnRectangleIcon
                          className={classNames(
                            "text-gray-400 group-hover:text-gray-500",
                            "mr-3 flex-shrink-0 h-6 w-6"
                          )}
                          aria-hidden="true"
                        />
                        Sign Out
                      </a>
                    </div>
                  </div>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MobileSidebar;
