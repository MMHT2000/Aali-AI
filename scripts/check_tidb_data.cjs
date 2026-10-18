const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: Number(process.env.MYSQL_PORT) || 4000,
    user: process.env.MYSQL_USER || 'oiAE5AqrJrB3NYt.root',
    password: process.env.MYSQL_PASSWORD || 'KOhmlcUBBu33wjqd',
    database: process.env.MYSQL_DATABASE || 'aali_ai',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  console.log('Connected to TiDB successfully!');
  const [tables] = await connection.query('SHOW TABLES');
  console.log('Tables in database:');
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    console.log(`- ${tableName}: ${count} rows`);
  }
  await connection.end();
}

main().catch(err => {
  console.error('Error querying TiDB:', err);
  process.exit(1);
});

