import Link from "next/link";
import { NoteIcon } from "../Icons";
import Badge from "../../components/Badge";
import { SlideText, RevealText } from "../TextAnimation";

export default function Writing({ latestPosts }) {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <SlideText direction="right" duration={0.6} delay={0.3}>
          <h3 className="text-neutral-500 dark:text-silver-dark">Writing</h3>
        </SlideText>
      </dt>
      <dd className="list-content">
        <div className="pb-2 last-of-type:pb-0">
          <div>
            <SlideText direction="up" delay={0.4} duration={0.5}>
              <Link
                href="#"
                className="opacity-20 dark:opacity-20 link inline-flex items-center gap-1"
              >
                <div className="opacity-20 dark:opacity-30">
                  <NoteIcon size={16} />
                </div>
                TBD<Badge>WIP</Badge>
              </Link>
            </SlideText>
          </div>
          {latestPosts.map((post, index) => (
            <div key={post.slug}>
              <SlideText
                direction="up"
                delay={0.5 + index * 0.15}
                duration={0.5}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="link inline-flex items-center gap-1"
                >
                  <div className="opacity-20 dark:opacity-30">
                    <NoteIcon size={16} />
                  </div>
                  {post.title}
                </Link>
              </SlideText>
            </div>
          ))}
          <div>
            <br></br>
            <RevealText
              text="More writing"
              type="words"
              staggerChildren={0.03}
              delay={0.9}
              className="inline"
            />{" "}
            <SlideText direction="left" delay={1.2} className="inline-block">
              <Link
                href="/blog"
                className="link inline-flex items-center gap-1"
              >
                here
              </Link>
            </SlideText>
            <RevealText text="." delay={1.4} className="inline" />
          </div>
        </div>
      </dd>
    </dl>
  );
}
