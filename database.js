const sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "database.db"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time INTEGER NOT NULL, 
            lux INTEGER NOT NULL
            )`,
        (err) => {
            if (err) {
                // Table already created
                
                console.log("table existed!")
            }
            else{
                console.log("created table successfully")
            }
        });  
    }
});
module.exports = db