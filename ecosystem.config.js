module.exports = {
  apps: [{
    name: 'where-is-my-money',
    script: 'dist/main.js',
    ignore_watch: ['uploads', 'node_modules'],
    output: 'logs/out.log',
    error: 'logs/error.log',
  }]
};
