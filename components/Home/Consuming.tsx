import Link from "next/link";

export default function Consuming() {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <h2 className="text-neutral-500 dark:text-silver-dark">Consuming</h2>
      </dt>
      <dd className="list-content">
        <div>
          The things I&apos;ve read this{" "}
          <Link href="/books" className="link inline-flex items-center gap-1">
            year
          </Link>
        </div>
        <div className="mt-4">
          For what I&apos;m currently using see{" "}
          <Link href="/uses" className="link inline-flex items-center gap-1">
            here
          </Link>
          .
        </div>
      </dd>
    </dl>
  );
}
