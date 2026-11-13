#!/usr/bin/env python3
import os
import zipfile
import sys

def package_project():
    workspace_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    archive_name = "s2rfilm-screenplay-reviewer.zip"
    
    # Destination zip paths: both in root and in public/ for direct web serving
    root_zip_path = os.path.join(workspace_root, archive_name)
    public_dir = os.path.join(workspace_root, "public")
    os.makedirs(public_dir, exist_ok=True)
    public_zip_path = os.path.join(public_dir, archive_name)

    # Directories and files to exclude
    exclude_dirs = {
        'node_modules',
        'dist',
        'standalone-app',
        '.git',
        '.cache',
        '.aistudio',
        '__pycache__'
    }
    exclude_extensions = {'.zip', '.pyc', '.swp', '.DS_Store'}
    exclude_files = {'bun.lock'} # keep package-lock if any, omit local lock if redundant

    print(f"📦 Packaging project from: {workspace_root}")

    # Remove previous zips if present
    for path in [root_zip_path, public_zip_path]:
        if os.path.exists(path):
            os.remove(path)

    # Build the zip file
    files_added = 0
    with zipfile.ZipFile(root_zip_path, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for root, dirs, files in os.walk(workspace_root):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            
            for file in files:
                if any(file.endswith(ext) for ext in exclude_extensions):
                    continue
                if file in exclude_files:
                    continue

                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, workspace_root)

                # Skip anything inside node_modules or dist just in case
                parts = rel_path.split(os.sep)
                if any(part in exclude_dirs for part in parts):
                    continue

                # Add to zip under clean root folder: s2rfilm-screenplay-reviewer/...
                archive_arcname = os.path.join("s2rfilm-screenplay-reviewer", rel_path)
                zip_file.write(full_path, archive_arcname)
                files_added += 1

    # Copy to public folder
    import shutil
    shutil.copy2(root_zip_path, public_zip_path)

    size_bytes = os.path.getsize(root_zip_path)
    size_kb = size_bytes / 1024
    print(f"✅ Successfully packaged {files_added} files into {archive_name}")
    print(f"📦 Size: {size_kb:.1f} KB ({size_bytes} bytes)")
    print(f"📍 Root path: {root_zip_path}")
    print(f"🌐 Public path: {public_zip_path}")

if __name__ == '__main__':
    package_project()
