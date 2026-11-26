//Database se statistics calculate karta hai..//
import { query, queryOne } from "@/lib/db";
import { lastFourDigits } from "@/lib/crypto";

/*adminstats- tells o/p return type. string becaude pg gives count n sum in strng format"4".*/

export type AdminStats = {
    total_users: string;
    total_expenses: string;
    month_total: string;
};

export type CategoryTotal = {
    category: string;
    total: string;
};

/*promsie.all because two queries ru parallely, in asnyn and dont wait for one to get finsiehd, quic kresult is achieved. */
/* coalesce- used to handle null values, if no expenses then return 0 */
/* date_trunc - truncates the date to the nearest month */
export async function getAdminStats() {
    const [totals, topCategories] = await Promise.all([
        queryOne<AdminStats>(
            `SELECT
         (SELECT COUNT(*) FROM users) AS total_users,
         (SELECT COUNT(*) FROM expenses) AS total_expenses,
         (SELECT COALESCE(SUM(amount), 0) FROM expenses
          WHERE date_trunc('month', created_at) = date_trunc('month', NOW())) AS month_total`
        ),
        /*category n sum - group by is used to group the expenses by category,ORDER BY is used to sort the expenses by category, LIMIT is used to limit the number of expenses to the top 5*/
        query<CategoryTotal>(
            `SELECT category, SUM(amount) AS total
       FROM expenses
       GROUP BY category
       ORDER BY total DESC
       LIMIT 5`
        ),
    ]);
    /*dono results  ek h object meh jodna- totaals,topcategories*/

    return { ...totals, topCategories };
}

export const PAGE_SIZE = 10;

export type AdminUser = {
    id: number;
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    is_active: boolean;
    created_at: string;
    expense_count: string;
    phone_last4: string | null; // "••••3210": the admin never sees the full number
};

type UserRow = Omit<AdminUser, "phone_last4"> & { phone_encrypted: string | null };

// swap the encrypted phone for its last 4 digits before anything leaves the server
function withPhoneLast4<T extends { phone_encrypted: string | null }>({ phone_encrypted, ...rest }: T) {
    return { ...rest, phone_last4: lastFourDigits(phone_encrypted) };
}

export async function listUsers(search: string, page: number) {
    const pattern = `%${search}%`;
    const offset = (page - 1) * PAGE_SIZE;

    const [rows, countRow] = await Promise.all([
        query<UserRow>(
            `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at, u.phone_encrypted,
              COUNT(e.id) AS expense_count
       FROM users u
       LEFT JOIN expenses e ON e.user_id = u.id
       WHERE u.email ILIKE $1
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $2 OFFSET $3`,
            [pattern, PAGE_SIZE, offset]
        ),
        queryOne<{ total: string }>(
            "SELECT COUNT(*) AS total FROM users WHERE email ILIKE $1",
            [pattern]
        ),
    ]);

    const users = rows.map(withPhoneLast4);
    const total = Number(countRow?.total ?? 0);
    return { users, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
export async function updateUser(
    id: number,
    changes: { role?: "USER" | "ADMIN"; isActive?: boolean }
) {
    const user = await queryOne<Omit<AdminUser, "expense_count" | "phone_last4">>(
        `UPDATE users
     SET role = COALESCE($2, role),
         is_active = COALESCE($3, is_active)
     WHERE id = $1
     RETURNING id, name, email, role, is_active, created_at`,
        [id, changes.role ?? null, changes.isActive ?? null]
    );

    // deactivated: end all their sessions right now
    if (user && changes.isActive === false) {
        await query("DELETE FROM sessions WHERE user_id = $1", [id]);
    }
    return user;
}
export async function getUser(id: number) {
    const row = await queryOne<Omit<UserRow, "expense_count">>(
        "SELECT id, name, email, role, is_active, created_at, phone_encrypted FROM users WHERE id = $1",
        [id]
    );
    return row ? withPhoneLast4(row) : null;
}

export type AdminExpense = {
    id: number;
    title: string;
    amount: string;
    category: string;
    created_at: string;
    user_id: number;
    user_email: string;
};

export type ExpenseFilters = {
    user?: string; // part of the owner's email
    category?: string;
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD, whole day included
};

export async function listExpenses(filters: ExpenseFilters, page: number) {
    // build WHERE from the filters that were sent; values always go as $1, $2...
    const where: string[] = [];
    const values: unknown[] = [];

    if (filters.user) {
        values.push(`%${filters.user}%`);
        where.push(`u.email ILIKE $${values.length}`);
    }
    if (filters.category) {
        values.push(filters.category);
        where.push(`e.category = $${values.length}`);
    }
    if (filters.from) {
        values.push(filters.from);
        where.push(`e.created_at >= $${values.length}::date`);
    }
    if (filters.to) {
        values.push(filters.to);
        where.push(`e.created_at < $${values.length}::date + 1`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const offset = (page - 1) * PAGE_SIZE;

    const [expenses, countRow] = await Promise.all([
        query<AdminExpense>(
            `SELECT e.id, e.title, e.amount, e.category, e.created_at,
                    e.user_id, u.email AS user_email
             FROM expenses e
             JOIN users u ON u.id = e.user_id
             ${whereSql}
             ORDER BY e.created_at DESC
             LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
            [...values, PAGE_SIZE, offset]
        ),
        queryOne<{ total: string }>(
            `SELECT COUNT(*) AS total
             FROM expenses e
             JOIN users u ON u.id = e.user_id
             ${whereSql}`,
            values
        ),
    ]);

    const total = Number(countRow?.total ?? 0);
    return { expenses, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

// admin can delete any expense; returns false if it did not exist
export async function deleteAnyExpense(id: number) {
    const row = await queryOne<{ id: number }>(
        "DELETE FROM expenses WHERE id = $1 RETURNING id",
        [id]
    );
    return row !== null;
}
