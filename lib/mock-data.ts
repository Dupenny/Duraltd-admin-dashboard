export const chartData = [
  { month: "Jun", revenue: 12400000, transactions: 890,  users: 2140 },
  { month: "Jul", revenue: 15800000, transactions: 1120, users: 2560 },
  { month: "Aug", revenue: 13200000, transactions: 980,  users: 2890 },
  { month: "Sep", revenue: 18900000, transactions: 1340, users: 3210 },
  { month: "Oct", revenue: 16400000, transactions: 1180, users: 3540 },
  { month: "Nov", revenue: 21000000, transactions: 1560, users: 3980 },
  { month: "Dec", revenue: 24500000, transactions: 1820, users: 4320 },
];

export const issueStatusData = [
  { name: "TODO",        value: 42,  color: "#F59E0B" },
  { name: "In Progress", value: 28,  color: "#2563EB" },
  { name: "Done",        value: 136, color: "#10B981" },
  { name: "Canceled",    value: 19,  color: "#EF4444" },
];

export const TRANSACTIONS = [
  { id: "#TXN-8821", customer: "Chioma Eze",      email: "chioma@email.com",   product: "DuraPay",      date: "2024-01-15T10:23:00", amount: 450000,   method: "Transfer",    status: "Completed" },
  { id: "#TXN-8820", customer: "Yusuf Abdullahi", email: "yusuf@email.com",    product: "DuraBiz",      date: "2024-01-15T09:45:00", amount: 1200000,  method: "Direct Debit",status: "Pending" },
  { id: "#TXN-8819", customer: "Ngozi Obi",       email: "ngozi@email.com",    product: "DuraPayment",  date: "2024-01-15T09:12:00", amount: 85000,    method: "Card",        status: "Completed" },
  { id: "#TXN-8818", customer: "Kola Adeyemi",    email: "kola@email.com",     product: "DuraPay",      date: "2024-01-15T08:30:00", amount: 670000,   method: "Transfer",    status: "Failed" },
  { id: "#TXN-8817", customer: "Amaka Okafor",    email: "amaka@email.com",    product: "DuraBiz",      date: "2024-01-14T17:55:00", amount: 2000000,  method: "USSD",        status: "Completed" },
  { id: "#TXN-8816", customer: "Tunde Bakare",    email: "tunde@email.com",    product: "DuraPayment",  date: "2024-01-14T15:00:00", amount: 320000,   method: "Card",        status: "Pending" },
  { id: "#TXN-8815", customer: "Blessing Nweke",  email: "blessing@email.com", product: "DuraPay",      date: "2024-01-14T13:20:00", amount: 95000,    method: "Transfer",    status: "Completed" },
  { id: "#TXN-8814", customer: "Segun Afolabi",   email: "segun@email.com",    product: "DuraBiz",      date: "2024-01-14T11:45:00", amount: 5600000,  method: "Direct Debit",status: "Completed" },
];

export const CUSTOMERS = [
  { id: "C001", name: "Chioma Eze",         email: "chioma@email.com",   phone: "+234 803 123 4567", product: "DuraPay",     plan: "Premium", status: "Active",   joined: "2023-03-12", transactions: 124, spent: 4500000 },
  { id: "C002", name: "Yusuf Abdullahi",    email: "yusuf@email.com",    phone: "+234 806 234 5678", product: "DuraBiz",     plan: "Business",status: "Active",   joined: "2023-01-08", transactions: 89,  spent: 18000000 },
  { id: "C003", name: "Ngozi Obi",          email: "ngozi@email.com",    phone: "+234 807 345 6789", product: "DuraPayment", plan: "Standard",status: "Active",   joined: "2023-05-22", transactions: 312, spent: 2100000 },
  { id: "C004", name: "Kola Adeyemi",       email: "kola@email.com",     phone: "+234 701 456 7890", product: "DuraPay",     plan: "Free",    status: "Inactive", joined: "2023-08-01", transactions: 12,  spent: 670000 },
  { id: "C005", name: "Amaka Okafor",       email: "amaka@email.com",    phone: "+234 802 567 8901", product: "DuraBiz",     plan: "Business",status: "Active",   joined: "2022-11-15", transactions: 428, spent: 42000000 },
  { id: "C006", name: "Lagos Tech Hub",     email: "pay@lagostechhub.ng",phone: "+234 901 678 9012", product: "DuraPayment", plan: "Enterprise",status: "Active", joined: "2022-06-01", transactions: 1204,spent: 84000000 },
  { id: "C007", name: "Zenith Trading Ltd", email: "info@zenith.ng",     phone: "+234 803 789 0123", product: "DuraBiz",     plan: "Business",status: "Active",   joined: "2022-09-14", transactions: 612, spent: 126000000 },
];

export const ISSUES = [
  { id: "#ISS-441", customer: "Bola Adesanya",  email:"bola@email.com",   product: "DuraPay",     subject: "Unable to complete transfer to GTBank",     priority: "High",   status: "TODO",        date: "2024-01-15T11:00:00", assignee: "Fatima Bello" },
  { id: "#ISS-440", customer: "Sade Martins",   email:"sade@email.com",   product: "DuraBiz",     subject: "Business account verification pending > 48h", priority: "Medium", status: "IN_PROGRESS", date: "2024-01-15T10:30:00", assignee: "Fatima Bello" },
  { id: "#ISS-439", customer: "Emeka Dike",     email:"emeka2@email.com", product: "DuraPayment", subject: "Duplicate charge on API transaction #8801",    priority: "High",   status: "TODO",        date: "2024-01-15T09:00:00", assignee: null },
  { id: "#ISS-438", customer: "Chiamaka Nze",   email:"chiamaka@email.com",product: "DuraPay",    subject: "App login failing after password reset",       priority: "Low",    status: "DONE",        date: "2024-01-14T14:00:00", assignee: "Fatima Bello" },
  { id: "#ISS-437", customer: "Musa Ibrahim",   email:"musa@email.com",   product: "DuraBiz",     subject: "Payroll processing error — 12 employees",      priority: "High",   status: "IN_PROGRESS", date: "2024-01-14T09:30:00", assignee: "Fatima Bello" },
  { id: "#ISS-436", customer: "Funke Adeola",   email:"funke@email.com",  product: "DuraPayment", subject: "Webhook not firing for successful payments",    priority: "Medium", status: "CANCELED",    date: "2024-01-13T16:00:00", assignee: null },
];

export const USERS = [
  { id: "u1", name: "Emeka Nwosu",    email: "ceo@duraltd.com",     role: "ceo",     status: "Active", lastLogin: "2024-01-15T08:00:00", initials: "EN", color: "#7C3AED" },
  { id: "u2", name: "Adaeze Okonkwo", email: "admin@duraltd.com",   role: "admin",   status: "Active", lastLogin: "2024-01-15T09:12:00", initials: "AO", color: "#2563EB" },
  { id: "u3", name: "Fatima Bello",   email: "support@duraltd.com", role: "support", status: "Active", lastLogin: "2024-01-15T10:45:00", initials: "FB", color: "#10B981" },
];
