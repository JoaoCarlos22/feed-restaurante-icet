const mysql = require('mysql2');
require('dotenv').config();

// Cria a conexão com o banco de dados usando variáveis de ambiente
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

async function testarConexao() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('Conexão com o banco de dados estabelecida com sucesso');
        console.log('Servidor MySQL conectado');
    } catch (erro){
        console.error('ERRO ao conectar com o banco de dados MySQL:');
        console.error('Detalhes do Erro:', erro.message);

    } finally{
        if (connection){
            connection.release();
        } 
    }
}

testarConexao();

module.exports = pool;