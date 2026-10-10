import re

buzzwords = [
    'synergy', 'friction', 'resilient', 'uncompromised',
    'orchestrate', 'spearheaded', 'engineered', 'enterprise grade',
    'enterprise-grade', 'sub-millisecond', 'sub millisecond',
    'immutable', 'cryptographic'
]

files = ['index.html', 'projects.json', 'script.js']

found_any = False
for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read().lower()
    for bw in buzzwords:
        if bw in content:
            print(f'Found buzzword: "{bw}" in {fname}!')
            found_any = True

if not found_any:
    print('ALL CLEAR: Zero buzzwords found across all files!')

# Check for banned claims from rule 22
banned_claims = [
    '100% operational uptime',
    'uncompromised uptime',
    'without data loss',
    'sub millisecond',
    'immutable audit stamps',
    'cryptographic release binaries',
    'production ready'
]

for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read().lower()
    for claim in banned_claims:
        if claim in content:
            print(f'Found banned claim: "{claim}" in {fname}!')
            found_any = True

if not found_any:
    print('ALL CLEAR: Zero banned claims found!')

# Check privacy: CGPA, phone numbers, home address
privacy_terms = ['cgpa', '3.52', '130 credits', '+880', 'ssc', 'hsc']
for fname in files:
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read().lower()
    for pt in privacy_terms:
        if pt in content:
            print(f'Found privacy term: "{pt}" in {fname}!')
            found_any = True

if not found_any:
    print('ALL CLEAR: Strict privacy verified (no CGPA, no phone, no sensitive details)!')

# Check degree wording
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

required_degree = 'BBA, BRAC University. Major in Finance, minor in Supply Chain Management. 2022 to 2026.'
if required_degree in html:
    print(f'Degree wording verified: "{required_degree}" is present in index.html!')
else:
    print('WARNING: Exact degree wording not found in index.html!')
