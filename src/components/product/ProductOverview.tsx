/** About the product: the CMS description (rich text, cleaned on the server in src/lib/html.ts). */
export function ProductOverview({ name, html }: { name: string; html: string }) {
  return (
    <section id="overview" className="shell section-y scroll-mt-24" data-section>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="t-display">About the {name}</h2>
        </div>
        <div className="t-body rich-text grid content-start gap-5 text-[17px] leading-[1.65] text-ink/80" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}
