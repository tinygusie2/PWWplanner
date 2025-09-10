import os
import requests

font_folder = 'fonts'
# Zorg ervoor dat de fonts map bestaat
if not os.path.exists(font_folder):
    os.makedirs(font_folder)
    print(f"Map '{font_folder}' aangemaakt.")

url = "https://fonts.gstatic.com/s/materialsymbolsoutlined/v276/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oDMzByHX9rA6RzaxHMPdY43zj-jCxv3fzvRNU22ZXGJpEpjC_1v-p_4MrImHCIJIZrDCvHOej.woff2"
file_name = "Material_Symbols_Outlined.woff2"
file_path = os.path.join(font_folder, file_name)

print(f"Bestand downloaden: {file_name}")
try:
    response = requests.get(url)
    response.raise_for_status()

    with open(file_path, 'wb') as f:
        f.write(response.content)
    print(f"Succesvol gedownload: {file_name}")
except requests.exceptions.RequestException as e:
    print(f"Fout bij het downloaden van {url}: {e}")

print("\nDownloadproces voltooid.")