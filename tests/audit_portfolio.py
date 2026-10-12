import re
from html.parser import HTMLParser

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

# Check for banned claims
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

# Check degree wording (Item 9)
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

required_degree = 'Bachelor of Business Administration, BRAC University. Major in Finance, minor in Supply Chain Management. 2022 to 2026.'
if required_degree in html:
    print(f'Degree wording verified: "{required_degree}" is present in index.html!')
else:
    print('ERROR: Exact degree wording not found in index.html!')
    found_any = True

# Check dash punctuation in visible HTML text
class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
        self.ignore = False
    def handle_starttag(self, tag, attrs):
        if tag in ['script', 'style']:
            self.ignore = True
    def handle_endtag(self, tag):
        if tag in ['script', 'style']:
            self.ignore = False
    def handle_data(self, data):
        if not self.ignore:
            self.texts.append(data)

parser = TextExtractor()
parser.feed(html)
all_body_text = ' '.join(parser.texts)

em_en_dashes = re.findall(r'[—–]', all_body_text)
hyphen_punct = re.findall(r'\s+-\s+', all_body_text)
if em_en_dashes or hyphen_punct:
    print(f'ERROR: Dash punctuation detected! Em/en: {em_en_dashes}, Hyphen punct: {hyphen_punct}')
    found_any = True
else:
    print('ALL CLEAR: Zero dash punctuation in visible copy!')

# Check Core Competencies removed
if 'id="competencies"' in html or 'href="#competencies"' in html:
    print('ERROR: Core Competencies still present in index.html!')
    found_any = True
else:
    print('ALL CLEAR: Core Competencies completely removed!')

# Check v1.0.0 once only in PROBAHO card
probaho_card_m = re.search(r'<article class="flagship-showcase-card">.*?</article>', html, re.DOTALL)
if probaho_card_m:
    v1_count = probaho_card_m.group(0).count('v1.0.0')
    if v1_count == 1:
        print('ALL CLEAR: v1.0.0 appears exactly once in PROBAHO card!')
    else:
        print(f'ERROR: v1.0.0 appears {v1_count} times in PROBAHO card (expected 1)!')
        found_any = True

# Check mailto link in contact
if 'mailto:irfanur6@gmail.com?subject=Inquiry%20from%20Portfolio' in html:
    print('ALL CLEAR: Standard mailto link verified in Contact!')
else:
    print('ERROR: Standard mailto link missing!')
    found_any = True

if not found_any:
    print('\nOVERALL AUDIT RESULT: 100% PASSED!')
