import os
import re

files = [
    'src/features/menu/components/CategoryDialog.tsx',
    'src/features/menu/components/MenuDialog.tsx',
    'src/features/orders/components/FloorDialog.tsx',
    'src/features/users/components/UserDialog.tsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    pattern = re.compile(r'<form\.Field([\s\S]*?)children=\{\((.*?)\)\s*=>\s*\(([\s\S]*?)\)\}\s*/>')
    new_content = pattern.sub(r'<form.Field\1>{(\2) => (\3)}</form.Field>', content)
    
    with open(file, 'w') as f:
        f.write(new_content)
