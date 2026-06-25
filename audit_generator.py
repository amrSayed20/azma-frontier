import os
import re
from collections import defaultdict
from pathlib import Path

# Set up paths
chambers_path = r"c:\Users\Hp\azma-frontier\src\chambers"
output_path = r"c:\Users\Hp\azma-frontier"

# ============================================
# PART 1: CHAMBER AUDIT
# ============================================

chamber_data = {}
chambers_list = []

# Get all chambers (immediate subdirectories + root files)
for item in os.listdir(chambers_path):
    item_path = os.path.join(chambers_path, item)
    if item.endswith('.ts'):
        if 'Root' not in chamber_data:
            chamber_data['Root'] = {'path': chambers_path, 'files': [], 'folders': []}
        chamber_data['Root']['files'].append(item)
    elif os.path.isdir(item_path) and not item.startswith('.'):
        chambers_list.append(item)
        chamber_data[item] = {'path': item_path, 'files': [], 'folders': []}

# For each chamber, collect files and folders
for chamber in chambers_list:
    chamber_path = os.path.join(chambers_path, chamber)
    for root, dirs, files in os.walk(chamber_path):
        rel_root = os.path.relpath(root, chamber_path)
        
        for file in files:
            if file.endswith('.ts'):
                if rel_root == '.':
                    chamber_data[chamber]['files'].append(file)
                else:
                    chamber_data[chamber]['files'].append(os.path.join(rel_root, file))
        
        for d in dirs:
            if not d.startswith('.') and rel_root == '.':
                chamber_data[chamber]['folders'].append(d)

# Generate AZMA_CHAMBER_AUDIT.md
chamber_audit = "# AZMA OS – Complete Chamber Inventory\n\n"

if 'Root' in chamber_data and chamber_data['Root']['files']:
    chamber_audit += "## Root Chamber\n\n"
    chamber_audit += f"**Path**: `src/chambers`\n\n"
    chamber_audit += "### Files\n\n"
    for f in sorted(chamber_data['Root']['files']):
        chamber_audit += f"- {f}\n"
    chamber_audit += f"\n**File Count**: {len(chamber_data['Root']['files'])}\n\n"

for chamber in sorted(chambers_list):
    data = chamber_data[chamber]
    chamber_audit += f"## {chamber}\n\n"
    chamber_audit += f"**Path**: `src/chambers/{chamber}`\n\n"
    
    if data['folders']:
        chamber_audit += "### Subfolders\n\n"
        for folder in sorted(data['folders']):
            chamber_audit += f"- {folder}/\n"
        chamber_audit += "\n"
    
    chamber_audit += "### Files\n\n"
    for f in sorted(data['files']):
        chamber_audit += f"- {f}\n"
    
    chamber_audit += f"\n**File Count**: {len(data['files'])}\n\n"

# Write chamber audit
with open(os.path.join(output_path, 'AZMA_CHAMBER_AUDIT.md'), 'w', encoding='utf-8') as f:
    f.write(chamber_audit)

print("✓ AZMA_CHAMBER_AUDIT.md created")

# ============================================
# PART 2: DEPENDENCY AUDIT
# ============================================

# Extract all imports from chamber files
chamber_imports = defaultdict(lambda: {'imports_from': defaultdict(set), 'imported_by': defaultdict(set)})
all_exports = defaultdict(set)

import_pattern = r"from\s+['\"]([^'\"]+)['\"]"

for root, dirs, files in os.walk(chambers_path):
    # Skip nested node_modules, .next, etc
    dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
    
    for file in files:
        if file.endswith('.ts'):
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, chambers_path)
            
            # Determine which chamber this file belongs to
            chamber_name = rel_path.split(os.sep)[0]
            
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                    # Find all imports
                    imports = re.findall(import_pattern, content)
                    
                    for imp in imports:
                        # Identify if import is from another chamber
                        if 'chambers' in imp:
                            # Extract chamber name from import path
                            if 'chambers/' in imp:
                                parts = imp.split('chambers/')
                                if len(parts) > 1:
                                    target_chamber = parts[1].split('/')[0]
                                    if target_chamber in chambers_list or target_chamber == chamber_name:
                                        chamber_imports[chamber_name]['imports_from'][target_chamber].add(imp)
                                        if target_chamber != chamber_name:
                                            chamber_imports[target_chamber]['imported_by'][chamber_name].add(imp)
            except Exception as e:
                pass

# Detect circular dependencies
circular_deps = []
for chamber in chambers_list:
    imports_from = chamber_imports[chamber]['imports_from']
    for dep_chamber in imports_from:
        if chamber in chamber_imports[dep_chamber]['imports_from']:
            pair = tuple(sorted([chamber, dep_chamber]))
            if pair not in circular_deps:
                circular_deps.append(pair)

# Generate AZMA_DEPENDENCY_AUDIT.md
dep_audit = "# AZMA OS – Cross Chamber Dependencies\n\n"

for chamber in sorted(chambers_list):
    data = chamber_imports[chamber]
    dep_audit += f"## {chamber}\n\n"
    
    if data['imports_from']:
        dep_audit += "### Imports from Other Chambers\n\n"
        for target_chamber in sorted(data['imports_from'].keys()):
            if target_chamber != chamber:
                paths = sorted(data['imports_from'][target_chamber])
                dep_audit += f"**From `{target_chamber}`** ({len(paths)} import path{'s' if len(paths) != 1 else ''}):\n\n"
                for path in paths:
                    dep_audit += f"- {path}\n"
                dep_audit += "\n"
    else:
        dep_audit += "### Imports from Other Chambers\n\n- None detected\n\n"
    
    if data['imported_by']:
        dep_audit += "### Imported By\n\n"
        for source_chamber in sorted(data['imported_by'].keys()):
            paths = sorted(data['imported_by'][source_chamber])
            dep_audit += f"**By `{source_chamber}`** ({len(paths)} import path{'s' if len(paths) != 1 else ''}):\n\n"
            for path in paths:
                dep_audit += f"- {path}\n"
            dep_audit += "\n"
    else:
        dep_audit += "### Imported By\n\n- Not imported by other chambers\n\n"

if circular_deps:
    dep_audit += "## Circular Dependencies Detected\n\n"
    for pair in circular_deps:
        dep_audit += f"- **{pair[0]}** ↔ **{pair[1]}**\n"
    dep_audit += "\n"
else:
    dep_audit += "## Circular Dependencies\n\n- None detected\n\n"

dep_audit += "## Shared Module Patterns\n\n"

# Count files by pattern
pattern_counts = defaultdict(int)
for chamber in chambers_list:
    chamber_path = os.path.join(chambers_path, chamber)
    for root, dirs, files in os.walk(chamber_path):
        for file in files:
            if file.endswith('.ts'):
                # Extract patterns (e.g., *-engine.ts, *-manager.ts)
                if '-' in file:
                    parts = file.split('-')
                    suffix = parts[-1].replace('.ts', '')
                    pattern_counts[suffix] += 1

if pattern_counts:
    sorted_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)
    for pattern, count in sorted_patterns[:10]:
        dep_audit += f"- `*-{pattern}.ts`: {count} files\n"
else:
    dep_audit += "- No shared patterns detected\n"

# Write dependency audit
with open(os.path.join(output_path, 'AZMA_DEPENDENCY_AUDIT.md'), 'w', encoding='utf-8') as f:
    f.write(dep_audit)

print("✓ AZMA_DEPENDENCY_AUDIT.md created")
print(f"\nAudit files created in: {output_path}")
