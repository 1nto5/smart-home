@echo off
:: Smart Home Auto-Deploy Watcher for Windows Task Scheduler
:: Schedule this to run at system startup or periodically
:: Task Scheduler: Run every 1-5 minutes, "Run whether user is logged on or not"

cd /d C:\smart-home
wsl -e bash -c "./deploy.sh"
