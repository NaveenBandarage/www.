import { LinkExternal } from "../Links";
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
            <LinkExternal href="//literal.club/book/steven-bartlett-happy-sexy-millionaire-iy4hk">
              Happy Sexy Millionaire
            </LinkExternal>{" "}
            by Steven Bartlett
          </div>
          <div>
            <LinkExternal href="//literal.club/book/software-engineering-at-google-2yflu">
              Software Engineering at Google
            </LinkExternal>{" "}
            by Hyrum Wright, Titus Winters and Tom Manshreck
          </div>
        </FadeInText>
      </dd>
    </dl>
  );
}
