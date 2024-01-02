import { LinkExternal } from "../Links";

export default function Consuming() {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <h3 className="text-neutral-500 dark:text-silver-dark">Consuming</h3>
      </dt>
      <dd className="list-content">
        <div>
          <LinkExternal href="//literal.club/book/gergely-orosz-the-software-engineers-guidebook-yo7o5">
            The Software Engineer's Guidebook
          </LinkExternal>{" "}
          by Gergely Orosz
        </div>
        <div>
          <LinkExternal href="//literal.club/book/peter-attia-bill-gifford-outlive-n6oby">
            Outlive The Science and Art of Longevity
          </LinkExternal>{" "}
          by Peter Attia
        </div>
      </dd>
    </dl>
  );
}
