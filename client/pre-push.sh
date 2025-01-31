#!/bin/bash

echo "運行測試..."
npm run test
if [ $? -ne 0 ]; then
    echo "測試失敗，取消推送"
    exit 1
fi

echo "運行 lint 檢查..."
npm run lint
if [ $? -ne 0 ]; then
    echo "Lint 檢查失敗，取消推送"
    exit 1
fi

echo "所有檢查通過！"
exit 0 