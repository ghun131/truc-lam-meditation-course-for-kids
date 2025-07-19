#!/bin/bash

# Check if commit message is provided
if [ $# -eq 0 ]; then
    echo "Usage: ./push.sh \"commit message\""
    echo "Example: ./push.sh \"Update meditation course content\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo "=== STEP 1: Adding all files to git... ==="
git add .
echo "=== STEP 1 COMPLETE ==="

if [ $? -eq 0 ]; then
    echo "Files added successfully!"
    echo "=== STEP 2: Committing changes with message: '$COMMIT_MESSAGE' ==="
    git commit -m "$COMMIT_MESSAGE"
    echo "=== STEP 2 COMPLETE ==="
    
    if [ $? -eq 0 ]; then
        echo "Commit successful!"
        echo "=== STEP 3: Pushing to git repository... ==="
        git push -f
        echo "=== STEP 3 COMPLETE ==="
        
        if [ $? -eq 0 ]; then
            echo "Git push successful!"
            echo "=== STEP 4: Pushing to Google Apps Script... ==="
            clasp push
            echo "=== STEP 4 COMPLETE ==="
            
            if [ $? -eq 0 ]; then
                echo "Clasp push successful!"
                echo "All pushes completed successfully!"
            else
                echo "Clasp push failed!"
                exit 1
            fi
        else
            echo "Git push failed!"
            exit 1
        fi
    else
        echo "Git commit failed!"
        exit 1
    fi
else
    echo "Git add failed!"
    exit 1
fi
