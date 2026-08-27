export function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-normal leading-none tracking-tight text-foreground">{title}</h1>
      <p className="mt-1 max-w-[640px] text-sm leading-relaxed text-muted-foreground">{text}</p>
    </section>
  )
}
