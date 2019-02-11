module.exports = {
  apps : [{
    name: "soul-starter",
    script: "./dist/main.js",

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    error_file: "./log/pm2-website-err.log",
    env: {
      NODE_ENV: 'development'
    },
    env_test: {
      NODE_ENV: 'test'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};
