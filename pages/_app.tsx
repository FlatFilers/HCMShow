import "../styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import SidebarLayout from "../components/sidebar-layout";

import { Raleway } from "@next/font/google";

const raleway = Raleway({ subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
  session: Session | null | undefined;
}

export default function MyApp(props: AppPropsWithLayout) {
  const { Component, session, pageProps } = props;

  // Use the layout defined at the page level, if available
  const getLayout =
    Component.getLayout ?? ((page) => <SidebarLayout>{page}</SidebarLayout>);

  return getLayout(
    <SessionProvider session={session}>
      <div className={raleway.className}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}
