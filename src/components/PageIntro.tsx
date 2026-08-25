export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="mx-auto max-w-[1200px] px-7 pt-14 pb-9">
      <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground">{eyebrow}</p>
      <h1 className="font-heading text-4xl font-semibold text-foreground">{title}</h1>
      <p className="mt-3 max-w-[590px] text-sm leading-relaxed text-muted-foreground">{text}</p>
    </section>
  )
}
