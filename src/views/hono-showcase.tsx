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
        <link href="/src/styles.css" rel="stylesheet" />
        <title>{title}</title>
      </head>
      <body className="bg-white text-slate-900">
        <main className="mx-auto my-10 max-w-3xl px-4">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-slate-700">{description}</p>
          <ul className="mt-5 list-inside list-disc space-y-2 text-slate-800">
          {links.map((link) => (
            <li key={link.href}>
                <a className="underline underline-offset-4" href={link.href}>
                  {link.label}
                </a>
            </li>
          ))}
          </ul>
        </main>
      </body>
    </html>
  );
};
