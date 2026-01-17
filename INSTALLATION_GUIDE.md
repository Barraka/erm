# Escape Room Manager - Installation Guide

## Prerequisites

Install the following on the new PC:

1. **Node.js LTS** - Download from https://nodejs.org
2. **PM2** - After installing Node.js, open Command Prompt and run:
   ```
   npm install -g pm2
   pm2-startup install
   ```

---

## Installation Steps

### Step 1: Copy Files

Create a folder on the new PC:
```
C:\ERM
```

Copy the following files to `C:\ERM`:
- The `dist` folder (contains the built dashboard)
- The `server.cjs` file (the web server)

Your folder structure should be:
```
C:\ERM\
├── server.cjs
└── dist\
    ├── index.html
    ├── assets\
    └── (other files)
```

---

### Step 2: Test the Server

Open Command Prompt and run:
```
cd C:\ERM
node server.cjs
```

Open a browser and go to `http://localhost:3000` to verify the dashboard loads.

Press `Ctrl+C` to stop the server.

---

### Step 3: Register with PM2

Run the following command:
```
pm2 start C:\ERM\server.cjs --name "escape-room-manager"
```

Verify the app shows as "online" in the PM2 table.

---

### Step 4: Enable Auto-Start on Boot

Run these commands:
```
pm2 save
pm2-startup install
```

You should see: "successfully added pm2 startup registry entry"

---

### Step 5: Create Desktop Shortcut

Run this command in Command Prompt:
```
powershell "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\Escape Room Manager.lnk'); $s.TargetPath = 'http://localhost:3000'; $s.Save()"
```

A shortcut called "Escape Room Manager" will appear on the desktop.

---

## Verification

Restart the PC and verify:
1. The dashboard is accessible at `http://localhost:3000`
2. The desktop shortcut opens the dashboard

---

## Useful PM2 Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check if the app is running |
| `pm2 restart escape-room-manager` | Restart the app |
| `pm2 logs` | View server logs |
| `pm2 stop escape-room-manager` | Stop the app |
| `pm2 delete escape-room-manager` | Remove the app from PM2 |

---

## Troubleshooting

**Dashboard not loading after restart?**
- Open Command Prompt and run `pm2 status` to check if the app is running
- If not running, run `pm2 start C:\ERM\server.cjs --name "escape-room-manager"`
- Then run `pm2 save` to save the configuration

**Port 3000 already in use?**
- Edit `server.cjs` and change `const PORT = 3000;` to a different port
- Update the desktop shortcut URL accordingly
