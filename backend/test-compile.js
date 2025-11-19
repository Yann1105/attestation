const { execSync } = require('child_process');

console.log('Testing TypeScript compilation...\n');

try {
  // Test compilation
  console.log('1. Compiling validation.ts...');
  execSync('npx tsc src/validation.ts --noEmit --skipLibCheck', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ validation.ts compiles successfully\n');

  console.log('2. Compiling auth.ts...');
  execSync('npx tsc src/auth.ts --noEmit --skipLibCheck', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ auth.ts compiles successfully\n');

  console.log('3. Compiling server.ts...');
  execSync('npx tsc src/server.ts --noEmit --skipLibCheck', { 
    cwd: __dirname,
    stdio: 'inherit'
  });
  console.log('✅ server.ts compiles successfully\n');

  console.log('✅ All files compile successfully!');
  console.log('\nYou can now start the server with: npm run dev');
  
} catch (error) {
  console.error('❌ Compilation failed');
  process.exit(1);
}