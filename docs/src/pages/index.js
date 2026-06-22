import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header style={{ padding: "4rem 0" }}>
      <div className="container">
        <div className="row" style={{ alignItems: "center" }}>
          <div className="col col--6">
            <Heading as="h1" style={{ fontSize: "3rem" }}>
              {siteConfig.title}
            </Heading>
            <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>
              {siteConfig.tagline}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link
                className="button button--primary button--lg"
                to="/docs"
              >
                Get Started
              </Link>
              <Link
                className="button button--secondary button--lg"
                href="https://glhf-lab.github.io/glhf/demo/"
              >
                Live Demo
              </Link>
              <Link
                className="button button--outline button--lg"
                to="/docs/architecture"
              >
                Architecture
              </Link>
            </div>
          </div>
          <div className="col col--6">
            <img
              src={useBaseUrl("/img/landing-page.jpg")}
              alt="Vintage gray game console and assorted computer equipment"
              style={{
                borderRadius: "8px",
                boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12)",
                width: "100%",
              }}
            />
            <p style={{ fontSize: "0.75rem", textAlign: "right", marginTop: "0.5rem", opacity: 0.6 }}>
              Photo by Lorenzo Herrera on{" "}
              <a href="https://unsplash.com/@lorenzoherrera" target="_blank" rel="noopener noreferrer">
                Unsplash
              </a>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    title: "Consented Data Donation",
    description:
      "No data is collected without informed consent. Participants voluntarily link their accounts and control their data throughout the study.",
  },
  {
    title: "Automated Collection",
    description:
      "Automated jobs collect recently played games, owned games, and profile data from Steam at configurable intervals.",
  },
  {
    title: "Survey Integration",
    description:
      "Integrates with Qualtrics and Prolific for automated survey distribution, reminders, and recruitment workflows.",
  },
];

function AlphaCallout() {
  return (
    <section style={{ padding: "0 0 2rem" }}>
      <div className="container">
        <div
          className="alert alert--warning"
          role="alert"
          style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}
        >
          <strong>Alpha Status</strong> — GLHF is under active development.
          The platform is functional and has been used in research studies, but
          APIs and documentation are still evolving. We welcome{" "}
          <Link to="/docs/contributing">contributions</Link>.
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section style={{ padding: "2rem 0 4rem" }}>
      <div className="container">
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className="col col--4" style={{ marginBottom: "1rem" }}>
              <div style={{ padding: "1rem" }}>
                <Heading as="h3">{feature.title}</Heading>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout description="Game Log Harvesting Framework — open-source data donation for gameplay research">
      <Hero />
      <main>
        <AlphaCallout />
        <Features />
      </main>
    </Layout>
  );
}
