import { GetServerSidePropsContext, NextPage } from "next";
import { unstable_getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]";

const Dashboard: NextPage<{ session: Session }> = ({ session }) => {
  return (
    <div>
      {session && <div className="mx-auto">Session!!!</div>}
      {!session && <div>Missing a session</div>}
    </div>
  );
};

export default Dashboard;
