#!/bin/bash -e

ROOT_DIR=/opt/presentation
LOG_FILE=$ROOT_DIR/logs/health.log
HTTP_LOG_FILE=$ROOT_DIR/logs/simplehttpserver.log

function log {
  local DATE=`date`
  echo $DATE: $1 >> $LOG_FILE
  echo $1
}

if test `find "$HTTP_LOG_FILE" -mmin +1`
then
  log "Something has stopped working, triggering reboot"
  ./reboot.sh
fi