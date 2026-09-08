export type RecentCustomerRow = {
  id: string
  name: string
  email: string
  plan: string
  status: 'Subscribed' | 'Inactive' | 'Unsubscribed'
  billing: 'Paid' | 'Pending' | 'Overdue' | 'Trial'
  joined: string
}
