import Link from "next/link";
import { FadeInText } from "../TextAnimation";

export default function Consuming() {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <h3 className="text-neutral-500 dark:text-silver-dark">
          <FadeInText text="Consuming" delay={5200} duration={600} />
        </h3>
      </dt>
      <dd className="list-content">
        <FadeInText text="" delay={5500} duration={800}>
          <div>
            <Link href="/books" className="link inline-flex items-center gap-1">
              Books I&apos;ve read this year
            </Link>
          </div>
          <div className="mt-4 text-neutral-600 dark:text-neutral-400">
            For what I&apos;m currently using see{" "}
            <Link href="/uses" className="link inline-flex items-center gap-1">
              here
            </Link>
            .
          </div>
        </FadeInText>
      </dd>
    </dl>
  );
}
