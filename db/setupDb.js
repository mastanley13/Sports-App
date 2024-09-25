const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('oauth_data.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS oauth_data (
    locationId TEXT PRIMARY KEY,
    access_token TEXT,
    token_type TEXT,
    expires_in INTEGER,
    refresh_token TEXT,
    scope TEXT,
    userType TEXT,
    companyId TEXT,
    userId TEXT
  )`);
});

db.close();