import os
import re
import glob

def migrate_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # If it doesn't use Supabase .from, skip
    if '.from(' not in content:
        return

    # Replace basic select all
    # db.from('table').select('*') -> db.collection('table').get()
    
    # We will just replace common patterns
    content = re.sub(r"\.from\((['`\"])([^'`\"]+)\1\)", r".collection('\2')", content)
    content = re.sub(r"\.select\((['`\"])[^'`\"]+\1\)", r"", content)
    content = re.sub(r"\.eq\((['`\"])([^'`\"]+)\1,\s*([^)]+)\)", r".where('\2', '==', \3)", content)
    content = re.sub(r"\.single\(\)", r".limit(1).get().then(s => ({ data: s.empty ? null : { id: s.docs[0].id, ...s.docs[0].data() }, error: null }))", content)
    
    # .get() replacement where it's just a generic query
    content = re.sub(r"await db\.collection\('([^']+)'\)(.*?)\n", r"await db.collection('\1')\2.get().then(s => ({ data: s.docs.map(d => ({id: d.id, ...d.data()})), error: null }))\n", content)

    # Note: This is extremely basic and might produce syntactically incorrect code,
    # but it's a start.
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, dirs, files in os.walk('app/api'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            migrate_file(os.path.join(root, file))

for root, dirs, files in os.walk('lib/services'):
    for file in files:
        if file.endswith('.ts') or file.endswith('.tsx'):
            migrate_file(os.path.join(root, file))
