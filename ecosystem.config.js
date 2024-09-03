module.exports = {
  apps: [{
    name: "nextjs-app",
    script: "npm",
    args: "start",
    cwd: "/home/adfilmz/htdocs/adfilmz.com/astronicsss" // Use your project path here
  }],
  deploy: {
    production: {
      user: "root",
      host: "195.35.23.229",
      ref: "origin/master",
      repo: "https://github.com/asarDigimarketz/astronicsss.git",
      path: "/home/adfilmz/htdocs/adfilmz.com/astronicsss", // Use the same path for deployment
      "post-deploy": "npm install && npm run build && pm2 reload ecosystem.config.js --env production"
    }
  }
}

