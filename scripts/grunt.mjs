import { execSync } from 'node:child_process'

const isCi = process.env.CI === 'true' || process.env.CI === '1'

function run(command) {
  execSync(command, { stdio: 'inherit' })
}

if (!isCi) {
  run('npm run lint:fix')
}

run('npm run lint')
