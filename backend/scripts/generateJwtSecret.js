import crypto from 'crypto';

// Generate a secure random JWT secret
const generateJWTSecret = () => {
  // Generate 64 bytes of random data and convert to base64
  const secret = crypto.randomBytes(64).toString('base64');
  return secret;
};

const secret = generateJWTSecret();

console.log('\n🔐 Generated JWT Secret:');
console.log('─'.repeat(80));
console.log(secret);
console.log('─'.repeat(80));
console.log('\n📝 Copy this value and add it to your .env file:');
console.log(`JWT_SECRET=${secret}\n`);

