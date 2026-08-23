module.exports = {
  apps: [
    {
      name: "crm-http",
      script: "src/index.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
    },
    {
      name: "crm-worker",
      script: "src/worker.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
    },
  ],
};
