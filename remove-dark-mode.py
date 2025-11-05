import re
import glob

# Znajdź wszystkie pliki .tsx w src/pages/
files = glob.glob('src/pages/*.tsx')

for filepath in files:
    print(f"📄 Przetwarzam: {filepath}")
    
    # Wczytaj plik
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Usuń WSZYSTKIE dark: klasy
    content = re.sub(r'\s+dark:[^\s"\']+', '', content)
    
    # 2. Zmień bg-gradient-to- na bg-linear-to-
    content = content.replace('bg-gradient-to-', 'bg-linear-to-')
    
    # Zapisz
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Usunięto dark mode z {filepath}")

print("\n🎉 GOTOWE! Wszystkie strony bez dark mode!")
