export type PrintableSection = {
  heading?: string
  items: { label: string; url: string }[]
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>
  )[char] ?? char)
}

function buildHtml(title: string, sections: PrintableSection[]) {
  const body = sections.map((section) => `
    ${section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : ''}
    <ul>
      ${section.items.map((item) => `
        <li>
          <strong>${escapeHtml(item.label)}</strong>
          <a href="${escapeHtml(item.url)}">${escapeHtml(item.url)}</a>
        </li>
      `).join('')}
    </ul>
  `).join('')

  return `<!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #111827; padding: 32px; }
          h1 { font-size: 20px; margin: 0 0 4px; }
          h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: #6b7280; margin: 24px 0 8px; }
          ul { list-style: none; margin: 0; padding: 0; }
          li { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          a { color: #1d4ed8; word-break: break-all; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        ${body}
      </body>
    </html>`
}

/**
 * Prints a clickable-links document via a hidden iframe (not window.open),
 * so it isn't caught by pop-up blockers. User saves it as PDF from the print dialog.
 */
export function openPrintableLinks(title: string, sections: PrintableSection[]) {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden'
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  const doc = win?.document
  if (!win || !doc) {
    document.body.removeChild(iframe)
    return false
  }

  doc.open()
  doc.write(buildHtml(title, sections))
  doc.close()

  // O navegador sugere o nome do PDF a partir do título da página principal,
  // não do iframe, então trocamos temporariamente para exibir um nome sugestivo.
  const originalTitle = document.title
  document.title = title

  const cleanup = () => {
    document.title = originalTitle
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe)
  }
  win.addEventListener('afterprint', cleanup)
  window.setTimeout(cleanup, 60000) // failsafe se 'afterprint' não disparar

  win.focus()
  win.print()
  return true
}
