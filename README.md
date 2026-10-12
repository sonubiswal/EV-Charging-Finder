<div align="center">

<img src="assets/banner.svg" width="100%" alt="EV Charging Finder"/>

<br/>

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Folium](https://img.shields.io/badge/Folium-Leaflet-77B829?style=for-the-badge&logo=leaflet&logoColor=white)](https://python-visualization.github.io/folium/)
[![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-Nominatim-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)](https://nominatim.org/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

![Platform](https://img.shields.io/badge/Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square)
![Region](https://img.shields.io/badge/coverage-India-ff9933?style=flat-square)
![Output](https://img.shields.io/badge/output-interactive%20HTML%20map-0ea5e9?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)

**Type any place in India. Get the nearest EV charging station and a driving route to it, on an interactive map.**

[✨ Features](#-features) &nbsp;•&nbsp;
[🚀 Quick Start](#-quick-start) &nbsp;•&nbsp;
[🔬 How It Works](#-how-it-works) &nbsp;•&nbsp;
[🏗️ Project Structure](#%EF%B8%8F-project-structure) &nbsp;•&nbsp;
[🗺️ Roadmap](#%EF%B8%8F-roadmap)

</div>

<!--
  Add a screenshot of a generated map here:
  <div align="center"><img src="assets/screenshots/map.png" width="820" alt="Generated route map"/></div>
-->

<br/>

## 🌟 At a Glance

<table align="center">
  <tr>
    <td align="center" width="25%"><h3>1</h3><sub>command to<br/>generate a map</sub></td>
    <td align="center" width="25%"><h3>Any place</h3><sub>city, road or<br/>landmark</sub></td>
    <td align="center" width="25%"><h3>0</h3><sub>API keys<br/>required</sub></td>
    <td align="center" width="25%"><h3>HTML</h3><sub>shareable output,<br/>opens in any browser</sub></td>
  </tr>
</table>

---

## 🎯 Why This Project

Range anxiety is mostly a *finding-a-charger* problem. This tool turns a plain-language location into the closest known charging station and a drivable route, with no accounts, no keys and no app to install.

---

## ✨ Features

<table>
  <tr>
    <td width="33%" valign="top">
      <h3>📍 Smart Geocoding</h3>
      Accepts a <b>city, road or landmark</b> and converts it to coordinates using Nominatim (OpenStreetMap).
    </td>
    <td width="33%" valign="top">
      <h3>🔌 Nearest Station Search</h3>
      Searches a CSV dataset of <b>Indian EV charging stations</b> to find the closest one to you.
    </td>
    <td width="33%" valign="top">
      <h3>🛣️ Driving Directions</h3>
      Draws a <b>driving route</b> to the station using the public OSRM routing API.
    </td>
  </tr>
  <tr>
    <td valign="top">
      <h3>🗺️ Interactive Map</h3>
      Pan, zoom and explore the result on a Folium (Leaflet) map.
    </td>
    <td valign="top">
      <h3>💾 Shareable Output</h3>
      Saves everything as a single <b>HTML file</b> you can open in a browser or send to someone.
    </td>
    <td valign="top">
      <h3>🔑 Keyless &amp; Free</h3>
      Built entirely on open services and an open dataset.
    </td>
  </tr>
</table>

---

## 🔬 How It Works

```mermaid
flowchart LR
    A([⌨️ You type a<br/>location]) --> B[Geocode<br/>Nominatim]
    B --> C[(🔌 EV stations CSV)]
    C --> D{{Find nearest<br/>station}}
    D --> E[Route<br/>OSRM]
    E --> F([🗺️ Folium map<br/>saved as HTML])

    style A fill:#0f6b4f,color:#fff,stroke:none
    style D fill:#37e08f,color:#04130f,stroke:none
    style F fill:#0ea5e9,color:#fff,stroke:none
```

| Step | What happens |
|:---:|---|
| **1 · Input** | You enter any location name when prompted |
| **2 · Geocode** | `geopy` + Nominatim turn it into latitude and longitude |
| **3 · Search** | The station CSV is searched for the closest charging station |
| **4 · Route** | The OSRM public API returns a driving route to that station |
| **5 · Render** | Folium draws the map and route, then saves an HTML file |

---

## 🚀 Quick Start

> **Requirements:** Python **3.10+** and an internet connection.

**1 · Clone**

```bash
git clone https://github.com/sonubiswal/EV-Charging-Finder.git
cd EV-Charging-Finder
```

**2 · Create a virtual environment**

<table>
<tr><th>🪟 Windows</th><th>🍎 macOS / 🐧 Linux</th></tr>
<tr>
<td>

```bash
python -m venv venv
venv\Scripts\activate
```

</td>
<td>

```bash
python3 -m venv venv
source venv/bin/activate
```

</td>
</tr>
</table>

**3 · Install**

```bash
pip install -r requirements.txt
```

**4 · Run**

```bash
python backend/map_generator.py
```

Enter any location when prompted, then **open the generated HTML file in your browser**.

<details>
<summary><b>💡 Example locations to try</b></summary>

<br/>

- A city, such as `Bhubaneswar`
- A road or area, such as `Connaught Place, New Delhi`
- A landmark, such as `Gateway of India`

</details>

---

## 🏗️ Project Structure

```
EV-Charging-Finder/
├── 🐍 backend/
│   └── map_generator.py                 # Geocoding, nearest-station search, route rendering
├── 📊 data/
│   └── ev-charging-stations-india.csv   # Station dataset
├── 🎨 frontend/                         # Static HTML/CSS/JS landing pages
├── requirements.txt
└── README.md
```

| Path | Role |
|---|---|
| `backend/map_generator.py` | The core script: geocodes input, finds the nearest station, renders the route map |
| `data/ev-charging-stations-india.csv` | The dataset of Indian EV charging stations |
| `frontend/` | Static landing pages |

---

## 🩺 Troubleshooting

<details>
<summary><b>📍 My location isn't found</b></summary>

<br/>

Try a more specific query that includes the city or state, for example `Sector 62, Noida` instead of just `Sector 62`.

</details>

<details>
<summary><b>🌐 No route or geocoding result appears</b></summary>

<br/>

The app relies on public services (Nominatim and the OSRM demo API). Check your internet connection, and retry after a moment, since public endpoints can rate-limit or be temporarily unavailable.

</details>

<details>
<summary><b>📦 ModuleNotFoundError</b></summary>

<br/>

Make sure your virtual environment is active, then reinstall:

```bash
pip install -r requirements.txt
```

</details>

<details>
<summary><b>🪟 venv won't activate in PowerShell</b></summary>

<br/>

Use Command Prompt, or allow scripts for the current session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
```

</details>

---

## 🛠️ Tech Stack

<div align="center">

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Folium](https://img.shields.io/badge/Folium-77B829?style=for-the-badge&logo=leaflet&logoColor=white)
![geopy](https://img.shields.io/badge/geopy-Nominatim-2c3e50?style=for-the-badge)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-7EBC6F?style=for-the-badge&logo=openstreetmap&logoColor=white)
![OSRM](https://img.shields.io/badge/OSRM-Routing-0ea5e9?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML%2FCSS%2FJS-E34F26?style=for-the-badge&logo=html5&logoColor=white)

</div>

---

## 🗺️ Roadmap

- [ ] 🔢 Show the top N nearest stations, not just one
- [ ] 🔌 Filter by connector type or charging speed
- [ ] 📏 Display distance and estimated drive time on the map
- [ ] 🌐 Web interface to run searches from the browser
- [ ] 📦 Command-line arguments instead of an interactive prompt

Have an idea? [Open an issue](https://github.com/sonubiswal/EV-Charging-Finder/issues) 💬

---

## 🤝 Contributing

Contributions, bug reports and feature requests are welcome.

1. 💬 **Open an issue** first to discuss any major change
2. 🍴 **Fork** the repo and create a branch: `git checkout -b feature/your-feature`
3. ✍️ **Commit** with clear, descriptive messages
4. 🚀 **Open a Pull Request** explaining what changed and why

---

## 🙏 Data Attribution

- Map data © **[OpenStreetMap](https://www.openstreetmap.org/copyright) contributors**
- Geocoding by **[Nominatim](https://nominatim.org/)**, routing by **[OSRM](https://project-osrm.org/)**
- Please respect the usage policies of these public services

> ⚠️ **Disclaimer:** Station data may be incomplete or out of date. Confirm availability and connector compatibility before you travel.

---

## 📄 License

Released under the **MIT License**. See [LICENSE](LICENSE).

## 👤 Author

**Sonu Biswal** · [@sonubiswal](https://github.com/sonubiswal)

<div align="center">

<br/>

### ⭐ If this project helped you, give it a star!

<sub>Built with Python, Folium and OpenStreetMap</sub>

</div>