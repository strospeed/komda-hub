export type View = 'dashboard' | 'members' | 'finance' | 'inventory_sound' | 'inventory_media' | 'inventory_property' | 'borrowing' | 'calendar' | 'discord_webhook' | 'songs' | 'rota' | 'prayers' | 'tasks' | 'profile';

export interface Member { id: string; name: string; role: string; division: string; contact: string; joinDate: string; xp: number; qrId?: string; photoUrl?: string; }
export interface Transaction { id: string; type: 'income' | 'expense'; amount: number; description: string; date: string; category?: string; }
export type InventoryCategory = 'Sound System' | 'Multimedia' | 'Properti';
export interface InventoryItem { id: string; name: string; category: InventoryCategory; condition: 'Good' | 'Needs Repair' | 'Broken'; quantity: number; location: string; qrCodeId?: string; }
export interface BorrowingRequest { id: string; itemId: string; itemName: string; borrowerName: string; startDate: string; endDate: string; status: 'Pending' | 'Approved' | 'Rejected' | 'Returned'; purpose?: string; }
export interface EventItem { id: string; title: string; date: string; time: string; description: string; type: string; location: string; }
export interface Song { id: string; title: string; key: string; lyrics: string; }
export interface Rota { id: string; date: string; event: string; wl: string; musicians: string; multimedia: string; }
export interface Prayer { id: string; author: string; content: string; date: string; prayCount: number; }
export interface Task { id: string; title: string; assignee: string; status: 'To Do' | 'In Progress' | 'Done'; event: string; }
