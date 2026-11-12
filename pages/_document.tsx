import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Apply the saved theme before paint, including before hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var theme;try{theme=localStorage.getItem('site-theme')}catch(e){}var dark=theme==='dark'||(theme!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light'})()`,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
