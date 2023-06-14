const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function calculateFutureTimestamp(timePeriod) {
    if (timePeriod == 'lifetime') {
        return "0"
    }
    const regex = /^(\d+)([mhdwmy]{1,2})$/; // Regex pattern to match the time period
    const match = timePeriod.match(regex);
    
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2];
  
      let futureDate = new Date(); // Current date and time
  
      switch (unit) {
        case 'm': // Minutes
          futureDate.setMinutes(futureDate.getMinutes() + amount);
          break;
        case 'h': // Hours
          futureDate.setHours(futureDate.getHours() + amount);
          break;
        case 'd': // Days
          futureDate.setDate(futureDate.getDate() + amount);
          break;
        case 'w': // Weeks
          futureDate.setDate(futureDate.getDate() + (amount * 7));
          break;
        case 'mo': // Months
          futureDate.setMonth(futureDate.getMonth() + amount);
          break;
        case 'y': // Years
          futureDate.setFullYear(futureDate.getFullYear() + amount);
          break;
        default:
          throw new Error('Invalid time unit provided.');
      }
  
      return futureDate.getTime(); // Return the timestamp in milliseconds
    }
  
    throw new Error('Invalid time period format.');
    return false
  }

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function restartBot() {
    await exec(`pm2 restart index`);
}

module.exports = {
    calculateFutureTimestamp,
    sleep,
    restartBot
}