import { Fragment, ReactElement, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  FolderIcon,
  InboxIcon,
  UsersIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  BriefcaseIcon,
  WindowIcon,
  FolderArrowDownIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";
import logo from "../public/hcm_logo.png";

type Props = {
  children: React.ReactNode;
};

export interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  current: boolean;
}

const SidebarLayout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const itemsNavigation = [
    {
      name: "Employees",
      href: "/employees",
      icon: UsersIcon,
      current: router.pathname === "/employees",
    },
    {
      name: "Jobs",
      href: "/jobs",
      icon: BriefcaseIcon,
      current: router.pathname === "/jobs",
    },
  ];
  const workflowsNavigation = [
    {
      name: "Onboarding",
      href: "/onboarding",
      icon: FolderIcon,
      current: router.pathname === "/onboarding",
    },
    {
      name: "File Feed",
      href: "/file-feed",
      icon: FolderArrowDownIcon,
      current: router.pathname === "/file-feed",
    },
    {
      name: "Embedded",
      href: "/embedded",
      icon: WindowIcon,
      current: router.pathname === "/embedded",
    },
  ];
  const userNavigation: { name: string; href: string }[] = [
    // { name: "Your Profile", href: "#" },
    // { name: "Settings", href: "#" },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  return (
    <div className="h-screen w-screen bg-white">
      <Toaster />

      <MobileSidebar
        pathname={router.pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        itemsNavigation={itemsNavigation}
        workflowsNavigation={workflowsNavigation}
      />

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-gray-100 pt-5">
          <div className="flex flex-shrink-0 items-center px-4">
            <Image
              className="mx-auto h-14 w-36"
              src={logo}
              alt="Your Company"
              priority
            />
          </div>
          <div className="mt-4 flex flex-grow flex-col">
            <nav className="flex flex-col px-2 pb-4 h-full justify-between">
              <div>
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
                <p className="text-xs uppercase font-semibold text-gray-600 mb-1 pl-2">
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

                <a
                  key="Imports"
                  href="/imports"
                  className={classNames(
                    router.pathname === "/imports"
                      ? "bg-slate-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1"
                  )}
                >
                  <InboxIcon
                    className={classNames(
                      router.pathname === "/imports"
                        ? "text-gray-800"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-4 flex-shrink-0 h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  Imports
                </a>
                <div className="flex flex-row w-full border-t-2 border-gray-200 pt-1 mt-2">
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
                        "mr-4 flex-shrink-0 h-6 w-6"
                      )}
                      aria-hidden="true"
                    />
                    Sign Out
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col md:pl-72 pt-4 bg-white">
        <button
          type="button"
          className="md:hidden border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mt-4"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3BottomLeftIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  );
};

export default SidebarLayout;
