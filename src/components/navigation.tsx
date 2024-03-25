import Link from "next/link";
import {
  ClockIcon,
  FolderIcon,
  HardDriveIcon,
  StarIcon,
  TrashIcon,
  UsersIcon,
} from "./icons";

export default function Navigation({current}: {current: string}) {
  return (
    <div className="hidden w-[300px] border-r lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b px-6">
          <HardDriveIcon className="h-6 w-6" />
          <h1 className="ml-2 font-semibold">Okta Drive</h1>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${current === 'folder' ? 'bg-gray-100  text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'rounded-lg  text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 '}`}
              href="/folder"
            >
              <FolderIcon className="h-4 w-4" />
              My Drive
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 ${current === 'shared' ? 'bg-gray-100  text-gray-900  transition-all hover:text-gray-900 dark:bg-gray-800 dark:text-gray-50' : 'rounded-lg  text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 '}`}
              href="/shared"
            >
              <UsersIcon className="h-4 w-4" />
              Shared with me
            </Link>
            <hr className="my-4" />
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 rounded-lg cursor-not-allowed`}
              href="#"
            >
              <ClockIcon className="h-4 w-4" />
              Recent
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 rounded-lg cursor-not-allowed`}
              href="#"
            >
              <StarIcon className="h-4 w-4" />
              Starred
            </Link>
            <Link
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 rounded-lg cursor-not-allowed`}
              href="#"
            >
              <TrashIcon className="h-4 w-4" />
              Trash
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
