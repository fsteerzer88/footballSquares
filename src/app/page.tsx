import Link from "next/link";
import { BoardCodeLookup } from "@/components/BoardCodeLookup";

const features = [
  {
    title: "Single game or season boards",
    text: "Create a board from a selected NFL or college schedule, or sell the same square for every regular-season game."
  },
  {
    title: "Fair square numbers",
    text: "Buyers pick positions before digits are visible. Season boards can randomize digits again before each game."
  },
  {
    title: "Host controls",
    text: "Set square price, quarter payouts, final payout, visibility, access code, and optional buyer limits."
  }
];

const highlights = [
  { value: "NFL + NCAA", label: "Board schedules" },
  { value: "100", label: "Squares per board" },
  { value: "Q1-Q3-Final", label: "Host payouts" }
];

export default function HomePage() {
  return (
    <div className="home-shell">
      <section className="home-hero">
        <div className="hero-visual" aria-hidden="true">
          <div className="preview-board">
            <div className="preview-board-header">
              <div>
                <span>Friday Night Fundraiser</span>
                <strong>Lions at Packers</strong>
              </div>
              <div className="preview-live">Open</div>
            </div>
            <div className="preview-axis preview-axis-top">Packers</div>
            <div className="preview-axis preview-axis-side">Lions</div>
            <div className="preview-grid">
              {Array.from({ length: 100 }, (_, index) => (
                <span
                  className={
                    index % 13 === 0 || index % 17 === 0
                      ? "claimed"
                      : index % 29 === 0
                        ? "winner"
                        : ""
                  }
                  key={index}
                />
              ))}
            </div>
            <div className="preview-payments">
              <span>Received</span>
              <strong>$860</strong>
              <span>Owed</span>
              <strong>$400</strong>
            </div>
          </div>
        </div>
        <div className="home-hero-content">
          <p className="eyebrow">Youth sports fundraising</p>
          <h1>Football squares that feel easy to host.</h1>
          <p className="hero-lede">
            Create NFL or college boards, sell squares, track payment status, and give families a
            clean private-code link instead of a messy spreadsheet.
          </p>
          <div className="actions">
            <Link className="button" href="/boards/new">
              Create a board
            </Link>
            <Link className="button secondary" href="/marketplace">
              Browse boards
            </Link>
          </div>
          <BoardCodeLookup />
        </div>
      </section>
      <section className="home-stats" aria-label="Platform highlights">
        {highlights.map((highlight) => (
          <div key={highlight.label}>
            <strong>{highlight.value}</strong>
            <span>{highlight.label}</span>
          </div>
        ))}
      </section>
      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">Built for repeat fundraisers</p>
          <h2>Everything a host needs to sell and track squares.</h2>
        </div>
        <div className="feature-grid">
          {features.map((feature) => (
            <article className="card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
