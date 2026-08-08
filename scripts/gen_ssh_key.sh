#!/bin/bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "sawrly-server-20260808" -f ~/.ssh/id_ed25519 -q -N ""
fi
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
cat ~/.ssh/id_ed25519.pub > /mnt/disk-extra/hostingdata/cmnp2kdic001a4hr2yofnyk76/sawrly.com/public/.ssh_pubkey_result.txt
echo "WRITTEN"
