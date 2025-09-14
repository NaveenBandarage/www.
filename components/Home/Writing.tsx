import Link from "next/link";
import { NoteIcon } from "../Icons";
import Badge from "../../components/Badge";
import { FadeInText } from "../TextAnimation";

interface Post {
  slug: string;
  title: string;
}

interface WritingProps {
  latestPosts: Post[];
}

export default function Writing({ latestPosts }: WritingProps) {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <h3 className="text-neutral-500 dark:text-silver-dark">
          <FadeInText text="Writing" delay={4500} duration={600} />
        </h3>
      </dt>
      <dd className="list-content">
        <FadeInText text="" delay={4800} duration={800}>
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
              <Link
                href="/blog"
                className="link inline-flex items-center gap-1"
              >
                here
              </Link>
              .
            </div>
          </div>
        </FadeInText>
      </dd>
    </dl>
  );
}
