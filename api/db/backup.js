const exec = require('child_process').exec;

// Retrieve database connection parameters
const getDbUrl = () => {
  require('dotenv').config();
  return process.env.DB_URL;
};

const createBackup = () => {
  // Prepare database archive filename
  currentDate = new Date();

  let databaseDumpFilename =
    'tisn_db_dump_' +
    currentDate.getFullYear() +
    '_' +
    (currentDate.getMonth() + 1) +
    '_' +
    currentDate.getDate() +
    '.gz';

  // Prepare mongodump command
  let dumpCmd =
    "mongodump --uri '" +
    getDbUrl() +
    "' --archive=dump/" +
    databaseDumpFilename +
    ' --gzip';

  // Execute mongodump command
  exec(dumpCmd, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
      return 0;
    } else {
      console.log(
        'Successfully created database dump at dump/' + databaseDumpFilename
      );

      let sendMail = require('../utils/emails').emailDatabaseBackup(
        databaseDumpFilename
      );

      if (!sendMail) {
        console.log('Email sending failed...');
      }

      return 1;
    }
  });
};

module.exports = { createBackup };