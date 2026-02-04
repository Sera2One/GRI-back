# GRI - Secure Network Management & Collaboration Platform
RI (Gestion de Réseau Informatique) is a comprehensive, full-stack platform that combines **network infrastructure management** with **secure team collaboration tools**. Designed for IT departments, MSPs, and enterprise teams, it provides real-time network monitoring alongside built-in communication capabilities—all protected by a granular, dynamic role-based access control system.

## 📋 Table of Contents
1. [About the Project](#about-the-project)
2. [Prerequisites & Installation](#prerequisites--installation)
3. [Project Structure](#project-structure)
4. [Setup & Deployment](#setup--deployment)
5. [Additional Services](#additional-services)
6. [Configuration](#configuration)


# About the Project
## ✨ Core Features
### 🖥️ **Network Management**
- **🔍 Network Discovery & Topology Mapping:** Automatically discovers and maps devices on your network.
- **📊 Real-Time Monitoring:** Live dashboards showing device status, bandwidth usage, and performance metrics.
- **🚨 Alert & Notification System:** Configurable alerts for downtime, threshold breaches, and security events.
- **🧾 Asset Management:** Centralized inventory of all network devices with detailed profiles.
- **🛡️ Security Dashboard:** Overview of network security status and connected device analysis.

### 👥 **Integrated Collaboration Suite**
- **💬 Real-Time Chat:** Secure messaging between users and teams with message history and file sharing.
- **📁 File Sharing & Archiving:** Upload, share, and organize documents with version control and secure storage.
- **🎥 Video Conferencing:** Built-in WebRTC video calls with screen sharing capabilities, supported by TURN server for NAT traversal.
- **🔔 Unified Notifications:** Central notification center for network alerts and collaboration activities.

### 🔐 **Dynamic Access Control System**
- **Modular Permission Framework:** Every feature (button, component, page, menu, module) is access-controlled.
- **Group-Based Permissions:** Assign users to groups with predefined permission sets (Admin, Network Operator, Help Desk, Viewer).
- **Granular Control:** Define permissions at multiple levels:
  - **Module-level:** Access to entire sections (e.g., "Network Monitoring", "Chat")
  - **Page-level:** Access to specific pages within modules
  - **Component-level:** Control over individual UI components
  - **Action-level:** Permissions for specific operations (view, create, edit, delete, share)
- **Real-Time Permission Updates:** Access rights update immediately upon group changes.
- **Administration Interface:** Visual interface for managing groups and permissions without code changes.



## 🏗️ Technology Stack
- **Frontend:** React, Material UI, Redux Toolkit, framer-motion  
- **Backend:** Node.js (Express.js) REST API
- **Real-Time:** Socket.IO for chat/notifications, WebRTC for video calls
- **Database:** PostgreSQL (primary data), SQLite for lightweight services
- **File Storage:** Local storage with provision for S3/MinIO integration
- **Media Processing:** FFmpeg for video thumbnails and processing
- **TURN Server:** Coturn for reliable WebRTC connections across networks
- **Authentication:** JWT-based with role claims


## 🎯 Use Cases
- **Enterprise IT Teams:** Monitor infrastructure while collaborating on incidents
- **MSPs (Managed Service Providers):** Manage multiple client networks with team-based access control
- **Network Operations Centers:** Centralized monitoring with integrated team communication
- **Educational Institutions:** Manage campus networks with departmental access controls
- **Any organization** requiring both network oversight and secure internal collaboration


# Install all dependencies in the server
Requirement: Linux OS like Debian, Ubuntu, CentOS, ...
If you use redhat distrubution use `dnf install <packageName>` and on debian `apt-get install <packageName>` to install package used in this project
### Install database
1. Install Postgres
```bash
#For debian distro
sudo apt install postgresql

#For redhat distro
dnf install postgresql-server
#Initialize the database and enable automatic start, * means the version of installed postgresql server, it maybe 13,14,15,16
sudo /usr/pgsql-*/bin/postgresql-*-setup initdb
sudo systemctl enable postgresql-*
sudo systemctl start postgresql-*
```
2.  Configuration
By default only connections from the local system are allowed, to enable all other computers to connect to the PostgreSQL server, edit the file  `/etc/postgresql/*/main/postgresql.conf ` or `/var/lib/pgsql/*/data/postgresql.conf`. Locate the line:  `listen_addresses = ‘localhost’` and change it to `listen_addresses = '*' `.
Now that we can connect to our PostgreSQL server, the next step is to set a password for the postgres user. Run the following command at a terminal prompt to connect to the default PostgreSQL template database:
```bash
sudo -u postgres psql template1
```
The above command connects to PostgreSQL database template1 as user postgres. Once you connect to the PostgreSQL server, you will be at an SQL prompt. You can run the following SQL command at the psql prompt to configure the password for the user postgres.
```sql
ALTER USER postgres WITH ENCRYPTED PASSWORD 'your_password';
```

3.  Create database, schema and user 
```sql
-- 1 Create database if not exist
CREATE DATABASE gri_db;
-- 2 Create the schema and set the search path for the schema: 
\connect gri_db;
CREATE SCHEMA gri;
SET search_path TO gri;
-- 3 Create the User
CREATE USER gri WITH ENCRYPTED PASSWORD 'gri_pwd';
-- 4. Set up the database user's default schema using the search path for the user: 
ALTER USER gri SET search_path = gri;
-- 5. Grant permissions to the database user to connect to the database and to use and create objects in the schema: 
GRANT CONNECT ON DATABASE armp TO gri;
GRANT USAGE, CREATE ON SCHEMA gri TO gri;
GRANT ALL ON SCHEMA gri TO gri;
-- 6. Grant permissions in case the database user needs to create objects in the future:
ALTER DEFAULT PRIVILEGES IN SCHEMA gri GRANT ALL ON TABLES    TO gri;
ALTER DEFAULT PRIVILEGES IN SCHEMA gri GRANT ALL ON SEQUENCES TO gri;
ALTER DEFAULT PRIVILEGES IN SCHEMA gri GRANT ALL ON FUNCTIONS TO gri;
ALTER DEFAULT PRIVILEGES IN SCHEMA gri GRANT ALL ON TYPES     TO gri;

```


After configuring the password, edit the file  `/etc/postgresql/*/main/pg_hba.conf ` to use scram-sha-256 authentication with the postgres user, allowed for the template1 database, from any system in the local network (which in the example is 192.168.200/1/24) :
```sh
# host      DATABASE        USER            ADDRESS                 METHOD          [OPTIONS]
local       all             all                                     trust
host        postgres        all             192.168.200.0/24        indent
hostssl     template1       postgres        192.168.200.0/24        scram-sha-256
hostssl     armp            pe             192.168.200.0/24         md5
```

>NOTE
>The config statement ‘hostssl’ used here will reject tcp connections that would not use ssl. Postgresql in Ubuntu has the ssl feature built in and configured by default, so it works right away. On your postgresql server this uses the certificate created by ‘ssl-cert’ package which is great, but for production use you should consider updating that with a proper certificate from a recognized CA. You can allow all connection by changing the address `0.0.0.0/0`
> Replace database 'all' by 'armp', to show only the database 'armp' to 'pe'. 
```bash
sudo systemctl restart postgresql.service
# OR (if postgres on redhat version is 13)
sudo systemctl start postgresql-13.service
```

### Install NodeJs LTS latest
We can not install the latest nodejs Long Terme Support  with apt without using ppa repo, and using **apt show nodejs** has a Version: 12.22.9~dfsg-1ubuntu3.4 and the latest LTS is v20.12. So there multiple methode to install nodejs :
1. Methode 1 : Install with path (easy to uninstall)
- Download NodeJs Linux Binaries ( **tar.xz** x64, not a source code tar.gz file) from [`https://nodejs.org/en/download`](https://nodejs.org/en/download) 
```bash
sudo mkdir /usr/local/nodejs
```
- Extract node-v20.12.2-linux-x64.tar.xz to /usr/local/nodejs
```bash
sudo tar --strip-components 1 -xvf node-v20.12.2-linux-x64.tar.xz --directory /usr/local/nodejs
```
- Add to nodejs to PATH: export PATH=$PATH:/usr/local/nodejs/bin


2. Methode 2 : Install without adding path
```bash
sudo tar --strip-components 1 -xvf node-v20.12.2-linux-x64.tar.xz --directory /usr/local/
```

3. Methode 3 : with Node Version Manager
```bash
# installs NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# download and install Node.js
nvm install 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.12.2`

# verifies the right NPM version is in the environment
npm -v # should print `10.5.0`
```
# Structure of the project PE
```
GRI/
├── GRI_BACK/
│    ├── docs
│    ├── log
│    ├── node_modulules
│    ├── .env
│    ├── .env.exemple
│    ├── package-lock.json
│    ├── package.json
│    ├── README.md
│    ├── script.sh
│    └── server.js
└── GRI_FRONT/
    ├── build
    ├── docs
    ├── node_modulules
    ├── public
    ├── src/
    ├── package.json
    ├── package-lock.json
    └── README.md
```
## Setup backend
Clone the project
```bash
git clone https://github.com/Sera2One/GRI-back.git
```
Go to the project directory
```bash
  cd GRI_BACK
```

Change or copy this file name .env.exemple to  .env
```bash
  cp .env.exemple .env
```
Edit the .env according to your environment
```bash
  nano .env
```

Install dependencies
```bash
npm install
```
Install the database structure
```bash
# Install database
npm run db:install
# Install initial data (module name,page name,component name and user admin pe)
npm run db:initial-data
# DEV only: Install 60 fake users (post, comment, ...) skip this in Prod
npm run generete:fakeUsers
# DEV only: Install data test (post, comment, ...) skip this in Prod
npm run db:data-test
# To show more command.
npm run help
```

## Setup frontend
```bash

#Clone the project
git clone http://154.126.75.194:3219/armp/GRI_FRONT.git
cd GRI_FRONT
npm install
```
change baseUrl config to according to your serveur URL:PORT in this : `src/frontend/src/config/baseUrl.js` to solve CROSORIGIN ERROR.

To run build 
```bash
# Remove previous build if existe
rm -rf build/*
# Run the build
npm run build
```
This command run the build project to /GRI_FRONT/Build,
the /GRI_FRONT/Build is the static file of server.
Make sur to delete the build folder before run the build command.

## start server
npm run start

# Deploy the apps as service
## Install the web and scan service 
```bash
cd GRI_BACK
#Edit the .env file and change APP_PORT=443
nano .env 
#Edit the path of the script.sh and the user in the file service
nano services/systemd/gri_web.service
# Copy the service
cp services/systemd/gri_web.service /etc/systemd/system/gri_web.service 
# Reload daemon
systemctl daemon-reload
# Start all service
systemctl start  gri_web.service

# Enable on boot
systemctl enable  gri_web.service


# Run the build
cd ../GRI_FRONT

# Remove previous build if existe
rm -rf build/*
npm run build

# No need to restart serveur
# Go to Url : https://192.168.200.XX or https://www.exemple.com


# The GRI_FRONT/build folder is the static file of the server
```
# Deploy the apps with PM2 Process Management
PM2 is a daemon process manager that will help you manage and keep your application online. Getting started with PM2 is straightforward, it is offered as a simple and intuitive CLI, installable via NPM.
## Installation
```bash
#The latest PM2 version is installable with NPM
$ npm install pm2@latest -g
```
## Usefull command in pm2
### Start an app
```bash
#The simplest way to start, daemonize and monitor your application is by using this command line:
$ pm2 start server.js
```
### Managing processes
```bash
# Managing application state is simple here are the commands:
$ pm2 restart app_name
$ pm2 reload app_name
$ pm2 stop app_name
$ pm2 delete app_name
```
Instead of `app_name` you can pass:
- `all` to act on all processes
- `id` to act on a specific process id
### Check status, logs, metrics
List the status of all application managed by PM2:
```bash
$ pm2 [list|ls|status]
# To display logs in realtime:
$ pm2 logs
# To dig in older logs:
$ pm2 logs --lines 200
# Display all information about a specific process
$ pm2 describe 0 
# Here is a realtime dashboard that fits directly into your terminal:
$ pm2 monit
# pm2.io: Monitoring & Diagnostic Web Interface
$ pm2 plus
```
### Deploying the app
You can also create a configuration file, called Ecosystem File, to manage multiple applications. To generate an Ecosystem file:
```bash
$ pm2 ecosystem
```
This will generate an ecosystem.config.js and edit this file like:
```js
module.exports = {
  apps : [
    {
      name: "pe",
      script: "/pathToGRI_BACK/server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }, 
    {
      name: 'App2',
      script: "/pathTo/app2.js"
    },
    {
      name: 'App3',
      script: "/pathTo/app3.js"

    }

  ]
}
```
And start it easily:
```bash
$ pm2 start ecosystem.config.js
```
Read more about application declaration [`here`](https://pm2.keymetrics.io/docs/usage/application-declaration/) 
#### Setup startup script
Restarting PM2 with the processes you manage on server boot/reboot is critical. To solve this, just run this command to generate an active startup script:
``` bash
$ pm2 startup
# And this will generate command to create service script like:
# sudo env PATH=$PATH:/usr/local/nodejs/bin /usr/local/nodejs/lib/node_modules/pm2/bin/pm2 startup systemd -u username --hp /home/username
# And run the command
# Freeze a process list on reboot via:
$ pm2 save
# To Remove init script via:
$ pm2 unstartup systemd
```
Read more about startup script generator [`here`](https://pm2.keymetrics.io/docs/usage/startup/)

```bash
 nano /etc/systemd/system/pm2-username.service
```
Add this line in the `/etc/systemd/system/pm2-username.service` file to add capability to scan network
```sh
[Service]
AmbientCapabilities=CAP_NET_RAW CAP_NET_BIND_SERVICE
CapabilityBoundingSet=CAP_NET_RAW CAP_NET_BIND_SERVICE
```

To Remove init script via:
``` bash
$ pm2 unstartup systemd
```
#### Restart application on changes
``` bash 
$ cd /path/to/GRI_BACK/server.js
$ pm2 start env.js --watch --ignore-watch="node_modules"
```
This will watch & restart the app on any file change from the current directory + all subfolders and it will ignore any changes in the node_modules folder `--ignore-watch="node_modules`.

You can then use `pm2 logs` to check for restarted app logs.








---

# Install other dependance 
FFmpeg is an open source and free software for managing video, audio, and other multimedia files and streams on Linux and Unix-like systems.
ffmpeg command is used to generate thumbnail from video in the application
``` bash
#For debian distro
$ sudo apt-get install ffmpeg

#For redhat distro
$ sudo dnf install ffmpeg
```

# Coturn TURN Server Installation and Configuration Guide  

This guide explains how to deploy a secure and production-ready **coturn** TURN server to enable WebRTC peer-to-peer video calls over restrictive networks such as 4G/5G.

---

## 1. Prerequisites

- A dedicated **linux server** with `sudo` access.
- A public **static IP address**.
- A **domain name** (e.g., `turn.exemple.com`) pointing to your server’s public IP.
- The following ports must be **open and forwarded** from your **Cisco router** to the linux server:
  - **UDP/TCP 3478** (standard STUN/TURN)
  - **UDP/TCP 5349** (TURN over TLS — *recommended for mobile networks*)
  - *(Optional)* **UDP/TCP 443** (to masquerade TURN as HTTPS traffic)

> 💡 **Note**: Mobile carriers often block non-standard ports. Using **5349** or **443** significantly improves connectivity success rates.

---

## 2. Install Coturn

```bash

#For debian distro
sudo apt install -y coturn

#For redhat distro
sudo dnf install -y coturn

```

---

## 3. Configure Coturn

Edit the main configuration file:

```bash
sudo cp /etc/coturn/turnserver.conf /etc/coturn/turnserver.conf.bak
sudo nano /etc/coturn/turnserver.conf
```

if configuration file is not found, use this command
```bash
find /usr -name "*turnserver*.conf*" -type f 2>/dev/null
find /etc -name "*turnserver*" -type f 2>/dev/null
```

Use the following secure template (adjust values as needed):

```ini
# Network interfaces
listening-device=eth0
listening-port=3478
tls-listening-port=5349

# Domain and realm
realm=exemple.com
server-name=turn.exemple.com

# TLS certificates (required for port 5349)
cert=/etc/letsencrypt/live/turn.exemple.com/fullchain.pem
pkey=/etc/letsencrypt/live/turn.exemple.com/privkey.pem

# Authentication method, go step 4  to create turndb file
lt-cred-mech
userdb=/var/lib/turn/turndb

# Security
fingerprint
# no-loopback-peers
no-multicast-peers

# Logging
log-file=/var/log/turn.log
simple-log
```

> Replace `eth0` with your actual network interface (check with `ip a`).  
> Replace `exemple.com` and `turn.exemple.com` with your real domain.

Running test if it work with no error 

```bash
sudo -u coturn turnserver -c /etc/coturn/turnserver.conf
```


## 4. Set Up Authentication (SQLite Database)

Create a secure user database instead of using plaintext credentials:

```bash
sudo turnadmin -a -u <USERNAME> -r exemple.com -p <STRONG_PASSWORD> -b /var/lib/coturn/turndb
```

Set correct permissions:

```bash
sudo chown coturn:coturn /var/lib/coturn/turndb
sudo chmod 640 /var/lib/coturn/turndb
```
 
> Example:  
> `sudo turnadmin -a -u dsi -r app.armg.mg -p S3cureP@ss! -b /var/lib/coturn/turndb`

---

## 5. Obtain TLS Certificate (Let’s Encrypt)

Install Certbot and request a certificate:

```bash
sudo dnf install -y certbot
sudo systemctl stop coturn  # Temporarily stop to free port 80/443
sudo certbot certonly --standalone -d turn.exemple.com
sudo systemctl start coturn
```

Allow the `turnserver` user to read the private key:

```bash
sudo setfacl -m u:turnserver:r /etc/letsencrypt/live/turn.exemple.com/privkey.pem
sudo setfacl -m u:turnserver:r /etc/letsencrypt/archive/turn.exemple.com/privkey*.pem
```

> 🔁 **Auto-renewal**: Certbot renews automatically, but reload `coturn` after renewal (see Step 9).

---

## 6. Start and Enable Coturn Service

```bash
sudo systemctl enable --now coturn
sudo systemctl status coturn  # Verify it's active and running
```

---

## 7. Configure Firewall (firewalld)

Allow TURN traffic through the local firewall:

```bash
sudo firewall-cmd --permanent --add-port=3478/udp
sudo firewall-cmd --permanent --add-port=3478/tcp
sudo firewall-cmd --permanent --add-port=5349/udp
sudo firewall-cmd --permanent --add-port=5349/tcp
sudo firewall-cmd --reload
```

---

## 8. Cisco Router Port Forwarding

On Cisco router, configure **static NAT** to forward public ports to the linux server’s LAN IP (e.g., `192.168.1.10`):

```cisco
ip nat inside source static udp 192.168.1.10 3478 interface GigabitEthernet0/0 3478
ip nat inside source static tcp 192.168.1.10 3478 interface GigabitEthernet0/0 3478
ip nat inside source static udp 192.168.1.10 5349 interface GigabitEthernet0/0 5349
ip nat inside source static tcp 192.168.1.10 5349 interface GigabitEthernet0/0 5349
```

> Replace `192.168.1.10` with your server’s actual LAN IP.  
> Ensure your outside interface (e.g., `GigabitEthernet0/0`) matches your setup.

---

## 9. Test and Maintain

### Test the TURN Server
Use the official WebRTC ICE tester:  
👉 [https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)

Add:
- **STUN or TURN URI**: `turn:turn.exemple.com:5349`
- **Username**: `<USERNAME>`
- **Credential**: `<PASSWORD>`

Click **"Gather candidates"**. A line containing `relay` confirms TURN is working.

### Auto-Renew TLS Certificate
Add a cron job to reload `coturn` after certificate renewal:

```bash
sudo crontab -e
```

Add this line:

```cron
0 3 * * * /usr/bin/certbot renew --quiet && /bin/systemctl reload coturn
```

---

Edit 
GRI_FRONT/src/config/config.prod.js

```bash
nano GRI_FRONT/src/config/config.prod.js
```
```js
export const CONFIG = {
	baseUrl: 'https://www.exemple.com',
	baseUrlLocal: 'turn:turn.exemple.com:5349',
	apiVersion: 'v1.0',
	turnServeur: {
		turnServeurIsActive: true,
		url: 'turn:your-turn-server.com:5349',
		username: '<USERNAME>',
		credential: '<USERNAME>',
	},
};
```

## Final Notes

- Coturn is **open-source, free, and unlimited**—scaling depends only on your server’s CPU, RAM, and **upload bandwidth**.
- For production, avoid static credentials. Instead, generate **time-limited TURN credentials** via your backend (e.g., using HMAC-based tokens or dynamic `turnadmin` calls).
- Monitor `/var/log/turn.log` for usage and errors.

✅ WebRTC application will now work reliably—even on mobile networks.

--- 
