module.exports = {
  apps: [{
    name: 'vyaktrix-backend',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/vyaktrix/error.log',
    out_file: '/var/log/vyaktrix/out.log',
    max_memory_restart: '1G',
  }],
};
