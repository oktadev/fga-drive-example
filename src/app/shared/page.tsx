import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import Navigation from "@/components/navigation";
import Header from "@/components/header";
import Shared from "@/components/shared";

export default withPageAuthRequired(async function () {
  return (
    <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
      <Navigation current="shared"/>
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-auto p-4">
            <Shared />
        </main>
      </div>
    </div>
  );
});
