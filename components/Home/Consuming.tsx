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
            <LinkExternal href="//literal.club/book/alain-stephen-this-book-will-make-you-think-arqv6">
              This Book Will Make You Think
            </LinkExternal>{" "}
            by Alain Stephen
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
