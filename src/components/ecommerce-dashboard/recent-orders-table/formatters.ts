import type React from 'react'
import type { OrderFilter } from './schema'

export function formatOrderCount(filter: OrderFilter, count: number) {
  const orderLabel = count === 1 ? 'pedido' : 'pedidos'

  if (filter === 'Todos') {
    return `${count.toLocaleString('pt-BR')} ${orderLabel}`
  }

  if (filter === 'Requer ação') {
    return `${count.toLocaleString('pt-BR')} ${orderLabel} precisam de ação`
  }

  if (filter === 'Devoluções') {
    return `${count.toLocaleString('pt-BR')} ${count === 1 ? 'devolução' : 'devoluções'}`
  }

  return `${count.toLocaleString('pt-BR')} ${orderLabel} ${filter.toLowerCase()}`
}

export function formatSelectedOrderCount(count: number) {
  const orderLabel = count === 1 ? 'pedido' : 'pedidos'

  return `${count.toLocaleString('pt-BR')} ${orderLabel} selecionado(s)`
}

export function preventPaginationNavigation(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}
