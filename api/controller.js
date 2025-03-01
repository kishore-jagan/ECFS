const { error } = require('console');
const { pool } = require('./db');

const getEcfsData = async (req, res) => {
    try {
        console.log("Querying database ecfs...");
        const ecfsresult = await pool.query('SELECT * FROM ecfs_data');
        res.json(ecfsresult.rows);
    } catch (err){
        console.error('Error fetching ecfs data:', err);
        res.status(500).json({error: 'Failed to fetch ecfs data' })
    }
};

const getAwsData = async (req, res) => {
    try{
       console.log("Querying databse aws...");
       const awsresult = await pool.query('SELECT * FROM aws_data');
       res.json(awsresult.rows);
    } catch (err){
        console.error('Error fetching data aws:', err);
        res.status(500).json({error: 'Failed to fetch aws data'})
    }
};

module.exports = {
    getEcfsData,
    getAwsData
}