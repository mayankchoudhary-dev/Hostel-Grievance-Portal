const bcrypt = require('bcryptjs');

// Generate hash for 'admin123'
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(`Password: ${password}`);
console.log(`Hash: ${hash}`);
console.log('\nCopy this hash to your schema.sql file');
