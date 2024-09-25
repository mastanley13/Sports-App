const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const data = JSON.parse(fs.readFileSync('oauth_data.json', 'utf8'));

const db = new sqlite3.Database('oauth_data.db');

db.serialize(() => {
  const stmt = db.prepare(`INSERT OR REPLACE INTO oauth_data 
    (locationId, access_token, token_type, expires_in, refresh_token, scope, userType, companyId, userId) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  stmt.run(
    data.locationId,
    data.access_token,
    data.token_type,
    data.expires_in,
    data.refresh_token,
    data.scope,
    data.userType,
    data.companyId,
    data.userId
  );

  stmt.finalize();
});

db.close();