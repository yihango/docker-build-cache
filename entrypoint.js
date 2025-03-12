const { spawn } = require("child_process");
const { appendFileSync } = require("fs");
const { EOL } = require("os");

function run(cmd) {
  const subprocess = spawn(cmd, { stdio: "inherit", shell: false });
  subprocess.on("exit", (exitCode) => {
    process.exitCode = exitCode;
  });
}

const key = "POST"

if ( process.env[`STATE_${key}`] !== undefined ) { // Are we in the 'post' step?
  run(__dirname+"/post");
} else { // Otherwise, this is the main step
  appendFileSync(process.env.GITHUB_STATE, `${key}=true${EOL}`);
  run(__dirname+"/main");
}
