import os
import re

def walk_and_replace(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx') and not file.endswith('.ts'):
                continue
            
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            # Replace border radius
            new_content = re.sub(r'rounded-(xl|2xl|3xl|lg|full)', lambda m: 'rounded-full' if m.group(1) == 'full' else 'rounded-md', new_content)
            
            # Remove shadows
            new_content = re.sub(r'\s?shadow-(sm|md|lg|xl|2xl|none)\s?', ' ', new_content)
            new_content = re.sub(r'\s?shadow\s?', ' ', new_content)
            
            # Remove blurs
            new_content = re.sub(r'\s?backdrop-blur-(sm|md|lg|xl)\s?', ' ', new_content)
            new_content = re.sub(r'\s?blur-(sm|md|lg|xl)\s?', ' ', new_content)
            
            # Remove gradients
            new_content = re.sub(r'\s?bg-gradient-to-(r|l|t|b|tr|tl|br|bl)\s?', ' ', new_content)
            new_content = re.sub(r'\s?from-[a-z0-9/-]+\s?', ' ', new_content)
            new_content = re.sub(r'\s?to-[a-z0-9/-]+\s?', ' ', new_content)
            new_content = re.sub(r'\s?via-[a-z0-9/-]+\s?', ' ', new_content)

            # Recharts specific changes (Area -> Line, AreaChart -> LineChart)
            # and remove area fills.
            # I will do this manually for Charts.tsx, but I'll do AreaChart -> LineChart here if possible.
            # Actually, let's leave Recharts replacements down to manual file changes to avoid mistakes with imports.

            new_content = re.sub(r'\s{2,}', ' ', new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

walk_and_replace('./src')
