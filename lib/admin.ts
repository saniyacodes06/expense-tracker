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
        query<CategoryTotal>(
            `SELECT category, SUM(amount) AS total
       FROM expenses
       GROUP BY category
       ORDER BY total DESC
       LIMIT 5`
        ),
    ]);

    return { ...totals, topCategories };
}