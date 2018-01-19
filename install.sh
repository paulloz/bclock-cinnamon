#!/usr/bin/env sh

APPLETS_DIRECTORY="$HOME/.local/share/cinnamon/applets"
APPLET_NAME="bclock@pauljoannon.com"

GIT_CLONE_DIRECTORY="$APPLETS_DIRECTORY/$APPLET_NAME"
GIT_CLONE_URL="https://github.com/paulloz/bclock-cinnamon.git"

USELESS_FILES="install.sh LICENSE screenshot.png README.md"

if [ -d $APPLETS_DIRECTORY ]; then
    echo "Cloning applet directory..."
    git clone "$GIT_CLONE_URL" "$GIT_CLONE_DIRECTORY"
    echo "Removing useless files..."
    for file in $USELESS_FILES; do
        rm -f "$GIT_CLONE_DIRECTORY/$file"
    done
else
    >&2 echo "Error: $APPLETS_DIRECTORY not found."
    exit 1
fi

exit 0
