const dbConnection = require('../Db/dbConfig');

const users = `CREATE TABLE IF NOT EXISTS users (
  userid SERIAL PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  firstname VARCHAR(20) NOT NULL,
  lastname VARCHAR(20) NOT NULL,
  email VARCHAR(40) NOT NULL,
  password VARCHAR(100) NOT NULL,
  profile_pic TEXT DEFAULT NULL
);`;

const questions = `CREATE TABLE IF NOT EXISTS questions (
  questionid SERIAL PRIMARY KEY,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(400) NOT NULL,
  tag VARCHAR(50),
  createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0
);`;

const answers = `CREATE TABLE IF NOT EXISTS answers (
  answerid SERIAL PRIMARY KEY,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  questionid INTEGER REFERENCES questions(questionid) ON DELETE CASCADE,
  answer VARCHAR(400) NOT NULL,
  createdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0,
  edited BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP NULL DEFAULT NULL
);`;

// New upgrade queries
// const alterAnswers = ...
// const alterQuestions = ...
// const alterUsers = ...

const createAnswerVotes = `CREATE TABLE IF NOT EXISTS answer_votes (
  voteid SERIAL PRIMARY KEY,
  answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  vote SMALLINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_vote UNIQUE (answerid, userid)
);`;

const createAnswerComments = `CREATE TABLE IF NOT EXISTS answer_comments (
  commentid SERIAL PRIMARY KEY,
  answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
  userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

// Export all at once
module.exports = {
  users,
  questions,
  answers,
  // alterAnswers,
  // alterQuestions,
  // alterUsers,
  createAnswerVotes,
  createAnswerComments,
};

// Helper to add column if it doesn't exist
async function addColumnIfNotExists(table, column, definition) {
  const res = await dbConnection.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  );
  if (res.rows.length === 0) {
    await dbConnection.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`);
  }
}

// Run migrations
(async () => {
  try {
    // Users table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS users (
        userid SERIAL PRIMARY KEY,
        username VARCHAR(20) NOT NULL,
        firstname VARCHAR(20) NOT NULL,
        lastname VARCHAR(20) NOT NULL,
        email VARCHAR(40) NOT NULL,
        password VARCHAR(100) NOT NULL,
        profile_pic TEXT DEFAULT NULL
      );
    `);

    // Questions table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        questionid SERIAL PRIMARY KEY,
        userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
        title VARCHAR(200) NOT NULL,
        description VARCHAR(400) NOT NULL,
        tag VARCHAR(50),
        createdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        views INTEGER DEFAULT 0
      );
    `);

    // Answers table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS answers (
        answerid SERIAL PRIMARY KEY,
        userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
        questionid INTEGER REFERENCES questions(questionid) ON DELETE CASCADE,
        answer VARCHAR(400) NOT NULL,
        createdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        views INTEGER DEFAULT 0,
        edited BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP NULL DEFAULT NULL
      );
    `);

    // Answer votes table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS answer_votes (
        voteid SERIAL PRIMARY KEY,
        answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
        userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
        vote SMALLINT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_vote UNIQUE (answerid, userid)
      );
    `);

    // Answer comments table
    await dbConnection.query(`
      CREATE TABLE IF NOT EXISTS answer_comments (
        commentid SERIAL PRIMARY KEY,
        answerid INTEGER NOT NULL REFERENCES answers(answerid) ON DELETE CASCADE,
        userid INTEGER REFERENCES users(userid) ON DELETE SET NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Optional: Add future upgrade columns
    await addColumnIfNotExists('users', 'password_reset_token', 'VARCHAR(255) NULL');
    await addColumnIfNotExists('users', 'token_expiry', 'TIMESTAMPTZ NULL');

    console.log('✅ Migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration error:', err);
  }
})();































// const dbConnection = require('../Db/dbConfig');


// Add a helper to check if a column exists before altering
// async function addColumnIfNotExists(table, column, definition) {
//   const res = await dbConnection.query(
//     `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
//     [table, column]
//   );
//   if (res.rows.length === 0) {
//     await dbConnection.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${column} ${definition}`);
//   }
// }


// In your migration logic, replace direct ALTER TABLE with:
// (async () => {
//   try {
//     await dbConnection.query('CREATE TABLE IF NOT EXISTS users (userid SERIAL PRIMARY KEY, username VARCHAR(255), email VARCHAR(255), password VARCHAR(255), profile_pic TEXT);');
//     await addColumnIfNotExists('users', 'profile_pic', 'TEXT');
//     await dbConnection.query('CREATE TABLE IF NOT EXISTS questions (questionid SERIAL PRIMARY KEY, title VARCHAR(255), description TEXT, createdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, userid INTEGER, views INTEGER DEFAULT 0);');
//     await addColumnIfNotExists('questions', 'views', 'INTEGER DEFAULT 0');
//     await dbConnection.query('CREATE TABLE IF NOT EXISTS answers (answerid SERIAL PRIMARY KEY, answer TEXT, createdate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, userid INTEGER, questionid INTEGER, views INTEGER DEFAULT 0);');
//     await addColumnIfNotExists('answers', 'views', 'INTEGER DEFAULT 0');
//     // ... other migrations ...
//     await addColumnIfNotExists('users', 'password_reset_token', 'VARCHAR(255) NULL');
//     await addColumnIfNotExists('users', 'token_expiry', 'TIMESTAMPTZ NULL');
//   } catch (err) {
//     console.error('Migration error:', err);
//   }
// })();
