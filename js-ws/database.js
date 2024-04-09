const {Client} = require("pg")
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({
    host: `${process.env.POSTGRES_HOST}`,
    user: `${process.env.POSTGRES_USER}`,
    password: `${process.env.POSTGRES_PASSWORD}`,
    database: `${process.env.POSTGRES_DB}`,
    port: `${process.env.POSTGRES_PORT}`,
    connectionLimit: 10
})

client.connect();

module.exports = client;
