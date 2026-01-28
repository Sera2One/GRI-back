#!/bin/bash

#Log file
LOG_FILE="./log/main.log"

# Function show help
usage() {
    echo "Usage: $0 [web|scan]"
    echo "  web  Démarre le serveur web"
    echo "  scan Démarre le scan réseau"
}


# Verify the arg presence
if [ -z "$1" ]; then
    usage
    exit 1
fi

# Changing working directory to the directory of the script
cd "$(dirname "$0")" || exit 1

# Rediriger la sortie standard et la sortie d'erreur vers le fichier de log
exec > >(tee -a "$LOG_FILE") 2>&1

case "$1" in
    web)
         echo "Démarrage du serveur web..."
        /usr/local/nodejs/bin/node ./server.js
        ;;
    scan)
        echo "Démarrage du scan réseau..."
        /usr/local/nodejs/bin/node ./src/script/scan_network.js
        ;;
    *)
        echo "Argument invalide: $1"
        usage
        exit 1
        ;;
esac

echo "Terminé."