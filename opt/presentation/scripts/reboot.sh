#!/bin/bash -e

ROOT_DIR=/opt/presentation
LOG_FILE=$ROOT_DIR/logs/reboot.log

function log {
  local DATE=`date`
  echo $DATE: $1 >> $LOG_FILE
  echo $1
}

log "$(date) Rebooting PI to clean up any memory leaks"
/sbin/shutdown -r now
