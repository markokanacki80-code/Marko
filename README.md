# Digitaler Unfall-Meldeblock

Responsive web application for documenting first-aid kit use and workplace incidents.

## Start

Open `index.html` in a modern browser. No build step is required.

## Data and Excel export

Submitted reports are saved in the browser's local storage on the current device and remain there after closing or refreshing the page. Use **Excel-Datei exportieren** to download all saved reports as an `.xlsx` workbook. The Excel export uses SheetJS from a CDN, so an internet connection is needed for exporting. The reports themselves are stored locally and do not require a connection.

Local browser storage is specific to the browser and device. It is not a shared database or a backup; clearing browser data or changing devices will not carry reports over. Export the workbook regularly and store it safely.
