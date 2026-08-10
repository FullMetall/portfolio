import { ExternalArrowIcon } from "./ExternalArrowIcon";

type ContactLink = {
  href: string;
  label: string;
  external?: boolean;
};

type PortfolioContactProps = {
  kicker: string;
  title: string;
  body?: string;
  links: readonly ContactLink[];
  className?: string;
  id?: string;
};

export function PortfolioContact({
  kicker,
  title,
  body,
  links,
  className,
  id = "contact",
}: PortfolioContactProps) {
  return (
    <section className={["portfolio-contact", className].filter(Boolean).join(" ")} id={id}>
      <div className="portfolio-contact-copy">
        <span className="portfolio-kicker">{kicker}</span>
        <h2>{title}</h2>
        {body && <p>{body}</p>}
      </div>
      <div className="portfolio-contact-links">
        {links.map((link) => (
          <a
            href={link.href}
            key={`${link.href}-${link.label}`}
            target={link.external ? "_blank" : undefined}
            rel={link.external ? "noreferrer" : undefined}
          >
            {link.label}
            <ExternalArrowIcon />
          </a>
        ))}
      </div>
    </section>
  );
}
