//Database se statistics calculate karta hai..//
import { query, queryOne } from "@/lib/db";

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
};
export async function listUsers(search: string, page: number) {
    const pattern = `%${search}%`;
    const offset = (page - 1) * PAGE_SIZE;

    const [users, countRow] = await Promise.all([
        query<AdminUser>(
            `SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
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

    const total = Number(countRow?.total ?? 0);
    return { users, total, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
