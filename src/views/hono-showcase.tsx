type PageLink = {
  href: string;
  label: string;
};

type HonoShowcaseProps = {
  title: string;
  description: string;
  links: PageLink[];
};

export const HonoShowcase = ({ title, description, links }: HonoShowcaseProps) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <title>{title}</title>
      </head>
      <body style="font-family: ui-sans-serif, system-ui; max-width: 860px; margin: 40px auto; padding: 0 16px; line-height: 1.6;">
        <h1>{title}</h1>
        <p>{description}</p>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
};
