#!/bin/bash

echo "=== WALL-E Image Copy Script ==="
echo ""
echo "This script will help you copy the uploaded Wall-E image to all required locations."
echo ""
echo "Please drag and drop your Wall-E image file here, or provide the path:"
echo ""
read -p "Enter the path to your Wall-E image: " IMAGE_PATH

if [ -f "$IMAGE_PATH" ]; then
    echo "✓ Found image at: $IMAGE_PATH"
    
    # Copy to main icon location
    cp "$IMAGE_PATH" "/home/nox/TASK/apps/web/public/wall-e-icon.png"
    echo "✓ Copied to wall-e-icon.png"
    
    # Copy to other icon locations
    cp "$IMAGE_PATH" "/home/nox/TASK/apps/web/public/favicon.ico"
    echo "✓ Copied to favicon.ico"
    
    cp "$IMAGE_PATH" "/home/nox/TASK/apps/web/public/icon-192.png"
    echo "✓ Copied to icon-192.png"
    
    cp "$IMAGE_PATH" "/home/nox/TASK/apps/web/public/icon-512.png"
    echo "✓ Copied to icon-512.png"
    
    cp "$IMAGE_PATH" "/home/nox/TASK/apps/web/public/apple-touch-icon.png"
    echo "✓ Copied to apple-touch-icon.png"
    
    echo ""
    echo "🎉 All Wall-E images have been copied successfully!"
    echo "Restart your application to see the new icons."
else
    echo "❌ Error: File not found at $IMAGE_PATH"
    echo "Please make sure the path is correct and try again."
fi
