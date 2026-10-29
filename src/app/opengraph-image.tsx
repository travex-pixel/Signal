import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The link preview. Navy ground, the bars-and-beads mark drawn large,
 * the wordmark and the three-part promise. Static apart from the fonts,
 * which are vendored static instances of Schibsted Grotesk (OFL, see
 * fonts/OFL-SchibstedGrotesk.txt).
 */

export const alt = "SIGNAL. Know what matters. Understand why. Speak with confidence.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#231e4b";
const NAVY_800 = "#1a1638";
const CORAL = "#ee5f5b";
const CYAN = "#40c2d5";
const YELLOW = "#fabb14";
const NAVY_200 = "#c9c6dd";

function Bar({ x, y, w, color, bead }: { x: number; y: number; w: number; color: string; bead: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 38, display: "flex" }}>
      <div style={{ width: w, height: 38, borderRadius: 19, background: color }} />
      <div
        style={{
          position: "absolute",
          left: bead - 30,
          top: -11,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: NAVY,
          border: `12px solid ${color}`,
        }}
      />
    </div>
  );
}

export default async function Image() {
  const dir = join(process.cwd(), "src/app/fonts");
  const [bold, medium] = await Promise.all([
    readFile(join(dir, "SchibstedGrotesk-Bold.ttf")),
    readFile(join(dir, "SchibstedGrotesk-Medium.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_800} 100%)`,
          fontFamily: "Schibsted Grotesk",
          color: "#ffffff",
          position: "relative",
        }}
      >
        {/* Mark: three bars with beads, as in the top bar, drawn large on the right. */}
        <div style={{ position: "absolute", left: 720, top: 150, width: 420, height: 260, display: "flex" }}>
          <Bar x={0} y={0} w={300} color={CORAL} bead={222} />
          <Bar x={80} y={106} w={340} color={CYAN} bead={160} />
          <Bar x={28} y={212} w={320} color={CORAL} bead={270} />
        </div>

        <div style={{ position: "absolute", left: 96, top: 158, display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: 18, lineHeight: 1 }}>SIGNAL</div>
          <div style={{ marginTop: 28, fontSize: 36, fontWeight: 500, color: NAVY_200, letterSpacing: -0.5, lineHeight: 1.25 }}>
            Know what matters. Understand why.
          </div>
          <div style={{ fontSize: 36, fontWeight: 500, color: NAVY_200, letterSpacing: -0.5, lineHeight: 1.25 }}>
            Speak with confidence.
          </div>
        </div>

        {/* Foot rule and region beads. */}
        <div
          style={{
            position: "absolute",
            left: 96,
            right: 96,
            bottom: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.18)",
            paddingTop: 22,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 500, color: NAVY_200, letterSpacing: 0.5 }}>
            Daily business intelligence for an Australian importer
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[CYAN, CORAL, "#2062af", YELLOW, NAVY_200, "#8187a3"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Schibsted Grotesk", data: bold, style: "normal", weight: 700 },
        { name: "Schibsted Grotesk", data: medium, style: "normal", weight: 500 },
      ],
    },
  );
}
