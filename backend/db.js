const sqlite3 = require('sqlite3').verbose();
const DBSOURCE = "quotesdb.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(`CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            text TEXT
        )`,
      (err) => {
        if (err) {
          console.error("Table creation error:", err.message);
        }
      });
  }
});

module.exports = db;
