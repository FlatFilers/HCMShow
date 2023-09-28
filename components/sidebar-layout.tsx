import { Fragment, ReactElement, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3BottomLeftIcon,
  FolderIcon,
  InboxIcon,
  UsersIcon,
  XMarkIcon,
  ArrowLeftOnRectangleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardIcon,
  WindowIcon,
  FolderArrowDownIcon,
  ListBulletIcon,
  VariableIcon,
  HomeIcon,
  CodeBracketSquareIcon,
  ClipboardDocumentIcon,
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
      name: "Departments",
      href: "/departments",
      icon: UserGroupIcon,
      current: router.pathname === "/departments",
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
    {
      name: "Employee Benefit Plans",
      href: "/employee-benefit-plans",
      icon: ClipboardDocumentIcon,
      current: router.pathname === "/employee-benefit-plans",
    },
  ];
  const userNavigation: { name: string; href: string }[] = [
    // { name: "Your Profile", href: "#" },
    // { name: "Settings", href: "#" },
  ];
  const homeItem = homeNavItem(router);
  const workflowsNavigation = workflowItems(router);

  return (
    <div className="h-screen w-screen overflow-auto bg-[#1E2535]">
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
      <div
        className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col"
        style={{
          background:
            "linear-gradient(0deg, #161A23, #161A23), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
        }}
      >
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-grow flex-col overflow-y-auto pt-5">
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
                  className={`${
                    homeItem.current
                      ? "bg-slate-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-6`}
                >
                  <homeItem.icon
                    className={`
                      ${homeItem.current}
                        ? "text-gray-800"
                        : "text-gray-400 group-hover:text-gray-500"
                      mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  {homeItem.name}
                </a>

                <div className="mb-6">
                  <p className="text-xs uppercase font-semibold text-gray-600 mb-2 pl-2">
                    Workflows
                  </p>

                  {workflowsNavigation.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`${
                        item.current ? `${item.color} ` : "text-gray-600 "
                      } ${
                        item.hoverColor
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      <div
                        className={`${
                          item.current ? item.color : "border-transparent"
                        } ${
                          item.hoverColor
                        } border-l-4 flex flex-row items-center pl-3`}
                      >
                        <item.icon
                          className={`${
                            item.current ? item.color : "text-gray-400"
                          }
                            ${item.hoverColor} mr-2 flex-shrink-0 h-6 w-6`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </div>
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
                    className={`
                      ${
                        item.current
                          ? "bg-slate-200 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`
                        ${
                          item.current
                            ? "text-gray-800"
                            : "text-gray-400 group-hover:text-gray-500"
                        }
                        mr-3 flex-shrink-0 h-6 w-6`}
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
                  className={`
                    ${
                      router.pathname === "/activity-log"
                        ? "bg-slate-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <ListBulletIcon
                    className={`
                      ${
                        router.pathname === "/activity-log"
                          ? "text-gray-800"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                      mr-3 flex-shrink-0 h-6 w-6`}
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
                      router.pathname === "/api-docs"
                        ? "bg-slate-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <CodeBracketSquareIcon
                    className={`
                      ${
                        router.pathname === "/api-docs"
                          ? "text-gray-800"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                      mr-3 flex-shrink-0 h-6 w-6`}
                    aria-hidden="true"
                  />
                  HCM.Show API Documentation
                </a>

                <div className="flex flex-col w-full border-t-2 border-gray-200 pt-2 mt-2">
                  <a
                    href="#"
                    onClick={() => signOut()}
                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6"
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
      <div className="flex flex-1 flex-col md:pl-72 pt-4 ">
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
