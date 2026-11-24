export const CATEGORIES = ["Food", "Travel", "Bills", "Shopping", "Other"] as const;

export type Category = (typeof CATEGORIES)[number];

// anything at or above this shows in red
export const BIG_EXPENSE_LIMIT = 1000;
