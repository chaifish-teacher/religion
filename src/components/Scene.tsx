export function Explorer({
  small = false,
  state = "idle",
}: {
  small?: boolean;
  state?: string;
}) {
  return (
    <svg
      data-state={state}
      className={small ? "explorer small" : "explorer"}
      viewBox="0 0 130 170"
      role="img"
      aria-label="Our explorer, wearing a jade hat and a golden backpack"
    >
      <ellipse cx="65" cy="161" rx="39" ry="7" fill="#163d3520" />
      <path d="M35 88Q14 91 19 129L43 132 50 95" fill="#db9b41" />
      <path
        d="M46 132L40 154 58 155 66 132M72 132L78 155 97 155 88 127"
        fill="#2b4a43"
      />
      <path d="M41 94Q63 81 88 96L96 133Q64 145 35 131Z" fill="#f6cc66" />
      <path d="M47 99L77 131" stroke="#b67b36" strokeWidth="7" />
      <path
        d="M40 100L25 124M89 101L105 119"
        stroke="#edb789"
        strokeWidth="13"
        strokeLinecap="round"
      />
      <ellipse cx="66" cy="66" rx="35" ry="34" fill="#f4c59e" />
      <path
        d="M32 59Q27 25 63 23 100 25 100 59L88 49 85 65 77 46 46 48 40 65Z"
        fill="#473c30"
      />
      <path d="M31 43Q33 7 65 9 97 10 100 43Z" fill="#397a60" />
      <ellipse cx="65" cy="43" rx="49" ry="10" fill="#275d4b" />
      <path d="M57 14L55 36 76 36 73 14" fill="#e8bd63" />
      <circle cx="53" cy="68" r="3" fill="#3c382d" />
      <circle cx="79" cy="68" r="3" fill="#3c382d" />
      <path
        d="M60 80Q66 87 73 79"
        fill="none"
        stroke="#925d47"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <ellipse cx="45" cy="77" rx="6" ry="3" fill="#eaa09a" />
      <ellipse cx="87" cy="77" rx="6" ry="3" fill="#eaa09a" />
      <path
        d="M41 151L34 161 61 161 60 152M78 152L77 161 103 161 95 152"
        fill="#664d37"
      />
    </svg>
  );
}
export function TempleScene() {
  return (
    <svg
      className="temple-scene"
      viewBox="0 0 820 570"
      role="img"
      aria-label="An original illustration of a Taiwanese temple courtyard with red lanterns, mountains and flowering trees"
    >
      <defs>
        <linearGradient id="sky" x2="0" y2="1">
          <stop stopColor="#efd0a3" />
          <stop offset="1" stopColor="#fff0cb" />
        </linearGradient>
        <linearGradient id="ground" x2="0" y2="1">
          <stop stopColor="#d3c6a2" />
          <stop offset="1" stopColor="#ead6a7" />
        </linearGradient>
        <radialGradient id="lantern-glow">
          <stop stopColor="#ffd475" stopOpacity=".8" />
          <stop offset="1" stopColor="#ffd475" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="820" height="570" rx="30" fill="url(#sky)" />
      <circle cx="638" cy="102" r="49" fill="#f6d78b" />
      <circle cx="176" cy="180" r="68" fill="url(#lantern-glow)" />
      <circle cx="659" cy="172" r="68" fill="url(#lantern-glow)" />
      <g className="scene-clouds" fill="#fff" opacity=".65">
        <ellipse cx="177" cy="92" rx="69" ry="13" />
        <ellipse cx="231" cy="85" rx="37" ry="17" />
        <ellipse cx="586" cy="48" rx="49" ry="10" />
      </g>
      <path
        d="M0 315L114 162 245 298 358 179 506 307 652 178 820 305V450H0"
        fill="#a5bfb0"
      />
      <path
        d="M0 345L107 254 249 353 426 253 544 347 706 250 820 332V450H0"
        fill="#80a18d"
      />
      <path d="M0 396Q239 331 410 369T820 374V570H0" fill="url(#ground)" />
      <path d="M344 399L491 399 683 570H153Z" fill="#eddfbf" />
      <g stroke="#c9b994" strokeWidth="2">
        <path d="M296 447H545M249 488H591M196 534H643M386 413L340 570M451 413L503 570" />
      </g>
      <g>
        <path d="M227 395V280H601V395" fill="#ad5442" />
        <path d="M245 307H583V395H245Z" fill="#f1dca5" />
        <path d="M361 315Q414 279 466 315V395H361Z" fill="#573d36" />
        <path d="M381 321H446V395H381Z" fill="#765144" />
        <g fill="#bd4939">
          <rect x="257" y="291" width="17" height="112" />
          <rect x="326" y="291" width="17" height="112" />
          <rect x="482" y="291" width="17" height="112" />
          <rect x="554" y="291" width="17" height="112" />
        </g>
        <g fill="#e6b759">
          <path d="M254 313H277V322H254M323 313H346V322H323M479 313H502V322H479M551 313H574V322H551" />
        </g>
        <path
          d="M208 284Q248 264 275 214H551Q574 264 619 284Q417 318 208 284Z"
          fill="#2c6757"
        />
        <path
          d="M210 282Q414 311 617 282"
          fill="none"
          stroke="#e8bc61"
          strokeWidth="8"
        />
        <path
          d="M275 216Q279 244 239 259M551 216Q548 244 588 260"
          fill="none"
          stroke="#468271"
          strokeWidth="5"
        />
        <path d="M296 220V189H532V220" fill="#c7734b" />
        <path
          d="M267 190Q314 177 338 127H490Q512 176 561 190Q414 216 267 190Z"
          fill="#326b59"
        />
        <path
          d="M269 189Q413 213 560 190"
          fill="none"
          stroke="#e8bc61"
          strokeWidth="7"
        />
        <path
          d="M337 128Q326 113 320 124M491 128Q503 112 510 123"
          fill="none"
          stroke="#c39b4e"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M402 125V104L413 95 425 104V125" fill="#c59c52" />
        <rect
          x="374"
          y="245"
          width="79"
          height="30"
          rx="4"
          fill="#5c4331"
          stroke="#edc979"
          strokeWidth="3"
        />
        <text
          x="414"
          y="266"
          textAnchor="middle"
          fill="#f2d78e"
          fontSize="19"
          fontFamily="serif"
        >
          平 安
        </text>
        <path d="M337 398H489L509 417H317Z" fill="#c2b69c" />
        <path d="M317 417H509L522 428H303Z" fill="#dbceb1" />
      </g>
      <g stroke="#66513b" strokeWidth="2">
        <path d="M176 64V193M659 51V182" />
      </g>
      <g fill="#cf5943" stroke="#f2bb66" strokeWidth="3">
        <rect x="155" y="151" width="43" height="54" rx="21" />
        <rect x="637" y="144" width="43" height="54" rx="21" />
      </g>
      <g stroke="#edba61" strokeWidth="3">
        <path d="M176 155V202M166 155Q155 180 166 201M186 155Q197 180 186 201M659 147V195M649 147Q638 172 649 194M669 147Q681 172 669 194M176 206V226M659 199V220" />
      </g>
      <g>
        <path
          d="M67 457Q89 357 76 294M758 447Q734 336 762 266"
          stroke="#7d6b45"
          strokeWidth="17"
          fill="none"
        />
        <g fill="#487953">
          <circle cx="62" cy="295" r="61" />
          <circle cx="107" cy="330" r="48" />
          <circle cx="22" cy="357" r="54" />
          <circle cx="762" cy="268" r="66" />
          <circle cx="708" cy="317" r="52" />
          <circle cx="806" cy="330" r="61" />
        </g>
        <g fill="#709866">
          <circle cx="49" cy="275" r="33" />
          <circle cx="104" cy="311" r="27" />
          <circle cx="746" cy="240" r="35" />
          <circle cx="696" cy="297" r="23" />
        </g>
        <g fill="#f2bc8a">
          <circle cx="722" cy="270" r="5" />
          <circle cx="785" cy="253" r="5" />
          <circle cx="759" cy="307" r="5" />
          <circle cx="38" cy="309" r="5" />
          <circle cx="92" cy="286" r="5" />
        </g>
      </g>
      <g fill="#5b835b">
        <ellipse cx="137" cy="440" rx="41" ry="17" />
        <ellipse cx="668" cy="434" rx="49" ry="16" />
      </g>
      <g fill="#f8e6ad">
        <circle cx="126" cy="431" r="4" />
        <circle cx="144" cy="436" r="4" />
        <circle cx="656" cy="424" r="4" />
      </g>
      <path
        d="M0 520Q67 491 125 530L165 570H0M820 503Q757 488 712 532L690 570H820"
        fill="#719165"
      />
      <g fill="#ffefbf">
        <path d="M549 78L552 86 560 89 552 92 549 100 546 92 538 89 546 86Z" />
        <path d="M222 348L224 354 230 357 224 360 222 366 219 360 213 357 219 354Z" />
      </g>
    </svg>
  );
}
