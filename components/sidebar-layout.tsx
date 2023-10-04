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
  // HomeIcon,
  CodeBracketSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import { NextRouter, useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";
import SVG from "react-inlinesvg";
import { SidebarItems } from "./shared/sidebar-items";

type Props = {
  children: React.ReactNode;
};

export const homeNavItem = (router?: NextRouter) => {
  return {
    name: "Home",
    href: "/home",
    imageUri: "/images/home.svg",
    current: router?.pathname === "/home",
  };
};

export const workflowItems = (router?: NextRouter) => {
  return [
    {
      slug: "project-onboarding",
      name: "Project Onboarding",
      href: "/project-onboarding",
      imageUri: "/images/project-onboarding.svg",
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
      imageUri: "/images/embedded-portal.svg",
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
      imageUri: "/images/file-feed.svg",
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
      imageUri: "/images/dynamic-portal.svg",
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
  // icon: React.ReactNode;
  imageUri: string;
  current: boolean;
}

const SidebarLayout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const itemsNavigation = [
    {
      name: "Employees",
      href: "/employees",
      imageUri: "/images/employees.svg",
      current: router.pathname === "/employees",
    },
    {
      name: "Departments",
      href: "/departments",
      imageUri: "/images/departments.svg",
      current: router.pathname === "/departments",
    },
    {
      name: "Jobs",
      href: "/jobs",
      imageUri: "/images/jobs.svg",
      current: router.pathname === "/jobs",
    },
    {
      name: "Benefit Plans",
      href: "/benefit-plans",
      imageUri: "/images/benefit-plans.svg",
      current: router.pathname === "/benefit-plans",
    },
    {
      name: "Employee Benefit Plans",
      href: "/employee-benefit-plans",
      imageUri: "/images/employee-benefit-plans.svg",
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

      {/* Desktop nav */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <SidebarItems
          homeItem={homeItem}
          itemsNavigation={itemsNavigation}
          workflowsNavigation={workflowsNavigation}
        />
      </div>
      <div className="flex flex-1 flex-col md:pl-72 pt-4 ">
        <button
          type="button"
          className="md:hidden border-r border-gray-200 px-6 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400 mt-4"
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
