import { useId } from "react";
import traced from "../../public/fun/gta-vi/objects/manifest.json";

export type TracedArtwork = keyof typeof traced;
export type ArtworkKind =
  | TracedArtwork
  | "palm"
  | "palm-frond"
  | "gold-snake"
  | "orange"
  | "blossom"
  | "portal"
  | "medallion"
  | "panorama"
  | "arch"
  | "flame"
  | "cloud"
  | "leaf-sign"
  | "poster";
export { traced };

/** Code-drawn ornaments around the separately traced SVG illustration cutouts. */
export default function Artwork({ kind }: { kind: ArtworkKind }) {
  const id = useId().replace(/:/g, "");
  const gold = `${id}-gold`;
  const green = `${id}-green`;
  const pink = `${id}-pink`;
  if (kind in traced) {
    // SVG files contain only colored paths, with genuine transparent silhouettes.
    return (
      // SVG paths stay unoptimized: next/image does not transform vector artwork.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/fun/gta-vi/objects/${kind}.svg`} alt="" draggable={false} />
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={
        kind === "palm-frond"
          ? "-16 -16 632 632"
          : kind === "panorama"
            ? "0 0 1600 900"
            : kind === "arch"
              ? "0 0 600 900"
              : kind === "palm"
                ? "0 0 400 600"
                : "0 0 600 600"
      }
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#61350d" />
          <stop offset=".22" stopColor="#ffe5a0" />
          <stop offset=".43" stopColor="#c78722" />
          <stop offset=".62" stopColor="#ffe5a3" />
          <stop offset="1" stopColor="#60300a" />
        </linearGradient>
        <linearGradient id={green} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#9bb34c" />
          <stop offset=".35" stopColor="#496826" />
          <stop offset=".72" stopColor="#263f19" />
          <stop offset="1" stopColor="#132c13" />
        </linearGradient>
        <radialGradient id={pink}>
          <stop stopColor="#ffe4a4" />
          <stop offset=".4" stopColor="#ffb43a" />
          <stop offset=".8" stopColor="#d86c19" />
          <stop offset="1" stopColor="#86441a" />
        </radialGradient>
      </defs>
      {kind === "palm-frond" ? (
        <>
          <path
            d="M85 550Q265 425 514 80"
            stroke="#26491d"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {Array.from({ length: 14 }, (_, i) => {
            const t = (i + 1) / 15;
            const x = 90 + 420 * t,
              y = 550 - 470 * t + Math.sin(t * Math.PI) * 35;
            const length = 25 + 125 * Math.pow(Math.sin(t * Math.PI), 0.75);
            return [-1, 1].map((side) => {
              const tipX = x + side * length * 0.86,
                tipY = y + side * length * 0.72;
              return (
                <g key={`${i}-${side}`}>
                  <path
                    d={`M${x - 4} ${y + 6}Q${x + side * length * 0.18} ${y + side * length * 0.66} ${tipX} ${tipY}Q${x + side * length * 0.52} ${y + side * length * 0.1} ${x + 5} ${y - 7}Z`}
                    fill={`url(#${green})`}
                    stroke="#6c873c"
                    strokeWidth="1.4"
                  />
                  <path
                    d={`M${x} ${y}Q${x + side * length * 0.4} ${y + side * length * 0.22} ${tipX} ${tipY}`}
                    stroke="#b4bd69"
                    strokeWidth="1.3"
                    opacity=".45"
                  />
                </g>
              );
            });
          })}
          <path
            d="M85 550Q265 425 514 80"
            stroke="#9aa95c"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "gold-snake" ? (
        <>
          <path
            d="M135 145C80 56 274 38 313 116C347 183 225 255 179 201C128 140 279 120 335 177C396 241 459 199 464 131C474 34 353 38 366 123C371 173 407 212 377 276C346 340 242 269 222 352"
            fill="none"
            stroke="#72621e"
            strokeWidth="65"
            strokeLinecap="round"
          />
          <path
            d="M135 145C80 56 274 38 313 116C347 183 225 255 179 201C128 140 279 120 335 177C396 241 459 199 464 131C474 34 353 38 366 123C371 173 407 212 377 276C346 340 242 269 222 352"
            fill="none"
            stroke="#d7c248"
            strokeWidth="51"
            strokeLinecap="round"
          />
          <path
            d="M135 133C99 65 267 56 301 122M189 184Q240 144 321 188M355 137Q364 183 379 219M363 278Q299 309 247 323"
            fill="none"
            stroke="#f4e590"
            strokeWidth="11"
            strokeLinecap="round"
            opacity=".8"
          />
          <path
            d="M203 329C153 353 180 415 231 434L240 405C246 430 262 432 272 401C286 371 259 330 237 326Z"
            fill="#d6bd43"
            stroke="#88792c"
            strokeWidth="4"
          />
          <path
            d="M198 371Q234 403 269 376L255 422L239 401L227 425Z"
            fill="#795258"
          />
          <path
            d="M204 378L216 402L220 385M255 383L251 406L263 379"
            fill="#fff0ca"
          />
          <ellipse cx="215" cy="350" rx="8" ry="5" fill="#5b551c" />
          <path
            d="M239 412L243 462L232 476M243 462L253 474"
            stroke="#743c35"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      ) : null}
      {kind === "panorama" ? (
        <>
          <path d="M0 0H1600V900H0Z" fill="#aabecb" />
          <path
            d="M0 168Q102 74 198 136Q270 41 382 127Q472 86 541 191Q638 124 740 197Q858 83 952 167Q1095 49 1205 160Q1314 70 1403 142Q1522 62 1600 172V287H0Z"
            fill="#e6dfd5"
            opacity=".8"
          />
          <path
            d="M0 610Q193 525 379 591T797 572Q1065 512 1286 588T1600 556V900H0Z"
            fill="#718473"
          />
          <path
            d="M0 703Q204 663 391 702T823 692Q1083 652 1296 711T1600 688V785H0Z"
            fill="#bcac8c"
          />
          {[130, 390, 1190, 1480].map((x, i) => (
            <g
              key={x}
              opacity=".65"
              transform={`translate(${x} ${175 + (i % 2) * 70}) scale(${i % 2 ? 0.7 : 1})`}
            >
              <path d="M0 415Q40 226 0 12" stroke="#777969" strokeWidth="14" />
              <path
                d="M0 25Q-103-59-147 43Q-69 0 0 25Q33-72 127-17Q64 4 0 25Q98 0 153 99Q64 43 0 25Q-90 31-102 138Q-59 64 0 25Z"
                fill="#5d7764"
              />
            </g>
          ))}
          <path
            d="M0 11H1600M0 889H1600"
            stroke={`url(#${gold})`}
            strokeWidth="12"
          />
        </>
      ) : null}
      {kind === "medallion" ? (
        <>
          <circle cx="300" cy="300" r="222" fill="#898097" />
          <path
            d="M91 246Q175 184 250 220T506 239M82 317Q180 240 300 297T514 320M106 389Q230 330 319 369T491 395"
            stroke="#bbb1bd"
            strokeWidth="28"
            opacity=".22"
          />
          <path
            d="M177 465Q205 317 197 188M401 470Q385 310 412 166"
            stroke="#626477"
            strokeWidth="9"
            opacity=".4"
          />
          <path
            d="M197 207Q118 132 102 216Q152 185 197 207Q209 127 276 168Q231 179 197 207Q128 193 129 268Q155 220 197 207ZM410 193Q354 113 326 190Q369 168 410 193Q430 116 497 156Q447 174 410 193Q481 185 497 251Q452 216 410 193Z"
            fill="#65677d"
            opacity=".4"
          />
        </>
      ) : null}
      {kind === "leaf-sign" ? (
        <>
          <path
            d="M48 22H552V578H48Z"
            fill="#39551e"
            stroke="#7b943c"
            strokeWidth="5"
          />
          <path d="M65 39H535V561H65Z" stroke="#9bac55" strokeWidth="2" />
          <text
            x="300"
            y="142"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontStyle="italic"
            fontSize="83"
            fill="#a2b85b"
          >
            Le Chien
          </text>
          <circle
            cx="300"
            cy="320"
            r="147"
            fill="#213c1a"
            stroke="#758e3e"
            strokeWidth="8"
          />
          <circle cx="300" cy="320" r="133" stroke="#a1ac53" strokeWidth="2" />
          <path
            d="M190 385L214 305L208 225L249 256Q306 223 355 263L395 226L385 312L403 384L349 411H245Z"
            fill="#71913c"
            stroke="#a0b358"
            strokeWidth="4"
          />
          <path
            d="M222 297L270 310L250 326ZM378 297L330 310L350 326ZM270 361Q300 345 330 361L300 383Z"
            fill="#233e1a"
          />
          <path
            d="M300 383V405M253 398Q300 428 347 398"
            stroke="#223b19"
            strokeWidth="5"
          />
          <text
            x="300"
            y="520"
            textAnchor="middle"
            fontFamily="Georgia,serif"
            fontSize="48"
            fontWeight="bold"
            fill="#a9b761"
          >
            RUN WILD
          </text>
        </>
      ) : null}
      {kind === "palm" ? (
        <>
          <path d="M199 593Q232 325 190 24" stroke="#657d33" strokeWidth="7" />
          {Array.from({ length: 15 }, (_, i) => {
            const y = 38 + i * 31,
              spread = 32 + Math.sin((i / 16) * Math.PI) * 140;
            return (
              <g key={i}>
                <path
                  d={`M198 ${y}Q${174 - spread * 0.5} ${y + 10} ${197 - spread} ${y + 100}Q${188 - spread * 0.25} ${y + 55} 201 ${y + 13}`}
                  fill={`url(#${green})`}
                  stroke="#809449"
                  strokeWidth=".8"
                />
                <path
                  d={`M200 ${y}Q${225 + spread * 0.5} ${y + 10} ${204 + spread} ${y + 100}Q${212 + spread * 0.25} ${y + 55} 201 ${y + 13}`}
                  fill={`url(#${green})`}
                  stroke="#809449"
                  strokeWidth=".8"
                />
                <path
                  d={`M200 ${y + 6}L${200 - spread} ${y + 38}M201 ${y + 6}L${202 + spread} ${y + 38}`}
                  stroke="#a0b55c"
                  strokeWidth="1.2"
                  opacity=".6"
                />
              </g>
            );
          })}
        </>
      ) : null}
      {kind === "orange" ? (
        <>
          <path d="M280 305Q198 143 376 71" stroke="#69702d" strokeWidth="13" />
          <path
            d="M291 210Q138 78 105 211Q205 278 291 210ZM303 185Q315 65 436 107Q415 206 303 185Z"
            fill={`url(#${green})`}
            stroke="#a0ad53"
            strokeWidth="3"
          />
          <circle
            cx="291"
            cy="339"
            r="166"
            fill={`url(#${pink})`}
            stroke="#7c491c"
            strokeWidth="4"
          />
          <ellipse
            cx="235"
            cy="263"
            rx="69"
            ry="34"
            fill="#ffe5a6"
            opacity=".2"
            transform="rotate(-38 235 263)"
          />
          {Array.from({ length: 48 }, (_, i) => (
            <circle
              key={i}
              cx={205 + ((i * 67) % 180)}
              cy={222 + ((i * 43) % 230)}
              r={1 + (i % 2)}
              fill={i % 2 ? "#803b12" : "#ffcf76"}
              opacity=".22"
            />
          ))}
        </>
      ) : null}
      {kind === "blossom" ? (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse
              key={i}
              cx="300"
              cy="189"
              rx="55"
              ry="105"
              fill="#f4efd7"
              stroke="#c6c19d"
              strokeWidth="3"
              transform={`rotate(${i * 72} 300 300)`}
            />
          ))}
          <circle cx="300" cy="300" r="47" fill="#dcc65d" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle
              key={i}
              cx={300 + Math.cos(i) * 29}
              cy={300 + Math.sin(i) * 29}
              r="5"
              fill="#786b29"
            />
          ))}
        </>
      ) : null}
      {kind === "portal" ? (
        <>
          <circle
            cx="300"
            cy="300"
            r="245"
            stroke="#8e829c"
            strokeWidth="48"
            opacity=".8"
          />
          {[219, 226, 263, 270].map((r) => (
            <circle
              key={r}
              cx="300"
              cy="300"
              r={r}
              stroke="#e6bbc4"
              strokeWidth={r === 270 ? 4 : 1.5}
            />
          ))}
          {Array.from({ length: 32 }, (_, i) => (
            <path
              key={i}
              d="M294 47v21m12-21v21m-16-21h20m-20 21h20"
              stroke="#e6becb"
              strokeWidth="1.6"
              transform={`rotate(${i * 11.25} 300 300)`}
              opacity=".75"
            />
          ))}
          {[false, true].map((bottom) => (
            <g
              key={String(bottom)}
              transform={bottom ? "translate(0 600) scale(1 -1)" : undefined}
            >
              <path
                d="M0 76H126M474 76H600"
                stroke={`url(#${gold})`}
                strokeWidth="7"
              />
              <path
                d="M300 66C277 60 261 45 240 45C202 39 179 72 167 68C154 65 159 44 150 43C136 42 128 62 139 81C153 106 187 92 196 75C205 57 240 58 261 72C279 84 288 77 291 67"
                fill={`url(#${gold})`}
                stroke="#9a631e"
                strokeWidth="1.5"
              />
              <path
                d="M300 66C323 60 339 45 360 45C398 39 421 72 433 68C446 65 441 44 450 43C464 42 472 62 461 81C447 106 413 92 404 75C395 57 360 58 339 72C321 84 312 77 309 67"
                fill={`url(#${gold})`}
                stroke="#9a631e"
                strokeWidth="1.5"
              />
              <path
                d="M300 72Q275 55 276 33Q289 35 296 53Q282 20 300 6Q318 20 304 53Q311 35 324 33Q325 55 300 72Z"
                fill={`url(#${gold})`}
                stroke="#9a631e"
                strokeWidth="1.5"
              />
              <path
                d="M145 49Q141 76 157 79M198 67Q225 41 254 57M346 57Q375 41 402 67M443 79Q459 76 455 49"
                stroke="#ffe8a7"
                strokeWidth="2"
                fill="none"
              />
            </g>
          ))}
        </>
      ) : null}
      {kind === "arch" ? (
        <>
          <path
            d="M44 900V276C44-39 556-39 556 276V900H448V281C448 65 152 65 152 281V900Z"
            fill={`url(#${gold})`}
            stroke="#56402b"
            strokeWidth="8"
          />
          <path
            d="M64 270C64-9 536-9 536 270M126 270C126 58 474 58 474 270"
            stroke="#d6c49a"
            strokeWidth="9"
          />
          {[40, 448].map((x) => (
            <g key={x}>
              <path
                d={`M${x} 305h112v540H${x}Z`}
                fill="#785340"
                stroke="#47372c"
                strokeWidth="5"
              />
              {[18, 40, 62, 84].map((v) => (
                <path
                  key={v}
                  d={`M${x + v} 320v505`}
                  stroke={v % 40 === 18 ? "#a78c67" : "#4d3b30"}
                  strokeWidth="9"
                />
              ))}
              <path
                d={`M${x - 12} 278h136v40H${x - 12}Zm0 547h136v55H${x - 12}Z`}
                fill={`url(#${gold})`}
                stroke="#4b3b2a"
                strokeWidth="4"
              />
              {[12, 39, 66, 93].map((v) => (
                <path
                  key={v}
                  d={`M${x + v} 284q-15 21 0 25q15-4 0-25`}
                  fill="#392d25"
                  stroke="#b59b75"
                  strokeWidth="2"
                />
              ))}
            </g>
          ))}
          {Array.from({ length: 13 }, (_, i) => (
            <path
              key={i}
              d="m292 12 16 0 10 89-36 0Z"
              stroke="#bfb08d"
              strokeWidth="3"
              transform={`rotate(${(i - 6) * 14} 300 276)`}
            />
          ))}
        </>
      ) : null}
      {kind === "flame" ? (
        <>
          <path
            d="M300 583C53 551 165 317 191 239C212 327 234 310 224 207C214 125 321 112 346 5C378 159 467 205 429 312C510 277 508 463 452 519C414 561 354 590 300 583Z"
            fill="#bc2915"
            opacity=".7"
          />
          <path
            d="M297 573C147 529 220 395 230 324C271 399 284 356 276 270C271 205 327 174 337 112C357 228 416 273 380 377C441 340 432 482 395 525C368 560 329 579 297 573Z"
            fill="#ff9c1c"
          />
          <path
            d="M302 556C233 535 264 459 283 410C303 448 320 385 328 328C348 398 381 461 360 511C348 544 323 559 302 556Z"
            fill="#ffe48d"
          />
        </>
      ) : null}
      {kind === "cloud" ? (
        <path
          d="M24 392C-33 337 22 258 97 276C81 152 232 135 257 218C294 93 466 127 447 255C542 190 644 322 563 400C521 463 78 460 24 392Z"
          fill="#e5dfce"
          opacity=".65"
        />
      ) : null}
      {kind === "poster" ? (
        <>
          <path
            d="m39 50 501-30 30 520-522 33Z"
            fill="#e0d0a8"
            stroke="#927956"
            strokeWidth="12"
          />
          <path d="m65 82 452-27 24 339-471 20Z" fill="#842f35" />
          <circle cx="296" cy="236" r="125" fill="#d7c9b0" />
          <path
            d="m296 122 27 79 83 2-67 51 22 82-65-48-68 48 23-81-67-52 83-2Z"
            fill="#8d3940"
          />
          <text
            x="302"
            y="475"
            fill="#6f282c"
            fontFamily="Georgia,serif"
            fontSize="58"
            textAnchor="middle"
            fontWeight="bold"
          >
            MY FREEDOM
          </text>
        </>
      ) : null}
    </svg>
  );
}
