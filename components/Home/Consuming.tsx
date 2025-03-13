import { LinkExternal } from "../Links";
import { SlideText, RevealText } from "../TextAnimation";

export default function Consuming() {
  return (
    <dl className="list-container">
      <dt className="list-title">
        <SlideText direction="right" duration={0.6} delay={0.6}>
          <h3 className="text-neutral-500 dark:text-silver-dark">Consuming</h3>
        </SlideText>
      </dt>
      <dd className="list-content">
        <div>
          <SlideText direction="up" delay={0.8} duration={0.5}>
            <LinkExternal href="//literal.club/book/alain-stephen-this-book-will-make-you-think-arqv6">
              This Book Will Make You Think
            </LinkExternal>
          </SlideText>{" "}
          <RevealText
            text="by Alain Stephen"
            type="words"
            staggerChildren={0.03}
            delay={1.0}
            className="inline"
          />
        </div>
        <div>
          <SlideText direction="up" delay={1.2} duration={0.5}>
            <LinkExternal href="//literal.club/book/software-engineering-at-google-2yflu">
              Software Engineering at Google
            </LinkExternal>
          </SlideText>{" "}
          <RevealText
            text="by Hyrum Wright, Titus Winters and Tom Manshreck"
            type="words"
            staggerChildren={0.02}
            delay={1.4}
            className="inline"
          />
        </div>
      </dd>
    </dl>
  );
}
