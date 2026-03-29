// Elementos customizados incorporados ao projeto
// Estes elementos substituem os elementos geométricos padrão

export interface CustomElement {
  id: string;
  svg: string;
  name: string;
}

// Biblioteca completa de 60 elementos customizados (10 por categoria)
export const customElements: Record<string, CustomElement> = {
  "foundation-1": {
    "id": "foundation-1",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<rect x=\"1874\" width=\"250\" height=\"1874\" transform=\"rotate(90 1874 0)\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor10.svg"
  },
  "foundation-2": {
    "id": "foundation-2",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<rect x=\"1874\" width=\"250\" height=\"1874\" transform=\"rotate(90 1874 0)\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor09.svg"
  },
  "foundation-3": {
    "id": "foundation-3",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<rect x=\"1874\" width=\"250\" height=\"1874\" transform=\"rotate(90 1874 0)\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor08.svg"
  },
  "foundation-4": {
    "id": "foundation-4",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<rect x=\"1874\" width=\"250\" height=\"1874\" transform=\"rotate(90 1874 0)\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor07.svg"
  },
  "foundation-5": {
    "id": "foundation-5",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<rect x=\"1874\" width=\"250\" height=\"1874\" transform=\"rotate(90 1874 0)\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor06.svg"
  },
  "foundation-6": {
    "id": "foundation-6",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<mask id=\"path-1-inside-1_25_426\" fill=\"white\">\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" stroke=\"white\" stroke-width=\"2\"/>\n</mask>\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n<path d=\"M1874 125C1870.38 168.038 1843.41 206.229 1807.54 222.846C1788.89 231.707 1768.2 234.372 1749 231.526C1747.23 231.306 1745.46 231.084 1743.69 230.862C1685.41 223.553 1627.13 215.55 1568.86 215.5C1087.57 215.091 606.286 214.769 125 214.416C77.4054 215.567 34.4749 172.508 35.7308 125C35.7308 125 35.7308 125 35.7308 125C34.5821 77.4833 77.5725 34.6261 125 35.8824C173.737 35.9209 222.474 35.96 271.211 35.9999C326.003 36.0448 380.796 91.9999 435.588 91.9999C550.907 91.9999 666.227 28.9999 781.546 29C869.469 29 957.392 95.5 1045.31 95.5C1144.07 95.5 1242.82 31 1341.58 31C1440.33 31 1539.08 87.5 1637.84 87.5C1673.12 87.5 1708.4 77.2712 1743.69 64.4917C1745.46 63.8501 1747.23 63.2021 1749 62.5486C1765.82 49.564 1795.81 43.3845 1821.97 57.3603C1845.4 69.5004 1865.28 93.8542 1873.5 125C1873.83 125 1874.17 125 1874.5 125C1883 93.7458 1878.51 56.1155 1859.37 22.6799C1839.04 -13.9209 1800.92 -49.957 1749 -62.5486C1747.23 -63.2021 1745.46 -63.8501 1743.69 -64.4917C1708.4 -77.2712 1673.12 -87.5 1637.84 -87.5C1539.08 -87.5 1440.33 -31 1341.58 -31C1242.82 -31 1144.07 -95.5 1045.31 -95.5C957.392 -95.5 869.469 -29 781.546 -29C666.227 -29.0001 550.908 -92.0001 435.588 -92.0001C380.796 -92.0001 326.003 -36.0449 271.211 -36.0001C222.474 -35.9602 173.737 -35.921 125 -35.8826C39.2621 -37.8641 -37.82 39.3512 -35.7308 125C-35.7308 125 -35.7308 125 -35.7308 125C-37.7129 210.657 39.4292 287.67 125 285.584C606.286 285.231 1087.57 284.909 1568.86 284.5C1627.13 284.45 1685.41 276.447 1743.69 269.138C1745.46 268.916 1747.23 268.694 1749 268.474C1774.79 265.712 1798.96 256.04 1818.85 241.713C1857.25 214.52 1878.44 168.284 1874.5 125L1874 125ZM1874 125L-nan -nanL1874.5 125L1873.5 125L-nan -nanL1874 125Z\" fill=\"black\" mask=\"url(#path-1-inside-1_25_426)\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor05.svg"
  },
  "foundation-7": {
    "id": "foundation-7",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<mask id=\"path-1-inside-1_25_427\" fill=\"white\">\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" stroke=\"white\" stroke-width=\"2\"/>\n</mask>\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n<path d=\"M1874 125C1870.38 168.038 1843.41 206.229 1807.54 222.846C1788.89 231.707 1768.2 234.372 1749 231.526C1747.23 231.306 1745.46 231.084 1743.69 230.862C1685.41 223.553 1627.13 215.55 1568.86 215.5C1087.57 215.091 606.286 214.769 125 214.416C77.4054 215.567 34.4749 172.508 35.7308 125C35.7308 125 35.7308 125 35.7308 125C34.5821 77.4833 77.5725 34.6261 125 35.8824C173.737 35.9209 222.474 35.96 271.211 35.9999C326.003 36.0448 380.796 91.9999 435.588 91.9999C550.907 91.9999 666.227 28.9999 781.546 29C869.469 29 957.392 95.5 1045.31 95.5C1144.07 95.5 1242.82 31 1341.58 31C1440.33 31 1539.08 87.5 1637.84 87.5C1673.12 87.5 1708.4 77.2712 1743.69 64.4917C1745.46 63.8501 1747.23 63.2021 1749 62.5486C1765.82 49.564 1795.81 43.3845 1821.97 57.3603C1845.4 69.5004 1865.28 93.8542 1873.5 125C1873.83 125 1874.17 125 1874.5 125C1883 93.7458 1878.51 56.1155 1859.37 22.6799C1839.04 -13.9209 1800.92 -49.957 1749 -62.5486C1747.23 -63.2021 1745.46 -63.8501 1743.69 -64.4917C1708.4 -77.2712 1673.12 -87.5 1637.84 -87.5C1539.08 -87.5 1440.33 -31 1341.58 -31C1242.82 -31 1144.07 -95.5 1045.31 -95.5C957.392 -95.5 869.469 -29 781.546 -29C666.227 -29.0001 550.908 -92.0001 435.588 -92.0001C380.796 -92.0001 326.003 -36.0449 271.211 -36.0001C222.474 -35.9602 173.737 -35.921 125 -35.8826C39.2621 -37.8641 -37.82 39.3512 -35.7308 125C-35.7308 125 -35.7308 125 -35.7308 125C-37.7129 210.657 39.4292 287.67 125 285.584C606.286 285.231 1087.57 284.909 1568.86 284.5C1627.13 284.45 1685.41 276.447 1743.69 269.138C1745.46 268.916 1747.23 268.694 1749 268.474C1774.79 265.712 1798.96 256.04 1818.85 241.713C1857.25 214.52 1878.44 168.284 1874.5 125L1874 125ZM1874 125L-nan -nanL1874.5 125L1873.5 125L-nan -nanL1874 125Z\" fill=\"black\" mask=\"url(#path-1-inside-1_25_427)\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor04.svg"
  },
  "foundation-8": {
    "id": "foundation-8",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<mask id=\"path-1-inside-1_25_428\" fill=\"white\">\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" stroke=\"white\" stroke-width=\"2\"/>\n</mask>\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n<path d=\"M1874 125C1870.38 168.038 1843.41 206.229 1807.54 222.846C1788.89 231.707 1768.2 234.372 1749 231.526C1747.23 231.306 1745.46 231.084 1743.69 230.862C1685.41 223.553 1627.13 215.55 1568.86 215.5C1087.57 215.091 606.286 214.769 125 214.416C77.4054 215.567 34.4749 172.508 35.7308 125C35.7308 125 35.7308 125 35.7308 125C34.5821 77.4833 77.5725 34.6261 125 35.8824C173.737 35.9209 222.474 35.96 271.211 35.9999C326.003 36.0448 380.796 91.9999 435.588 91.9999C550.907 91.9999 666.227 28.9999 781.546 29C869.469 29 957.392 95.5 1045.31 95.5C1144.07 95.5 1242.82 31 1341.58 31C1440.33 31 1539.08 87.5 1637.84 87.5C1673.12 87.5 1708.4 77.2712 1743.69 64.4917C1745.46 63.8501 1747.23 63.2021 1749 62.5486C1765.82 49.564 1795.81 43.3845 1821.97 57.3603C1845.4 69.5004 1865.28 93.8542 1873.5 125C1873.83 125 1874.17 125 1874.5 125C1883 93.7458 1878.51 56.1155 1859.37 22.6799C1839.04 -13.9209 1800.92 -49.957 1749 -62.5486C1747.23 -63.2021 1745.46 -63.8501 1743.69 -64.4917C1708.4 -77.2712 1673.12 -87.5 1637.84 -87.5C1539.08 -87.5 1440.33 -31 1341.58 -31C1242.82 -31 1144.07 -95.5 1045.31 -95.5C957.392 -95.5 869.469 -29 781.546 -29C666.227 -29.0001 550.908 -92.0001 435.588 -92.0001C380.796 -92.0001 326.003 -36.0449 271.211 -36.0001C222.474 -35.9602 173.737 -35.921 125 -35.8826C39.2621 -37.8641 -37.82 39.3512 -35.7308 125C-35.7308 125 -35.7308 125 -35.7308 125C-37.7129 210.657 39.4292 287.67 125 285.584C606.286 285.231 1087.57 284.909 1568.86 284.5C1627.13 284.45 1685.41 276.447 1743.69 269.138C1745.46 268.916 1747.23 268.694 1749 268.474C1774.79 265.712 1798.96 256.04 1818.85 241.713C1857.25 214.52 1878.44 168.284 1874.5 125L1874 125ZM1874 125L-nan -nanL1874.5 125L1873.5 125L-nan -nanL1874 125Z\" fill=\"black\" mask=\"url(#path-1-inside-1_25_428)\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor03.svg"
  },
  "foundation-9": {
    "id": "foundation-9",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<mask id=\"path-1-inside-1_25_429\" fill=\"white\">\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" stroke=\"white\" stroke-width=\"2\"/>\n</mask>\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n<path d=\"M1874 125C1870.38 168.038 1843.41 206.229 1807.54 222.846C1788.89 231.707 1768.2 234.372 1749 231.526C1747.23 231.306 1745.46 231.084 1743.69 230.862C1685.41 223.553 1627.13 215.55 1568.86 215.5C1087.57 215.091 606.286 214.769 125 214.416C77.4054 215.567 34.4749 172.508 35.7308 125C35.7308 125 35.7308 125 35.7308 125C34.5821 77.4833 77.5725 34.6261 125 35.8824C173.737 35.9209 222.474 35.96 271.211 35.9999C326.003 36.0448 380.796 91.9999 435.588 91.9999C550.907 91.9999 666.227 28.9999 781.546 29C869.469 29 957.392 95.5 1045.31 95.5C1144.07 95.5 1242.82 31 1341.58 31C1440.33 31 1539.08 87.5 1637.84 87.5C1673.12 87.5 1708.4 77.2712 1743.69 64.4917C1745.46 63.8501 1747.23 63.2021 1749 62.5486C1765.82 49.564 1795.81 43.3845 1821.97 57.3603C1845.4 69.5004 1865.28 93.8542 1873.5 125C1873.83 125 1874.17 125 1874.5 125C1883 93.7458 1878.51 56.1155 1859.37 22.6799C1839.04 -13.9209 1800.92 -49.957 1749 -62.5486C1747.23 -63.2021 1745.46 -63.8501 1743.69 -64.4917C1708.4 -77.2712 1673.12 -87.5 1637.84 -87.5C1539.08 -87.5 1440.33 -31 1341.58 -31C1242.82 -31 1144.07 -95.5 1045.31 -95.5C957.392 -95.5 869.469 -29 781.546 -29C666.227 -29.0001 550.908 -92.0001 435.588 -92.0001C380.796 -92.0001 326.003 -36.0449 271.211 -36.0001C222.474 -35.9602 173.737 -35.921 125 -35.8826C39.2621 -37.8641 -37.82 39.3512 -35.7308 125C-35.7308 125 -35.7308 125 -35.7308 125C-37.7129 210.657 39.4292 287.67 125 285.584C606.286 285.231 1087.57 284.909 1568.86 284.5C1627.13 284.45 1685.41 276.447 1743.69 269.138C1745.46 268.916 1747.23 268.694 1749 268.474C1774.79 265.712 1798.96 256.04 1818.85 241.713C1857.25 214.52 1878.44 168.284 1874.5 125L1874 125ZM1874 125L-nan -nanL1874.5 125L1873.5 125L-nan -nanL1874 125Z\" fill=\"black\" mask=\"url(#path-1-inside-1_25_429)\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor02.svg"
  },
  "foundation-10": {
    "id": "foundation-10",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1874\" height=\"250\" viewBox=\"0 0 1874 250\" fill=\"none\">\n<mask id=\"path-1-inside-1_25_430\" fill=\"white\">\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" stroke=\"white\" stroke-width=\"2\"/>\n</mask>\n<path d=\"M1749 -5.46392e-06C1818.04 -2.44628e-06 1874 55.9644 1874 125V125C1874 194.036 1818.04 250 1749 250L125 250C55.9644 250 -8.48157e-06 194.036 -5.46392e-06 125V125C-2.44628e-06 55.9643 55.9644 -7.94689e-05 125 -7.64512e-05L1749 -5.46392e-06Z\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n<path d=\"M1874 125C1870.38 168.038 1843.41 206.229 1807.54 222.846C1788.89 231.707 1768.2 234.372 1749 231.526C1747.23 231.306 1745.46 231.084 1743.69 230.862C1685.41 223.553 1627.13 215.55 1568.86 215.5C1087.57 215.091 606.286 214.769 125 214.416C77.4054 215.567 34.4749 172.508 35.7308 125C35.7308 125 35.7308 125 35.7308 125C34.5821 77.4833 77.5725 34.6261 125 35.8824C173.737 35.9209 222.474 35.96 271.211 35.9999C326.003 36.0448 380.796 91.9999 435.588 91.9999C550.907 91.9999 666.227 28.9999 781.546 29C869.469 29 957.392 95.5 1045.31 95.5C1144.07 95.5 1242.82 31 1341.58 31C1440.33 31 1539.08 87.5 1637.84 87.5C1673.12 87.5 1708.4 77.2712 1743.69 64.4917C1745.46 63.8501 1747.23 63.2021 1749 62.5486C1765.82 49.564 1795.81 43.3845 1821.97 57.3603C1845.4 69.5004 1865.28 93.8542 1873.5 125C1873.83 125 1874.17 125 1874.5 125C1883 93.7458 1878.51 56.1155 1859.37 22.6799C1839.04 -13.9209 1800.92 -49.957 1749 -62.5486C1747.23 -63.2021 1745.46 -63.8501 1743.69 -64.4917C1708.4 -77.2712 1673.12 -87.5 1637.84 -87.5C1539.08 -87.5 1440.33 -31 1341.58 -31C1242.82 -31 1144.07 -95.5 1045.31 -95.5C957.392 -95.5 869.469 -29 781.546 -29C666.227 -29.0001 550.908 -92.0001 435.588 -92.0001C380.796 -92.0001 326.003 -36.0449 271.211 -36.0001C222.474 -35.9602 173.737 -35.921 125 -35.8826C39.2621 -37.8641 -37.82 39.3512 -35.7308 125C-35.7308 125 -35.7308 125 -35.7308 125C-37.7129 210.657 39.4292 287.67 125 285.584C606.286 285.231 1087.57 284.909 1568.86 284.5C1627.13 284.45 1685.41 276.447 1743.69 269.138C1745.46 268.916 1747.23 268.694 1749 268.474C1774.79 265.712 1798.96 256.04 1818.85 241.713C1857.25 214.52 1878.44 168.284 1874.5 125L1874 125ZM1874 125L-nan -nanL1874.5 125L1873.5 125L-nan -nanL1874 125Z\" fill=\"black\" mask=\"url(#path-1-inside-1_25_430)\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "floor01.svg"
  },
  "structure-1": {
    "id": "structure-1",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"1874\" viewBox=\"0 0 250 1874\" fill=\"none\">\n<rect width=\"250\" height=\"1874\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "colunas10.svg"
  },
  "structure-2": {
    "id": "structure-2",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"1874\" viewBox=\"0 0 250 1874\" fill=\"none\">\n<rect width=\"250\" height=\"1874\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "colunas09.svg"
  },
  "structure-3": {
    "id": "structure-3",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"1874\" viewBox=\"0 0 250 1874\" fill=\"none\">\n<rect width=\"250\" height=\"1874\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "colunas08.svg"
  },
  "structure-4": {
    "id": "structure-4",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"1874\" viewBox=\"0 0 250 1874\" fill=\"none\">\n<rect width=\"250\" height=\"1874\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "colunas07.svg"
  },
  "structure-5": {
    "id": "structure-5",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"250\" height=\"1874\" viewBox=\"0 0 250 1874\" fill=\"none\">\n<rect width=\"250\" height=\"1874\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "colunas06.svg"
  },
  "structure-6": {
    "id": "structure-6",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"455\" height=\"1874\" viewBox=\"0 0 455 1874\" fill=\"none\">\n<path d=\"M226.848 2C280.363 2 324.833 43.2496 328.849 96.6143L451.752 1730.1C457.514 1806.68 396.928 1872 320.124 1872H134.008C57.218 1872 -3.36412 1806.71 2.37695 1730.13L124.845 96.6416C128.847 43.2654 173.322 2.00009 226.848 2Z\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "colunas05.svg"
  },
  "structure-7": {
    "id": "structure-7",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"455\" height=\"1874\" viewBox=\"0 0 455 1874\" fill=\"none\">\n<path d=\"M226.848 2C280.363 2 324.833 43.2496 328.849 96.6143L451.752 1730.1C457.514 1806.68 396.928 1872 320.124 1872H134.008C57.218 1872 -3.36412 1806.71 2.37695 1730.13L124.845 96.6416C128.847 43.2654 173.322 2.00009 226.848 2Z\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "colunas04.svg"
  },
  "structure-8": {
    "id": "structure-8",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"455\" height=\"1874\" viewBox=\"0 0 455 1874\" fill=\"none\">\n<path d=\"M226.848 2C280.363 2 324.833 43.2496 328.849 96.6143L451.752 1730.1C457.514 1806.68 396.928 1872 320.124 1872H134.008C57.218 1872 -3.36412 1806.71 2.37695 1730.13L124.845 96.6416C128.847 43.2654 173.322 2.00009 226.848 2Z\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "colunas03.svg"
  },
  "structure-9": {
    "id": "structure-9",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"455\" height=\"1874\" viewBox=\"0 0 455 1874\" fill=\"none\">\n<path d=\"M226.848 2C280.363 2 324.833 43.2496 328.849 96.6143L451.752 1730.1C457.514 1806.68 396.928 1872 320.124 1872H134.008C57.218 1872 -3.36412 1806.71 2.37695 1730.13L124.845 96.6416C128.847 43.2654 173.322 2.00009 226.848 2Z\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "colunas02.svg"
  },
  "structure-10": {
    "id": "structure-10",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"455\" height=\"1874\" viewBox=\"0 0 455 1874\" fill=\"none\">\n<path d=\"M226.848 2C280.363 2 324.833 43.2496 328.849 96.6143L451.752 1730.1C457.514 1806.68 396.928 1872 320.124 1872H134.008C57.218 1872 -3.36412 1806.71 2.37695 1730.13L124.845 96.6416C128.847 43.2654 173.322 2.00009 226.848 2Z\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "colunas01.svg"
  },
  "wall-1": {
    "id": "wall-1",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect width=\"2705\" height=\"1874\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls10.svg"
  },
  "wall-2": {
    "id": "wall-2",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect width=\"2705\" height=\"1874\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls09.svg"
  },
  "wall-3": {
    "id": "wall-3",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect width=\"2705\" height=\"1874\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls08.svg"
  },
  "wall-4": {
    "id": "wall-4",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect width=\"2705\" height=\"1874\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls07.svg"
  },
  "wall-5": {
    "id": "wall-5",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect width=\"2705\" height=\"1874\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls06.svg"
  },
  "wall-6": {
    "id": "wall-6",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" stroke=\"white\" stroke-width=\"4\"/>\n<rect x=\"70\" y=\"183\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"391\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"599\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"807\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1015\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1223\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1431\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1639\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls05.svg"
  },
  "wall-7": {
    "id": "wall-7",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" stroke=\"white\" stroke-width=\"4\"/>\n<rect x=\"70\" y=\"183\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"391\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"599\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"807\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1015\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1223\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1431\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1639\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls04.svg"
  },
  "wall-8": {
    "id": "wall-8",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" stroke=\"white\" stroke-width=\"4\"/>\n<rect x=\"70\" y=\"183\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"391\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"599\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"807\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1015\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1223\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1431\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1639\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls03.svg"
  },
  "wall-9": {
    "id": "wall-9",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" stroke=\"white\" stroke-width=\"4\"/>\n<rect x=\"70\" y=\"183\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"391\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"599\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"807\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1015\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1223\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1431\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1639\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls02.svg"
  },
  "wall-10": {
    "id": "wall-10",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2705\" height=\"1874\" viewBox=\"0 0 2705 1874\" fill=\"none\">\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"2\" y=\"2\" width=\"2701\" height=\"1870\" rx=\"232\" stroke=\"white\" stroke-width=\"4\"/>\n<rect x=\"70\" y=\"183\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"391\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"599\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"807\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1015\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1223\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1431\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n<rect x=\"70\" y=\"1639\" width=\"2565\" height=\"51\" rx=\"25.5\" fill=\"white\" fill-opacity=\"0.05\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "walls01.svg"
  },
  "door-1": {
    "id": "door-1",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<rect width=\"951\" height=\"1526\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "doors10.svg"
  },
  "door-2": {
    "id": "door-2",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<rect width=\"951\" height=\"1526\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "doors09.svg"
  },
  "door-3": {
    "id": "door-3",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<rect width=\"951\" height=\"1526\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "doors08.svg"
  },
  "door-4": {
    "id": "door-4",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<rect width=\"951\" height=\"1526\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "doors07.svg"
  },
  "door-5": {
    "id": "door-5",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<rect width=\"951\" height=\"1526\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "doors06.svg"
  },
  "door-6": {
    "id": "door-6",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<path d=\"M475.5 2C737.007 2 949 213.993 949 475.5V1392C949 1464.9 889.902 1524 817 1524H134C61.0984 1524 2 1464.9 2 1392V475.5C2 213.993 213.993 2 475.5 2Z\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "doors05.svg"
  },
  "door-7": {
    "id": "door-7",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<path d=\"M475.5 2C737.007 2 949 213.993 949 475.5V1392C949 1464.9 889.902 1524 817 1524H134C61.0984 1524 2 1464.9 2 1392V475.5C2 213.993 213.993 2 475.5 2Z\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "doors04.svg"
  },
  "door-8": {
    "id": "door-8",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<path d=\"M475.5 2C737.007 2 949 213.993 949 475.5V1392C949 1464.9 889.902 1524 817 1524H134C61.0984 1524 2 1464.9 2 1392V475.5C2 213.993 213.993 2 475.5 2Z\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "doors03.svg"
  },
  "door-9": {
    "id": "door-9",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<path d=\"M475.5 2C737.007 2 949 213.993 949 475.5V1392C949 1464.9 889.902 1524 817 1524H134C61.0984 1524 2 1464.9 2 1392V475.5C2 213.993 213.993 2 475.5 2Z\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "doors02.svg"
  },
  "door-10": {
    "id": "door-10",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"1526\" viewBox=\"0 0 951 1526\" fill=\"none\">\n<path d=\"M475.5 2C737.007 2 949 213.993 949 475.5V1392C949 1464.9 889.902 1524 817 1524H134C61.0984 1524 2 1464.9 2 1392V475.5C2 213.993 213.993 2 475.5 2Z\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "doors01.svg"
  },
  "window-1": {
    "id": "window-1",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"762\" height=\"762\" viewBox=\"0 0 762 762\" fill=\"none\">\n<circle cx=\"380.8\" cy=\"380.8\" r=\"380.8\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "windows10.svg"
  },
  "window-2": {
    "id": "window-2",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"762\" height=\"762\" viewBox=\"0 0 762 762\" fill=\"none\">\n<circle cx=\"380.8\" cy=\"380.8\" r=\"380.8\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "windows09.svg"
  },
  "window-3": {
    "id": "window-3",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"762\" height=\"762\" viewBox=\"0 0 762 762\" fill=\"none\">\n<circle cx=\"380.8\" cy=\"380.8\" r=\"380.8\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "windows08.svg"
  },
  "window-4": {
    "id": "window-4",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"762\" height=\"762\" viewBox=\"0 0 762 762\" fill=\"none\">\n<circle cx=\"380.8\" cy=\"380.8\" r=\"380.8\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "windows07.svg"
  },
  "window-5": {
    "id": "window-5",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"762\" height=\"762\" viewBox=\"0 0 762 762\" fill=\"none\">\n<circle cx=\"380.8\" cy=\"380.8\" r=\"380.8\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "windows06.svg"
  },
  "window-6": {
    "id": "window-6",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"772\" viewBox=\"0 0 951 772\" fill=\"none\">\n<path d=\"M400 2H551C770.809 2 949 180.191 949 400V572C949 681.352 860.352 770 751 770H200C90.6476 770 2 681.352 2 572V400C2 181.049 178.801 3.39255 397.426 2.00781L400 2Z\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "windows05.svg"
  },
  "window-7": {
    "id": "window-7",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"772\" viewBox=\"0 0 951 772\" fill=\"none\">\n<path d=\"M400 2H551C770.809 2 949 180.191 949 400V572C949 681.352 860.352 770 751 770H200C90.6476 770 2 681.352 2 572V400C2 181.049 178.801 3.39255 397.426 2.00781L400 2Z\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "windows04.svg"
  },
  "window-8": {
    "id": "window-8",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"772\" viewBox=\"0 0 951 772\" fill=\"none\">\n<path d=\"M400 2H551C770.809 2 949 180.191 949 400V572C949 681.352 860.352 770 751 770H200C90.6476 770 2 681.352 2 572V400C2 181.049 178.801 3.39255 397.426 2.00781L400 2Z\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "windows03.svg"
  },
  "window-9": {
    "id": "window-9",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"772\" viewBox=\"0 0 951 772\" fill=\"none\">\n<path d=\"M400 2H551C770.809 2 949 180.191 949 400V572C949 681.352 860.352 770 751 770H200C90.6476 770 2 681.352 2 572V400C2 181.049 178.801 3.39255 397.426 2.00781L400 2Z\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "windows02.svg"
  },
  "window-10": {
    "id": "window-10",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"951\" height=\"772\" viewBox=\"0 0 951 772\" fill=\"none\">\n<path d=\"M400 2H551C770.809 2 949 180.191 949 400V572C949 681.352 860.352 770 751 770H200C90.6476 770 2 681.352 2 572V400C2 181.049 178.801 3.39255 397.426 2.00781L400 2Z\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "windows01.svg"
  },
  "roof-1": {
    "id": "roof-1",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2863\" height=\"1288\" viewBox=\"0 0 2863 1288\" fill=\"none\">\n<path d=\"M1431.11 0L2862.21 1287.75H0L1431.11 0Z\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "roof10.svg"
  },
  "roof-2": {
    "id": "roof-2",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2863\" height=\"1288\" viewBox=\"0 0 2863 1288\" fill=\"none\">\n<path d=\"M1431.11 0L2862.21 1287.75H0L1431.11 0Z\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "roof09.svg"
  },
  "roof-3": {
    "id": "roof-3",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2863\" height=\"1288\" viewBox=\"0 0 2863 1288\" fill=\"none\">\n<path d=\"M1431.11 0L2862.21 1287.75H0L1431.11 0Z\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "roof08.svg"
  },
  "roof-4": {
    "id": "roof-4",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2863\" height=\"1288\" viewBox=\"0 0 2863 1288\" fill=\"none\">\n<path d=\"M1431.11 0L2862.21 1287.75H0L1431.11 0Z\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "roof07.svg"
  },
  "roof-5": {
    "id": "roof-5",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2863\" height=\"1288\" viewBox=\"0 0 2863 1288\" fill=\"none\">\n<path d=\"M1431.11 0L2862.21 1287.75H0L1431.11 0Z\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"2\"/>\n</svg>",
    "name": "roof06.svg"
  },
  "roof-6": {
    "id": "roof-6",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2193\" height=\"531\" viewBox=\"0 0 2193 531\" fill=\"none\">\n<path d=\"M1075.25 6.52637C1091.52 0.465526 1109.44 0.49001 1125.69 6.5957L2143.42 388.84C2218.44 417.016 2198.24 528.242 2118.1 528.242H74.0811C-6.1675 528.242 -26.2513 416.78 48.9502 388.771L1075.25 6.52637Z\" fill=\"#3E4E5B\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "roof05.svg"
  },
  "roof-7": {
    "id": "roof-7",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2193\" height=\"531\" viewBox=\"0 0 2193 531\" fill=\"none\">\n<path d=\"M1075.25 6.52637C1091.52 0.465526 1109.44 0.49001 1125.69 6.5957L2143.42 388.84C2218.44 417.016 2198.24 528.242 2118.1 528.242H74.0811C-6.1675 528.242 -26.2513 416.78 48.9502 388.771L1075.25 6.52637Z\" fill=\"#526B79\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "roof04.svg"
  },
  "roof-8": {
    "id": "roof-8",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2193\" height=\"531\" viewBox=\"0 0 2193 531\" fill=\"none\">\n<path d=\"M1075.25 6.52637C1091.52 0.465526 1109.44 0.49001 1125.69 6.5957L2143.42 388.84C2218.44 417.016 2198.24 528.242 2118.1 528.242H74.0811C-6.1675 528.242 -26.2513 416.78 48.9502 388.771L1075.25 6.52637Z\" fill=\"#7F9BA7\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "roof03.svg"
  },
  "roof-9": {
    "id": "roof-9",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2193\" height=\"531\" viewBox=\"0 0 2193 531\" fill=\"none\">\n<path d=\"M1075.25 6.52637C1091.52 0.465526 1109.44 0.49001 1125.69 6.5957L2143.42 388.84C2218.44 417.016 2198.24 528.242 2118.1 528.242H74.0811C-6.1675 528.242 -26.2513 416.78 48.9502 388.771L1075.25 6.52637Z\" fill=\"#CDBEA8\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "roof02.svg"
  },
  "roof-10": {
    "id": "roof-10",
    "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"2193\" height=\"531\" viewBox=\"0 0 2193 531\" fill=\"none\">\n<path d=\"M1075.25 6.52637C1091.52 0.465526 1109.44 0.49001 1125.69 6.5957L2143.42 388.84C2218.44 417.016 2198.24 528.242 2118.1 528.242H74.0811C-6.1675 528.242 -26.2513 416.78 48.9502 388.771L1075.25 6.52637Z\" fill=\"#DE7962\" stroke=\"white\" stroke-width=\"4\"/>\n</svg>",
    "name": "roof01.svg"
  }
};

/**
 * Retorna um elemento customizado pelo ID
 */
export function getCustomElement(elementId: string): CustomElement | null {
  return customElements[elementId] || null;
}

/**
 * Verifica se existe um elemento customizado para o ID fornecido
 */
export function hasCustomElement(elementId: string): boolean {
  return !!customElements[elementId];
}

/**
 * Retorna todos os IDs dos elementos customizados
 */
export function getAllCustomElementIds(): string[] {
  return Object.keys(customElements);
}

/**
 * Retorna estatísticas dos elementos customizados
 */
export function getCustomElementsStats() {
  const total = Object.keys(customElements).length;
  
  const byCategory: Record<string, number> = {
    foundation: 0,
    structure: 0,
    wall: 0,
    door: 0,
    window: 0,
    roof: 0
  };
  
  Object.keys(customElements).forEach(id => {
    if (id.startsWith('foundation-')) byCategory.foundation++;
    else if (id.startsWith('structure-')) byCategory.structure++;
    else if (id.startsWith('wall-')) byCategory.wall++;
    else if (id.startsWith('door-')) byCategory.door++;
    else if (id.startsWith('window-')) byCategory.window++;
    else if (id.startsWith('roof-')) byCategory.roof++;
  });
  
  return { total, byCategory };
}
