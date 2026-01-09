@echo off
:: Smart Home Auto-Deploy Watcher for Windows Task Scheduler
:: Runs every 2 minutes via Task Scheduler

cd /d C:\smart-home
wsl -e bash -c "./deploy.sh >> deploy.log 2>&1"
