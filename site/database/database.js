const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.resolve(__dirname, '..', 'db.sqlite3');

let SQL = null;
let db = null;

// Begin async initialization immediately
const ready = (async () => {
    SQL = await initSqlJs({
        locateFile: (file) => require.resolve('sql.js/dist/' + file),
    });

    if (fs.existsSync(DB_PATH)) {
        const fbuf = fs.readFileSync(DB_PATH);
        db = new SQL.Database(new Uint8Array(fbuf));
    } else {
        db = new SQL.Database();
    }
})();

function persist() {
    if (!db) return;
    const data = db.export();
    const buf = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buf);
}

// Thin wrapper mimicking better-sqlite3's prepare API, returning promise-based get/all/run
function prepare(sql) {
    return {
        async get(...params) {
            await ready;
            const stmt = db.prepare(sql);
            stmt.bind(params);
                const hasRow = stmt.step();
                const row = hasRow ? stmt.getAsObject() : undefined;
            stmt.free();
            return row && Object.keys(row).length ? row : undefined;
        },
        async all(...params) {
            await ready;
            const stmt = db.prepare(sql);
            stmt.bind(params);
            const rows = [];
            while (stmt.step()) {
                rows.push(stmt.getAsObject());
            }
            stmt.free();
            return rows;
        },
        async run(...params) {
            await ready;
            const stmt = db.prepare(sql);
            stmt.bind(params);
            stmt.step();
            stmt.free();
            const changes = db.getRowsModified();
            // last_insert_rowid() works for the connection
            const lastIdRes = db.exec('SELECT last_insert_rowid() as id');
            const lastID = (lastIdRes && lastIdRes[0] && lastIdRes[0].values[0]) ? lastIdRes[0].values[0][0] : undefined;
            persist();
            return { lastID, changes };
        },
    };
}

module.exports = {
    prepare,
    // Expose a ready promise for optional awaiting by advanced callers
    _ready: ready,
};