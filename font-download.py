import os
import requests

fonts_to_download = {
    "Google Sans": {
        "Normal (400)": {
            "latin-ext": "https://fonts.gstatic.com/s/googlesans/v65/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2",
            "latin": "https://fonts.gstatic.com/s/googlesans/v65/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2"
        },
        "Halfvet (500)": {
            "latin-ext": "https://fonts.gstatic.com/s/googlesans/v65/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2",
            "latin": "https://fonts.gstatic.com/s/googlesans/v65/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2"
        },
        "Vet (700)": {
            "latin-ext": "https://fonts.gstatic.com/s/googlesans/v65/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjwUvaYr.woff2",
            "latin": "https://fonts.gstatic.com/s/googlesans/v65/4UasrENHsxJlGDuGo1OIlJfC6l_24rlCK1Yo_Iqcsih3SAyH6cAwhX9RPjIUvQ.woff2"
        }
    },
    "Google Sans Text": {
        "Normal (400)": {
            "latin-ext": "https://fonts.gstatic.com/s/googlesanstext/v24/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qER2i1dC.woff2",
            "latin": "https://fonts.gstatic.com/s/googlesanstext/v24/5aUu9-KzpRiLCAt4Unrc-xIKmCU5qEp2iw.woff2"
        },
        "Halfvet (500)": {
            "latin-ext": "https://fonts.gstatic.com/s/googlesanstext/v24/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmZjtiu7.woff2",
            "latin": "https://fonts.gstatic.com/s/googlesanstext/v24/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oLlVnmhjtg.woff2"
        },
        "Vet (700)": {
            "latin-ext": "https://fonts.gstatic.com/s/googlesanstext/v24/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oPFTnmZjtiu7.woff2",
            "latin": "https://fonts.gstatic.com/s/googlesanstext/v24/5aUp9-KzpRiLCAt4Unrc-xIKmCU5oPFTnmhjtg.woff2"
        }
    }
}

font_folder = 'fonts'
if not os.path.exists(font_folder):
    os.makedirs(font_folder)
    print(f"Map '{font_folder}' aangemaakt.")

for font_family, weights in fonts_to_download.items():
    for weight_name, subsets in weights.items():
        for subset, url in subsets.items():
            family_name_safe = font_family.replace(" ", "_")
            weight_name_safe = weight_name.split(' ')[0]

            file_name = f"{family_name_safe}_{weight_name_safe}_{subset}.woff2"
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