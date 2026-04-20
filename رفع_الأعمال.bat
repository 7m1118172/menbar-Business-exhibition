@echo off
chcp 65001 > nul
echo.
echo  ========================================
echo       نظام منبر للرفع الآلي والسريع
echo  ========================================
echo.

:: Step 1: Move and Sync
node sync-images.js

:: Step 2: Git Push
echo.
echo [1] جاري تحضير "الأعمال الجديدة" للرفع...
git add .

echo [2] جاري تأمين البيانات...
git commit -m "Add new hussaini designs"

echo [3] جاري النشر على GitHub...
git push origin main

echo.
echo ========================================
echo   🎉 تم الرفع! الآن ادخل للأدمن لفرزها 🎉
echo ========================================
echo.
pause
