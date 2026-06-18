import Link from "next/link";

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

export default function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Youth sports fundraising</p>
          <h1>Football squares built for team hosts.</h1>
          <p>
            Run modern squares boards for NFL and college football fundraisers with schedules,
            live-score-ready game tracking, dashboards, and clear offline payment status.
          </p>
          <div className="actions">
            <Link className="button" href="/boards/new">
              Create a board
            </Link>
            <Link className="button secondary" href="/marketplace">
              Browse boards
            </Link>
          </div>
        </div>
        <div className="hero-field" aria-label="Football field and squares board illustration">
          <div className="scoreboard">
            Youth Fundraiser
            <strong>$20 Squares</strong>
          </div>
          <div className="grid-preview" aria-hidden="true">
            {Array.from({ length: 100 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-band">
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
