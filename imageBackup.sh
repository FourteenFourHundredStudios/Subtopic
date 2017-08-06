#! /bin/bash

# Gets date of most recent backup.    
newestfile=$(cd /home/<USERNAME>/.Backups && find . -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -f2- -d" ")        
budate=`echo $newestfile| cut -c10-19`

# Gets current date

cdate=$(date --iso)

# If the cureent date is the same as the date of the most recent backup, don't run the backup, just give a notification that says it has already been done today.

if [ $cdate = $budate ]; then
    echo "Backup Complete"
    notify-send -i /home/<USERNAME>/Pictures/Logos/safe.png "Backup Status" "Already started/finished backup for today."

# If the dates are different, start the backup.

else
    echo "Starting backup"
    notify-send -i /home/<USERNAME>/Pictures/Logos/safe.png "Backup Status" "Starting backup for today."
# Compresses the files into .tar.gz format 

    tar -cvpzf /home/<USERNAME>/.Backups/backup-$(date +%Y-%m-%d-%H:%M).tar.gz "/home/<USERNAME>/folder/to/back/up" --exclude=.Backups && notify-send --expire-time=60000 -i /home/tim/Pictures/Home/Logos/safe.png 'Backup Status' 'Finished backup for today.'
fi
