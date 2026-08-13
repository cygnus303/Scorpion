import re

path = r"e:\frontend scroption\Scorpion\scorpion\src\app\shared\components\date-range-picker\date-range-picker.component.ts"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace template div
content = content.replace(
    '<div class="date-picker-container">',
    '<div class="date-picker-container" [ngClass]="\'theme-\' + theme">'
)

# Add @Input() theme
if "@Input() theme: 'indigo' | 'red' = 'indigo';" not in content:
    content = content.replace(
        '@Input() initialToDate!: Date;',
        "@Input() initialToDate!: Date;\n  @Input() theme: 'indigo' | 'red' = 'indigo';"
    )

# Replace ngOnInit bsConfig class
content = content.replace(
    "containerClass: 'theme-indigo',",
    "containerClass: this.theme === 'red' ? 'theme-red' : 'theme-indigo',"
)
content = content.replace(
    "ngOnInit() {",
    "ngOnInit() {\n    this.bsConfig.containerClass = this.theme === 'red' ? 'theme-red' : 'theme-indigo';"
)
content = content.replace(
    "ngOnChanges() {",
    "ngOnChanges() {\n    this.bsConfig.containerClass = this.theme === 'red' ? 'theme-red' : 'theme-indigo';"
)

# Replace CSS
css_replacements = {
    '#6366f1': 'var(--theme-primary)',
    '#4f46e5': 'var(--theme-primary-hover)',
    '#eef2ff': 'var(--theme-primary-bg)',
    '#c7d2fe': 'var(--theme-primary-border)',
    '#e0e7ff': 'var(--theme-primary-light-hover)',
    '#4338ca': 'var(--theme-primary-text)',
    '#ddd6fe': 'var(--theme-primary-border-light)',
    '#f5f3ff': 'var(--theme-primary-bg-light)',
    '#a5b4fc': 'var(--theme-primary-hover-border)',
    'rgba(99,102,241,0.1)': 'var(--theme-primary-shadow-light)',
    'rgba(99,102,241,0.14)': 'var(--theme-primary-shadow-md)',
    'rgba(99,102,241,0.25)': 'var(--theme-primary-shadow)',
    'rgba(99,102,241,0.12)': 'var(--theme-primary-shadow-focus)'
}

for old, new in css_replacements.items():
    content = content.replace(old, new)

# Add css variables
variables_css = """
    .date-picker-container {
      position: relative;
      display: inline-block;
      
      &.theme-indigo {
        --theme-primary: #6366f1;
        --theme-primary-hover: #4f46e5;
        --theme-primary-bg: #eef2ff;
        --theme-primary-border: #c7d2fe;
        --theme-primary-light-hover: #e0e7ff;
        --theme-primary-text: #4338ca;
        --theme-primary-border-light: #ddd6fe;
        --theme-primary-bg-light: #f5f3ff;
        --theme-primary-hover-border: #a5b4fc;
        --theme-primary-shadow-light: rgba(99,102,241,0.1);
        --theme-primary-shadow-md: rgba(99,102,241,0.14);
        --theme-primary-shadow: rgba(99,102,241,0.25);
        --theme-primary-shadow-focus: rgba(99,102,241,0.12);
      }
      
      &.theme-red {
        --theme-primary: #dc2626;
        --theme-primary-hover: #b91c1c;
        --theme-primary-bg: #fef2f2;
        --theme-primary-border: #fecaca;
        --theme-primary-light-hover: #fee2e2;
        --theme-primary-text: #991b1b;
        --theme-primary-border-light: #fca5a5;
        --theme-primary-bg-light: #fff1f2;
        --theme-primary-hover-border: #f87171;
        --theme-primary-shadow-light: rgba(220,38,38,0.1);
        --theme-primary-shadow-md: rgba(220,38,38,0.14);
        --theme-primary-shadow: rgba(220,38,38,0.25);
        --theme-primary-shadow-focus: rgba(220,38,38,0.12);
      }
    }
"""

content = content.replace(
    ".date-picker-container {\n      position: relative;\n      display: inline-block;\n    }",
    variables_css
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
