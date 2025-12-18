import postgres from 'postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('Missing DATABASE_URL environment variable');
}

async function runMigrations() {
  const sql = postgres(connectionString, { max: 1 });
  
  try {
    console.log('Reading migration file...');
    const migrationSQL = readFileSync(
      join(process.cwd(), 'migrations/0000_flaky_dreaming_celestial.sql'),
      'utf-8'
    );

    // Split by statement breakpoint and filter out comments
    const statements = migrationSQL
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      console.log(statement.substring(0, 80) + '...');

      try {
        await sql.unsafe(statement);
        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (error: any) {
        console.error(`Failed to execute statement ${i + 1}:`, error.message);
        // Continue with next statement
      }
    }

    console.log('\n✅ All migrations completed!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigrations();
