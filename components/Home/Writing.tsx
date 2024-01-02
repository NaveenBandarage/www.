import Link from "next/link";
import { NoteIcon } from "../Icons";
import Badge from "../../components/Badge";

export default function Writing() {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <h3 className="text-neutral-500 dark:text-silver-dark">Writing</h3>
      </dt>
      <dd className="list-content">
        <div className="pb-2 last-of-type:pb-0">
          <div>
            <Link
              href="#"
              className="opacity-20 dark:opacity-20 link inline-flex items-center gap-1"
            >
              <div className="opacity-20 dark:opacity-30">
                <NoteIcon size={16} />
              </div>
              Goals for 2024<Badge>WIP</Badge>
            </Link>
          </div>
          <div>
            <Link href="/2023" className="link inline-flex items-center gap-1">
              <div className="opacity-20 dark:opacity-30">
                <NoteIcon size={16} />
              </div>
              2023
            </Link>
          </div>
        </div>
      </dd>
    </dl>
  );
}
