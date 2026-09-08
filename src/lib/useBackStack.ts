import { useCallback, useEffect, useState } from 'react'

/**
 * Pilha de telas com histórico real do navegador: cada "push" empurra uma
 * entrada no `history`, e o botão nativo de voltar (ou o `pop()` local)
 * remove uma tela por vez em vez de sair do fluxo inteiro.
 */
export function useBackStack<T>(initial: T) {
  const [stack, setStack] = useState<T[]>([initial])

  useEffect(() => {
    window.history.replaceState({ cbwBackStackDepth: 0 }, '')

    function onPopState() {
      setStack((current) => (current.length > 1 ? current.slice(0, -1) : current))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const push = useCallback((screen: T) => {
    setStack((current) => {
      const next = [...current, screen]
      window.history.pushState({ cbwBackStackDepth: next.length - 1 }, '')
      return next
    })
  }, [])

  // Delega ao histórico real para que o botão nativo e o botão "Voltar" da
  // tela sigam exatamente o mesmo caminho de código.
  const pop = useCallback(() => {
    setStack((current) => {
      if (current.length > 1) window.history.back()
      return current
    })
  }, [])

  const reset = useCallback((screen: T) => {
    window.history.replaceState({ cbwBackStackDepth: 0 }, '')
    setStack([screen])
  }, [])

  return { current: stack[stack.length - 1], push, pop, reset }
}
