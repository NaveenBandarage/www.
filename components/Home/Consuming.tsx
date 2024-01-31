import { LinkExternal } from "../Links";

export default function Consuming() {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <h3 className="text-neutral-500 dark:text-silver-dark">Consuming</h3>
      </dt>
      <dd className="list-content">
        <div>
          <LinkExternal href="//literal.club/book/annie-lawson-stoic-at-work-yjulh">
            Stoic at Work
          </LinkExternal>{" "}
          by Annie Lawson
        </div>
        <div>
          <LinkExternal href="//literal.club/book/peter-attia-bill-gifford-outlive-n6oby">
            Outlive: The Science and Art of Longevity
          </LinkExternal>{" "}
          by Peter Attia
        </div>
      </dd>
    </dl>
  );
}
