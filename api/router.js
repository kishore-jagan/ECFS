const express = require('express');
const { getEcfsData, getAwsData } = require('./controller');

const router = express.Router();

router.get('/ecfsData', getEcfsData);
router.get('/awsData', getAwsData);

module.exports = router;