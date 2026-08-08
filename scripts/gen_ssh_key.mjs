import { execFileSync } from 'child_process';
import { mkdirSync, writeFileSync, chmodSync, existsSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';

const sshDir = resolve(homedir(), '.ssh');
const privKey = resolve(sshDir, 'id_ed25519');
const pubKey = resolve(sshDir, 'id_ed25519.pub');
const outFile = '/mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public/.ssh_pubkey_result.txt';

try {
  if (!existsSync(sshDir)) {
    mkdirSync(sshDir, { recursive: true, mode: 0o700 });
  } else {
    chmodSync(sshDir, 0o700);
  }

  if (!existsSync(privKey)) {
    execFileSync('ssh-keygen', [
      '-t', 'ed25519',
      '-C', 'sawrly-server-20260808',
      '-f', privKey,
      '-q',
      '-N', ''
    ], { stdio: 'pipe' });
  }

  chmodSync(privKey, 0o600);
  chmodSync(pubKey, 0o644);

  const pubContent = execFileSync('cat', [pubKey], { encoding: 'utf8' });
  writeFileSync(outFile, pubContent.trim(), { encoding: 'utf8' });
  process.stdout.write('SUCCESS\n');
  process.stdout.write(pubContent);
} catch (err) {
  process.stderr.write('ERROR: ' + err.message + '\n');
  process.exit(1);
}
