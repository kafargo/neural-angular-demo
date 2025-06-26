#!/bin/bash

echo "🔧 Building Angular app for production..."
npm run build:prod

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting production server..."
    npm run start:prod
else
    echo "❌ Build failed!"
    exit 1
fi
