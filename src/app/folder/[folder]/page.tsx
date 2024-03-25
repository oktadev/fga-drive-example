import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import Navigation from "@/components/navigation";
import Drive from "@/components/drive";
import Header from "@/components/header";

export default withPageAuthRequired(function ({
  params,
}: {
  params: { folder: string }
}) {
  return (
    <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
      <Navigation current="folder"/>
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Drive folder={params.folder} />
        </main>
      </div>
    </div>
  );
});
