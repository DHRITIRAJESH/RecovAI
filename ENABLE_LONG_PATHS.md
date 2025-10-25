# Fix TensorFlow Installation - Enable Windows Long Paths

## The Problem

TensorFlow installation is failing because Windows has a 260-character path length limit, and TensorFlow's file paths exceed this limit.

## The Solution

You need to enable Windows Long Path support. This requires **Administrator privileges**.

## Steps to Fix:

### Option 1: Enable via Registry (Requires Admin)

1. **Close VS Code**
2. Press `Win + X` and select **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**
3. Run this command:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

4. **Restart your computer** for changes to take effect

### Option 2: Enable via Group Policy (Requires Admin)

1. Press `Win + R`, type `gpedit.msc`, press Enter
2. Navigate to: **Computer Configuration > Administrative Templates > System > Filesystem**
3. Double-click **"Enable Win32 long paths"**
4. Select **"Enabled"**, click **Apply**, then **OK**
5. **Restart your computer**

## After Enabling Long Paths:

1. Open VS Code normally (not as admin)
2. Open a terminal in VS Code
3. Run these commands:

```powershell
cd backend
pip install tensorflow-cpu keras numpy pandas scikit-learn PyPDF2
python app.py
```

4. You should see:

```
✓ ML Predictor loaded successfully
✓ Loaded 3 trained models
```

## Why This Happened:

- Your Python is installed in a Windows Store location with a very long base path
- TensorFlow has deeply nested folders with long filenames
- Combined path exceeds 260 characters
- Windows blocks file creation unless Long Paths is enabled

## Verification:

After restarting and installing TensorFlow, check the backend output:

- ❌ BAD: "⚠️ ML Predictor not available"
- ✅ GOOD: "✓ ML Predictor loaded successfully"
