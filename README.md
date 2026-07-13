# EC2 CPU Load Dashboard

This is a small Node.js application intended to run on an EC2 instance and expose a simple browser UI for driving CPU load across two workers while showing live utilization.

## What it does

- Serves a browser dashboard from the EC2 public IP and port.
- Spawns two worker threads to burn CPU when requested.
- Polls the instance CPU usage every second and renders it on the page.
- Keeps the server, CPU load controller, and UI in separate modules.

## Run locally or on EC2

```bash
npm install
npm start
```

The app listens on `0.0.0.0` and uses `PORT` if it is set, otherwise `3000`.

## EC2 notes

- Open the instance security group for the chosen port.
- If you use a reverse proxy or custom port, set `PORT` accordingly.
- Pull the repo from GitHub on the instance, install dependencies, and start the process with your preferred process manager.
