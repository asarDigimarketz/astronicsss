const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');

const app = express();
const git = simpleGit();

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  const repoPath = 'https://github.com/asarDigimarketz/astronicsss';

  git.cwd(repoPath)
    .pull((err, update) => {
      if (err) {
        console.error('Failed to pull the latest code:', err);
        res.status(500).send('Deployment failed');
      } else {
        console.log('Pulled the latest code:', update);
        res.status(200).send('Deployment successful');
      }
    })
    .exec(() => {
      console.log('Restarting application...');
      require('child_process').exec('pm2 reload ecosystem.config.js --env production');
    });
});

app.listen(3000, () => {
  console.log('Webhook listener is running on port 3000');
});
