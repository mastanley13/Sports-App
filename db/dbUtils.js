const sqlite3 = require('sqlite3').verbose();

function getOAuthData(locationId, callback) {
  const db = new sqlite3.Database('oauth_data.db');
  
  db.get('SELECT * FROM oauth_data WHERE locationId = ?', [locationId], (err, row) => {
    db.close();
    if (err) {
      return callback(err);
    }
    callback(null, row);
  });
}

module.exports = { getOAuthData };