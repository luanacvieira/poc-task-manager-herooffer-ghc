// VULNERABILIDADES PROPOSITAIS PARA CODEQL DETECTAR

//vulnerabilidades propositais para CodeQL
/*
// ❌ CodeQL: Path traversal vulnerability
const fs = require('fs');
const path = require('path');

function readUserFile(userInput) {
    // VULNERABILIDADE: Path traversal - CodeQL detecta
    const filePath = path.join('./uploads', userInput);
    return fs.readFileSync(filePath, 'utf8');
}

// ❌ CodeQL: SQL Injection  
function getUserById(id) {
    const mysql = require('mysql2');
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'password123', // Hardcoded password
        database: 'test'
    });
    
    // VULNERABILIDADE: SQL Injection via string concatenation
    const query = "SELECT * FROM users WHERE id = " + id;
    return connection.execute(query);
}

// ❌ CodeQL: Command Injection
const { exec } = require('child_process');

function processFile(filename) {
    // VULNERABILIDADE: Command injection
    exec(`convert ${filename} output.jpg`, (error, stdout, _stderr) => {
        console.log(stdout);
    });
}

// ❌ CodeQL: Hardcoded secrets
const API_SECRET = "abc123def456ghi789"; // Hardcoded secret
const JWT_KEY = "super-secret-jwt-key-123456";
const DB_CONN = "mongodb://admin:password123@localhost:27017/prod";

// Exportar funções para que CodeQL as analise
module.exports = {
    readUserFile,
    getUserById,
    processFile,
    API_SECRET,
    JWT_KEY,
    DB_CONN
}
*/
