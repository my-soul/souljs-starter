import * as mysql from 'mysql';
import { QueryBuilder, Tx } from 'soul-orm';
import getLogger from './log4js';

const logger = getLogger('db.ts');

export const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Mysql@123456',
  database: 'pay',
});

pool.on('error', error => {
  // tslint:disable-next-line:no-console
  logger.error('soul-orm: %s', error.message);
});

pool.query('SELECT 1', error => {
  if (error) {
    // tslint:disable-next-line:no-console
    logger.error('soul-orm: %s', error.message);
  } else {
    // tslint:disable-next-line:no-console
    logger.info('mysql连接成功！');
  }
});

export async function query(
  sql: string,
  values?: any | mysql.QueryOptions,
  options?: mysql.QueryOptions,
): Promise<any[]> {
  let opt = null;
  if (arguments.length === 3) {
    opt = Object.assign(options, { sql: options, values });
  } else if (arguments.length === 2) {
    if (Array.isArray(values)) {
      opt = { sql, values };
    } else {
      opt = Object.assign(values, { sql });
    }
  } else {
    opt = { sql };
  }
  return new Promise((resolve, reject) => {
    pool.query(opt, (err: Error, results: any[]) => {
      if (err) {
        logger.error('db query error: sql: %s', sql);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

async function getPoolConnection(): Promise<mysql.PoolConnection> {
  return new Promise((res, rej) => {
    pool.getConnection((err: Error, connection: mysql.PoolConnection) => {
      if (err) {
        rej(err);
      } else {
        res(connection);
      }
    });
  });
}

export function table(tb: string): QueryBuilder {
  return QueryBuilder.table(tb, { queryFunction: query });
}

export async function beginTx() {
  const conn = await getPoolConnection();

  await new Promise((resolve, reject) => {
    conn.beginTransaction((err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  return new Tx({
    query: async (sql: string): Promise<any> => {
      return new Promise((resolve, reject) => {
        conn.query(sql, (err: Error, results: any[]) => {
          if (err) {
            logger.error('tx query error: sql: %s', sql);
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    },
    commit: async () => {
      return new Promise((resolve, reject) => {
        conn.commit((err: Error) => {
          conn.release();
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    },
    rollback: async () => {
      return new Promise(resolve => {
        conn.rollback(() => {
          conn.release();
          resolve();
        });
      });
    },
  });
}
