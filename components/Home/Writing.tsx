import Link from "next/link";
import { NoteIcon } from "../Icons";
import Badge from "../../components/Badge";

export default function Writing({ latestPosts }) {
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
              TBD<Badge>WIP</Badge>
            </Link>
          </div>
          {latestPosts.map((post) => (
            <div key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="link inline-flex items-center gap-1"
              >
                <div className="opacity-20 dark:opacity-30">
                  <NoteIcon size={16} />
                </div>
                {post.title}
              </Link>
            </div>
          ))}
          <div>
            <br></br>
            More writing{" "}
            <Link href="/blog" className="link inline-flex items-center gap-1">
              here
            </Link>
            .
          </div>
        </div>
      </dd>
    </dl>
  );
}
