#!/bin/bash -e

ROOT_DIR=/opt/presentation
CONTENT_DIR=$ROOT_DIR/content
JS_DIR=$CONTENT_DIR/js
LOG_FILE=$ROOT_DIR/logs/copy.log
USB_MOUNT_POINT=/media/usb
SLIDES_DIR=$USB_MOUNT_POINT/slides
SLIDES_TMP_DIR=slides_tmp
SLIDES_CONFIG_FILE=$USB_MOUNT_POINT/slidesconfig.json
COUNTER_CONFIG_FILE=$USB_MOUNT_POINT/counterconfig.json
SLIDE_FILE=$JS_DIR/slidefiles.json
SYSTEM_DATA_DIR=$USB_MOUNT_POINT/systemroot
SCRIPTS_DIR=$USB_MOUNT_POINT/scripts
PRECOPY_SCRIPT=$SCRIPTS_DIR/precopy.sh
POSTCOPY_SCRIPT=$SCRIPTS_DIR/postcopy.sh
WRAPUP_SCRIPT=$SCRIPTS_DIR/wrapup.sh

#### FUNCTION DEFINITIONS ####

function log {
  local DATE=`date`
  echo $DATE: $1 >> $LOG_FILE
  echo $1
}

function updateStatus {
  echo "{"'"'"status"'"'": " '"'$1'"'"}" > $JS_DIR/status.json;
}

function updateStatusAndExit {

  # Run a final script from the USB stick to manipulate any slide files etc.
  if [ -e "$WRAPUP_SCRIPT" ]; then
    log "Running wrapup script"
    sh $WRAPUP_SCRIPT
  else
    log "No wrapup script on USB"
  fi

  updateStatus $1
  log "Sleeping for 3 seconds"
  sleep 3
  log "Resetting status to normal"
  updateStatus "NORMAL"
  log "------- SCRIPT END -------"
  log ""
  exit 0
}

# global error handler, logs error and resets status file.
function errorHandler {
  LASTLINE="$1"            # argument 1: last line of error occurence
  LASTERR="$2"             # argument 2: error code of last command
  log "Error on line ${LASTLINE}: exit status of last command: ${LASTERR}"
  updateStatusAndExit "ERROR"
}


# SCRIPT START
trap 'errorHandler ${LINENO} $?' ERR

log "------- USB STICK INSERTED -------"
log "Setting initial status"
updateStatus "LOADING"
sleep 3


# Run a script from the USB stick to do misc stuff before copying new system files
if [ -e "$PRECOPY_SCRIPT" ]; then
  log "Running precopy script"
  sh $PRECOPY_SCRIPT
else
  log "No precopy script on USB"
fi

# copy files that should be placed elsewhere but in the presentation directory
if [ -d "$SYSTEM_DATA_DIR" ]; then
  log "Copying new system files"
  cd /
  cp -r $SYSTEM_DATA_DIR/* .
else
  log "No new system files to copy"
fi

# Run a script from the USB stick to do misc stuff after copying new system files but
# before loading slides
if [ -e "$POSTCOPY_SCRIPT" ]; then
  log "Running postcopy script"
  sh $POSTCOPY_SCRIPT
else
  log "No postcopy script on USB"
fi

# Copy config and slides
cd $CONTENT_DIR

if [ -e "$COUNTER_CONFIG_FILE" ]; then
  log "Copying new project end time config from usb stick"
  cp $COUNTER_CONFIG_FILE $JS_DIR
else
  log "No project end time found on usb stick"
fi

if [ -e "$SLIDES_CONFIG_FILE" ]; then
  log "Copying custom config from usb stick"
  cp $SLIDES_CONFIG_FILE $JS_DIR
else
  log "No custom config found on usb stick"
fi

log "Removing temporary directory if it exists"
rm -rf $SLIDES_TMP_DIR
mkdir $SLIDES_TMP_DIR

if [ -d "$SLIDES_DIR" ]; then
  log "Copying slides from usb stick"
else
  log "Directory not found, aborting"

  updateStatusAndExit "NO_FILES_FOUND"
fi

cp $SLIDES_DIR/* $SLIDES_TMP_DIR

#if any files were copied, delete old slides and move directory
FILES_COPIED=`ls -1 $SLIDES_TMP_DIR | wc -l`
log "Copied $FILES_COPIED files from usb"

if [ "$FILES_COPIED" -lt  "1" ]; then
  log "No files found, aborting"
  updateStatusAndExit "NO_FILES_FOUND"
fi

log "Removing old slides"
rm -rf slides
mv slides_tmp slides
log "New slides moved to production, generating new file list"

FILE_LIST=`ls -1 slides`
FILE_LIST_LENGTH=`ls -1 slides | wc -l`
CURRENT_FILE_NUM=1

log "Writing file list to js"
echo "[" > $SLIDE_FILE
for FILENAME in $FILE_LIST ;
do
  if [ "$CURRENT_FILE_NUM" -lt "$FILE_LIST_LENGTH" ]; then
    echo '"'"$FILENAME"'"'"," >> $SLIDE_FILE
  else 
    echo '"'"$FILENAME"'"' >> $SLIDE_FILE
  fi
  ((CURRENT_FILE_NUM += 1))
done  
echo "]" >> $SLIDE_FILE

log "Updating status to loaded"
updateStatusAndExit "LOAD_COMPLETED"

log "Sleeping for 20 seconds"
sleep 20
log "Resetting status to normal"
updateStatus "NORMAL"
