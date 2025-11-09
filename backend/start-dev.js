import { spawn } from 'child_process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = process.env.PORT || 8000;

async function killPort(port) {
  try {
    console.log(`🔍 Checking for processes using port ${port}...`);
    
    // Windows command to find process using port
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
    
    if (!stdout || stdout.trim() === '') {
      console.log(`✅ Port ${port} is already free!\n`);
      return;
    }

    // Extract PID from output
    const lines = stdout.trim().split('\n');
    const pids = new Set();
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        pids.add(pid);
      }
    });

    if (pids.size === 0) {
      console.log(`✅ Port ${port} is already free!\n`);
      return;
    }

    console.log(`⚠️  Found ${pids.size} process(es) using port ${port}`);
    
    // Kill each process
    for (const pid of pids) {
      try {
        console.log(`   Killing process ${pid}...`);
        await execAsync(`taskkill /F /PID ${pid}`);
        console.log(`   ✅ Process ${pid} terminated`);
      } catch (error) {
        console.log(`   ⚠️  Could not kill process ${pid}: ${error.message}`);
      }
    }

    console.log(`\n✅ Port ${port} is now free!\n`);
  } catch (error) {
    if (error.stdout === '' || error.message.includes('findstr')) {
      console.log(`✅ Port ${port} is already free!\n`);
    } else {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

// Kill port, then start nodemon
await killPort(PORT);

console.log('🚀 Starting server with nodemon...\n');

// Spawn nodemon process
const nodemon = spawn('npx', ['nodemon', 'server.js'], {
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down server...');
  nodemon.kill();
  process.exit(0);
});

nodemon.on('close', (code) => {
  process.exit(code || 0);
});

