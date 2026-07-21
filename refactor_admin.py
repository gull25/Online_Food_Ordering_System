import os
import re

base_dir = r"c:\React JS Notes\mern-project\client\src\pages\Admin"

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            original_content = content

            # Fix `ml-64` to `md:ml-64`
            # Look for exact ` ml-64` or `"ml-64` to avoid `md:ml-64` that might already exist
            content = re.sub(r'(?<!md:)ml-64', 'md:ml-64', content)
            
            # Fix Sidebar fixed `w-64` to be responsive
            content = re.sub(r'w-64 fixed', 'w-full h-auto relative md:w-64 md:fixed', content)
            
            # Fix `w-[calc(100%-256px)]` to `w-full md:w-[calc(100%-256px)]`
            content = re.sub(r'(?<!md:)w-\[calc\(100%-256px\)\]', 'w-full md:w-[calc(100%-256px)]', content)

            if content != original_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Updated {file}")

print("Admin pages responsive refactoring complete.")
