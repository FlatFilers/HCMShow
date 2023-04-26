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
  ClipboardIcon,
  WindowIcon,
  FolderArrowDownIcon,
  ListBulletIcon,
  VariableIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { NextRouter, useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";

type Props = {
  children: React.ReactNode;
};

export const homeNavItem = (router?: NextRouter) => {
  return {
    name: "Home",
    href: "/home",
    icon: HomeIcon,
    current: router?.pathname === "/home",
  };
};

export const workflowItems = (router?: NextRouter) => {
  return [
    {
      slug: "project-onboarding",
      name: "Project Onboarding",
      href: "/project-onboarding",
      icon: FolderIcon,
      current: router?.pathname === "/project-onboarding",
      color: "border-project-onboarding text-project-onboarding",
      hoverColor:
        "group-hover:border-project-onboarding group-hover:text-project-onboarding",
      highlightColor: "hover:border-project-onboarding-highlight",
      description:
        "Flatfile enables multiple team members to collaborate over the course of a project in real-time, validating, transforming, and loading data into HCM.Show while ensuring everyone is on the same page.",
    },
    {
      slug: "embedded-portal",
      name: "Embedded Portal",
      href: "/embedded-portal",
      icon: WindowIcon,
      current: router?.pathname === "/embedded-portal",
      color: "border-embedded-portal text-embedded-portal",
      hoverColor:
        "group-hover:border-embedded-portal group-hover:text-embedded-portal",
      highlightColor: "hover:border-embedded-portal-highlight",
      description:
        "Flatfile's deeply configurable import experience is available right inside HCM Show. See how Flatfile simplifies the data onboarding process, eliminating the need for manual data mapping and significantly reducing errors.",
    },
    {
      slug: "file-feed",
      name: "File Feed",
      href: "/file-feed",
      icon: FolderArrowDownIcon,
      current: router?.pathname === "/file-feed",
      color: "border-file-feed text-file-feed",
      hoverColor: "group-hover:border-file-feed group-hover:text-file-feed",
      highlightColor: "hover:border-file-feed-highlight",
      description:
        "Flatfile automatically picks up a file from an external source and initiates data onboarding on behalf of users. After the file is retrieved, users can take advantage of Flatfile's mapping engine and data table to provide them with a streamlined import experience.",
    },
    {
      slug: "dynamic-portal",
      name: "Dynamic Portal",
      href: "/dynamic-portal",
      icon: VariableIcon,
      current: router?.pathname === "/dynamic-portal",
      color: "border-dynamic-portal text-dynamic-portal",
      hoverColor:
        "group-hover:border-dynamic-portal group-hover:text-dynamic-portal",
      highlightColor: "hover:border-dynamic-portal-highlight",
      description:
        "Flatfile’s configuration can be updated based on the settings from within the HCM Show application, allowing for fields to be added and picklist values to be updated. These changes are then reflected in an embedded iFrame modal.",
    },
  ];
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
    {
      name: "Benefit Plans",
      href: "/benefit-plans",
      icon: ClipboardIcon,
      current: router.pathname === "/benefit-plans",
    },
  ];
  const userNavigation: { name: string; href: string }[] = [
    // { name: "Your Profile", href: "#" },
    // { name: "Settings", href: "#" },
  ];

  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
  }

  const homeItem = homeNavItem(router);
  const workflowsNavigation = workflowItems(router);

  function pageColors(currentPath: string, href: string) {
    switch (href) {
      case `/project-onboarding`:
        if (currentPath === href) {
          return `border border-[#3B2FC9] bg-[#3B2FC9] text-white`;
        } else {
          return `text-[#3B2FC9] hover:bg-[#3B2FC9] hover:text-white`;
        }
      case `/file-feed`:
        if (currentPath === href) {
          return `border border-[#090B2B] bg-[#090B2B] text-white`;
        } else {
          return `text-[#090B2B] hover:bg-[#090B2B] hover:text-white`;
        }
      case `/embedded`:
        if (currentPath === href) {
          return `border border-[#32A673] bg-[#32A673] text-white`;
        } else {
          return `text-[#32A673] hover:bg-[#32A673] hover:text-white`;
        }
      case `/dynamic-templates`:
        if (currentPath === href) {
          return `border border-[#D64B32] bg-[#D64B32] text-white`;
        } else {
          return `text-[#D64B32] hover:bg-[#D64B32] hover:text-white`;
        }
    }
  }

  return (
    <div className="h-screen w-screen bg-white">
      <Toaster />

      <MobileSidebar
        pathname={router.pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        signOut={signOut}
        homeItem={homeItem}
        itemsNavigation={itemsNavigation}
        workflowsNavigation={workflowsNavigation}
      />

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-gray-100 pt-5">
          <div className="flex flex-shrink-0 items-center px-4 relative ml-4 h-7 w-40">
            <Image
              className=""
              src={"/images/hcm_logo_LR.png"}
              alt="HCM.show"
              fill={true}
              sizes="(max-width: 768px) 100vw,
              (max-width: 1200px) 50vw,
              33vw"
              priority
            />
          </div>
          <div className="mt-6 flex flex-grow flex-col">
            <nav className="flex flex-col px-2 pb-4 h-full justify-between mt-4">
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
                        item.current ? `${item.color} ` : "text-gray-600 ",
                        `${item.hoverColor} group flex items-center px-2 py-2 text-sm font-medium rounded-md`
                      )}
                    >
                      <div
                        className={`${
                          item.current ? item.color : "border-transparent"
                        } ${
                          item.hoverColor
                        } border-l-4 flex flex-row items-center pl-3`}
                      >
                        <item.icon
                          className={classNames(
                            item.current ? item.color : "text-gray-400",
                            `${item.hoverColor} mr-2 flex-shrink-0 h-6 w-6`
                          )}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
                    </a>
                  ))}
                </div>

                <p className="text-xs uppercase font-semibold text-gray-600 mb-2 pl-2">
                  Resources
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
                    router.pathname === "/activity-log"
                      ? "bg-slate-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <ListBulletIcon
                    className={classNames(
                      router.pathname === "/activity-log"
                        ? "text-gray-800"
                        : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-6 w-6"
                    )}
                    aria-hidden="true"
                  />
                  Activity Log
                </a>

                <div className="flex flex-col w-full border-t-2 border-gray-200 pt-2 mt-2">
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
        </div>
      </div>
      <div className="flex flex-1 flex-col md:pl-72 pt-4 bg-white">
        <button
          type="button"
          className="md:hidden border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary mt-4"
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
