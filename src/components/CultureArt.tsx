// Original symbolic illustrations, not copies of textbook photographs.
export function CultureArt({ kind, label }: { kind: string; label: string }) {
  return (
    <svg
      viewBox="0 0 260 160"
      role="img"
      aria-label={label}
      className={`culture-art art-${kind}`}
    >
      <rect
        width="260"
        height="160"
        rx="15"
        fill={
          kind === "boat"
            ? "#ede0c5"
            : kind === "guanyin"
              ? "#e1e9dd"
              : "#e9e7d1"
        }
      />
      <circle cx="214" cy="33" r="19" fill="#efd496" />
      <path d="M0 136Q65 105 130 133T260 124V160H0" fill="#b7c9a5" />
      {kind === "lantern" ? (
        <>
          <path
            d="M20 28Q130 65 240 28"
            stroke="#7b7050"
            strokeWidth="3"
            fill="none"
          />
          {[65, 130, 195].map((x, i) => (
            <g
              className="festival-lantern"
              key={x}
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              <path d={`M${x} 40V65`} stroke="#a0804f" strokeWidth="2" />
              <rect
                x={x - 21}
                y="62"
                width="42"
                height="53"
                rx="20"
                fill="#c7684f"
                stroke="#ebbd6b"
                strokeWidth="3"
              />
              <path
                d={`M${x} 63V113M${x} 116V135`}
                stroke="#f3d287"
                strokeWidth="3"
              />
            </g>
          ))}
        </>
      ) : kind === "keeper" ? (
        <>
          <rect x="0" y="0" width="260" height="160" rx="15" fill="#334d4d" />
          <circle cx="130" cy="65" r="44" fill="#49605b" />
          <path
            d="M60 87Q95 72 130 90Q165 72 200 87V135Q165 121 130 139Q95 121 60 135Z"
            fill="#f1deb0"
            stroke="#c6a260"
            strokeWidth="3"
          />
          <path
            d="M130 91V136M75 100L114 104M75 113L114 117M146 104L185 100M146 117L185 113"
            stroke="#b49d69"
            strokeWidth="2"
          />
          <path
            d="M130 20L136 40 156 46 136 52 130 72 124 52 104 46 124 40Z"
            fill="#efc766"
          />
          <circle cx="62" cy="47" r="3" fill="#c6ac68" />
          <circle cx="195" cy="55" r="3" fill="#c6ac68" />
        </>
      ) : kind === "boat" ? (
        <>
          <path d="M57 102H208L181 132H86Z" fill="#976148" />
          <path
            d="M132 31V106M132 36L188 84H132Z"
            fill="#ce674c"
            stroke="#b18b49"
            strokeWidth="3"
          />
          <path
            d="M53 142Q73 135 95 142T139 142T183 142T227 142"
            fill="none"
            stroke="#638e90"
            strokeWidth="5"
          />
        </>
      ) : kind === "crane" ? (
        <>
          <path d="M82 110Q146 65 176 91Q164 122 122 125Z" fill="#fffdf2" />
          <path
            d="M162 97Q193 74 176 45Q171 29 184 26"
            fill="none"
            stroke="#fffdf2"
            strokeWidth="13"
          />
          <path d="M181 25L211 29 183 33" fill="#ba6844" />
          <path
            d="M120 120L115 145M139 118L149 145"
            stroke="#745746"
            strokeWidth="4"
          />
          <circle cx="181" cy="25" r="2" fill="#3e4536" />
        </>
      ) : kind === "fortune" ? (
        <>
          <circle cx="131" cy="82" r="43" fill="#927448" />
          <path
            d="M131 39A43 43 0 0 1 131 125A22 22 0 0 1 131 82A22 22 0 0 0 131 39"
            fill="#f6edd1"
          />
          <circle cx="131" cy="61" r="7" fill="#927448" />
          <circle cx="131" cy="104" r="7" fill="#f6edd1" />
          <rect x="35" y="63" width="25" height="58" rx="4" fill="#cb7356" />
          <path d="M47 70V110" stroke="#f3c96d" strokeWidth="4" />
        </>
      ) : kind === "harvest" ? (
        <>
          <path
            d="M130 138V42M130 115L96 85M130 98L160 69M130 77L107 56"
            stroke="#748751"
            strokeWidth="5"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} fill="#d9b756">
              <ellipse
                cx={110 + i * 5}
                cy={57 + i * 17}
                rx="7"
                ry="13"
                transform={`rotate(-40 ${110 + i * 5} ${57 + i * 17})`}
              />
              <ellipse
                cx={148 - i * 3}
                cy={67 + i * 16}
                rx="7"
                ry="13"
                transform={`rotate(40 ${148 - i * 3} ${67 + i * 16})`}
              />
            </g>
          ))}
        </>
      ) : kind === "parade" || kind === "drum" ? (
        <>
          <rect x="79" y="62" width="102" height="55" rx="21" fill="#b95e47" />
          <ellipse
            cx="130"
            cy="63"
            rx="51"
            ry="16"
            fill="#f3d691"
            stroke="#ae814a"
            strokeWidth="4"
          />
          <path
            d="M98 117L87 143M162 117L174 143M83 28L119 58M178 29L141 59"
            stroke="#7e6042"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <g fill="#f7dc94">
            {[95, 117, 140, 164].map((x) => (
              <circle key={x} cx={x} cy="94" r="3" />
            ))}
          </g>
          <path
            d="M39 39L43 47 51 51 43 55 39 63 35 55 27 51 35 47Z"
            fill="#d1a64f"
          />
        </>
      ) : kind === "mazu" || kind === "guanyin" || kind === "guardian" ? (
        <>
          <path
            d="M86 135Q90 84 130 81 169 84 174 135Z"
            fill={
              kind === "guanyin"
                ? "#faf6e5"
                : kind === "mazu"
                  ? "#c97050"
                  : "#5c8064"
            }
          />
          <circle cx="130" cy="61" r="26" fill="#e9ba8e" />
          <path
            d="M103 49Q107 12 130 17 155 16 159 49Z"
            fill={kind === "guanyin" ? "#fffdf2" : "#c59c4d"}
          />
          <path d="M110 48H150" stroke="#b47d3d" strokeWidth="5" />
          <circle cx="121" cy="63" r="2" fill="#5b4b37" />
          <circle cx="139" cy="63" r="2" fill="#5b4b37" />
          <path
            d="M124 73Q130 77 136 73"
            stroke="#9d7252"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M110 105L130 119 151 105"
            stroke="#f1d28b"
            strokeWidth="4"
            fill="none"
          />
          <path
            d="M83 139H178"
            stroke="#b99862"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path d="M72 124V72H188V124" fill="#d4b478" />
          <path
            d="M55 73Q85 62 100 35H160Q174 62 205 73Q130 87 55 73"
            fill="#3c715b"
            stroke="#d5af63"
            strokeWidth="3"
          />
          <path d="M114 124V92Q130 79 146 92V124" fill="#9c624c" />
          <path d="M87 84V124M173 84V124" stroke="#bd694e" strokeWidth="8" />
          <path d="M61 129H199" stroke="#baac86" strokeWidth="7" />
        </>
      )}
    </svg>
  );
}
