import type { RecentCustomerRow } from './schema'

const firstNames = ['Olivia', 'Liam', 'Emma', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas', 'Mia', 'Elijah', 'Amelia', 'James', 'Harper', 'Benjamin']
const lastNames = ['Carter', 'Bennett', 'Reyes', 'Foster', 'Nguyen', 'Cole', 'Morrison', 'Ellis', 'Hayes', 'Patel', 'Sullivan', 'Ward', 'Coleman', 'Brooks', 'Simmons', 'Dawson']
const plans = ['Starter', 'Pro', 'Business', 'Enterprise']
const statuses: RecentCustomerRow['status'][] = ['Subscribed', 'Inactive', 'Unsubscribed']
const billings: RecentCustomerRow['billing'][] = ['Paid', 'Pending', 'Overdue', 'Trial']

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Dataset sintético (mesmo formato/estrutura do bloco de referência dashboard-01) — sem dado real de negócio.
export const recentCustomers: RecentCustomerRow[] = Array.from({ length: 42 }, (_, index) => {
  const first = firstNames[index % firstNames.length]
  const last = lastNames[(index * 3 + 5) % lastNames.length]
  const daysAgo = Math.round(seededRandom(index * 1.3) * 150)
  const joined = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  return {
    id: `CUS-${1000 + index}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    plan: plans[Math.floor(seededRandom(index * 2.1 + 3) * plans.length)],
    status: statuses[Math.floor(seededRandom(index * 3.7 + 9) * statuses.length)],
    billing: billings[Math.floor(seededRandom(index * 4.3 + 11) * billings.length)],
    joined,
  }
})
