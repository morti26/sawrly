import { Pool } from 'pg';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Helper for single query execution
export const query = async (text: string, params?: any[]) => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is missing');
    }
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
        console.log('executed query', { duration, rows: res.rowCount });
    }
    return res;
};

// Helper to get a client for transactions
export const getClient = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is missing');
    }
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;
    // Monkey patch to log queries
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);

    client.release = () => {
        clearTimeout(timeout);
        client.release = release;
        return release.apply(client);
    }
    return client;
};
