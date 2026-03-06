const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static frontend files from the parent directory
app.use(express.static(path.join(__dirname, "..")));

// Add a catch-all route to serve index.html for unknown routes if this is an SPA (optional but good practice)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* DATABASE CONNECTION */

const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "vijayshindhe",
    database: process.env.DB_NAME || "farmingdb",
    port: process.env.DB_PORT || 3306
};

// Aiven and some other cloud providers require SSL.
if (process.env.DB_HOST && process.env.DB_HOST !== "localhost") {
    dbConfig.ssl = {
        rejectUnauthorized: false // Required for many cloud providers
    };
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed!");
        console.error("Error Code:", err.code);
        console.error("Error Message:", err.message);
        console.error("Server will continue running, but DB operations will fail.");
    }
    else {
        console.log("✅ MySQL Connected successfully!");
    }
});

/* TEST ROUTE */

// Adjust the test route to avoid conflicting with index.html if necessary
app.get("/api/status", (req, res) => {
    res.send("Smart Farming API Running");
});

/* REGISTER */

app.post("/register", async (req, res) => {
    console.log("--> register endpoint hit!", req.body);
    const { username, password } = req.body;
    if (!password) {
        console.log("No password provided");
        return res.status(400).send("No password provided");
    }

    console.log("hashing password...");
    const hashed = await bcrypt.hash(password, 10);
    console.log("hashing complete.");

    db.query(
        "INSERT INTO users (username,password) VALUES (?,?)",
        [username, hashed],
        (err) => {
            console.log("db query returned", err ? "error" : "success");
            if (err) {
                console.error("Register DB Error:", err);
                return res.status(500).send("Register error: Database operation failed");
            }
            res.send("User Registered");
        }
    );

});

/* LOGIN */

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE username=?",
        [username],
        async (err, result) => {

            if (err) {
                console.error("Login DB Error:", err);
                return res.status(500).json({ message: "Database connection error" });
            }

            if (result.length === 0) {
                return res.json({ message: "User not found" });
            }

            const user = result[0];

            const match = await bcrypt.compare(password, user.password);

            if (!match) {
                return res.json({ message: "Wrong password" });
            }

            res.json({ message: "Login success" });

        });

});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});