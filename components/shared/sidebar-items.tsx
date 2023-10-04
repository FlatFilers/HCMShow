import { useRouter } from "next/router";
import { NavigationItem } from "../sidebar-layout";
import SVG from "react-inlinesvg";
import { signOut } from "next-auth/react";

type Props = {
  homeItem: NavigationItem;
  itemsNavigation: NavigationItem[];
  workflowsNavigation: NavigationItem[];
};

export function SidebarItems({
  homeItem,
  itemsNavigation,
  workflowsNavigation,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-grow flex-col overflow-y-auto pt-5 bg-[#292D36]">
      <div className="flex justify-center items-center">
        <SVG src="/images/hcm-logo.svg" className="px-4" />
      </div>

      <div
        className="mt-6 flex flex-grow flex-col"
        style={{
          background:
            "linear-gradient(0deg, #161A23, #161A23), linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))",
        }}
      >
        <nav className="flex flex-col px-4 pb-4 h-full justify-between mt-4">
          <div>
            <a
              href={homeItem.href}
              className={`${
                homeItem.current ? "active" : ""
              } nav-item group mb-6`}
            >
              <SVG
                src="/images/home.svg"
                className="group-hover:fill-white w-[20px] h-[20px] mr-3"
              />
              {homeItem.name}
            </a>

            <div className="mb-8">
              <p className="nav-separator">Workflows</p>

              <div className="space-y-3">
                {workflowsNavigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${item.current ? "active" : ""} nav-item group`}
                  >
                    <SVG
                      src={item.imageUri}
                      className="group-hover:fill-white w-[20px] h-[20px] mr-3"
                    />
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            <p className="nav-separator">Data Tables</p>

            <div className="space-y-3">
              {itemsNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
              ${item.current ? "active" : ""} nav-item group`}
                >
                  <SVG
                    src={item.imageUri}
                    className="group-hover:fill-white w-[20px] h-[20px] mr-3"
                  />
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <a
              key="Activity Log"
              href="/activity-log"
              className={`
            ${
              router.pathname === "/activity-log" ? "active" : ""
            } nav-item group`}
            >
              <SVG
                src={"/images/activity-log.svg"}
                className="group-hover:fill-white w-[20px] h-[20px] mr-3"
              />
              Activity Log
            </a>

            <a
              key="api-docs"
              href="/api-docs"
              target="_blank"
              className={`
            ${router.pathname === "/api-docs" ? "active" : ""} nav-item group`}
            >
              <SVG
                src={"/images/api-doc.svg"}
                className="group-hover:fill-white w-[20px] h-[20px] mr-3"
              />
              HCM.Show API Docs
            </a>

            <div className="flex flex-col w-full border-t-2 border-[#FFFFFF25] pt-2 mt-2">
              <a href="#" onClick={() => signOut()} className="nav-item group">
                <SVG
                  src={"/images/logout.svg"}
                  className="group-hover:fill-white w-[20px] h-[20px] mr-3"
                />
                Sign Out
              </a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}
