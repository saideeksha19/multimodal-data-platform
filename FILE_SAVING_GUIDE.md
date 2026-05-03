# File Saving Guide

## 📁 How Files Are Saved

### **Upload Location**
- **Directory**: `Documents/Uploads/`
- **Physical Path**: `C:\Users\ddsai\Documents\Uploads\`
- **No URL Access**: Files are stored locally in Documents only

### **File Naming**
- **Format**: `[timestamp]-[original-filename]`
- **Example**: `1714664523456-my-document.pdf`
- **Purpose**: Prevents filename conflicts

### **Supported File Types**
- PDF: `.pdf`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Videos: `.mp4`, `.avi`, `.mov`
- Archives: `.zip`
- Data: `.json`, `.csv`, `.txt`
- Code: `.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.css`, `.xml`

### **How to Access Saved Files**

#### **Method 1: Documents Folder**
1. Open **File Explorer**
2. Navigate to: `C:\Users\ddsai\Documents\Uploads\`
3. Find your files with timestamp prefixes

#### **Method 2: Through Dashboard**
1. Upload files via drag & drop or "Select Files"
2. Files appear in "Uploaded Files" section
3. Green checkmark shows: `✓ Saved to: C:\Users\ddsai\Documents\Uploads\timestamp-filename`

### **File Persistence**
- ✅ **Files are permanently saved** to disk
- ✅ **Survive server restarts**
- ✅ **Can be accessed directly** via URL
- ✅ **Downloadable** from the uploads folder

### **Storage Management**
- **No automatic cleanup** - files remain until manually deleted
- **Storage location**: Documents folder with Uploads structure
- **Backup**: Consider copying `Documents/Uploads/` folder for backups

### **Example Workflow**
1. **Upload**: Drag a PDF file to the upload area
2. **Progress**: Watch upload progress bar (0% → 100%)
3. **Confirmation**: See "✓ Saved to: C:\Users\ddsai\Documents\Uploads\1714664523456-document.pdf"
4. **Access**: Open `C:\Users\ddsai\Documents\Uploads\1714664523456-document.pdf`
5. **Browse**: Check `Documents/Uploads/` folder on your computer

### **Troubleshooting**
- **Permission Issues**: Ensure the app can write to `Documents/Uploads/`
- **Missing Files**: Check the `Documents/Uploads/` directory
- **Large Files**: No size limit (limited by server resources)

---

**Your files are now permanently saved!** 🎉
