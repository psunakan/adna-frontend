# Creates SVG logo-style badges for each collaborator and saves them to Pictures/logos/

$baseDir = "Pictures\logos"
New-Item -ItemType Directory -Force -Path $baseDir | Out-Null

$svgs = @{
    "logo_jhpiego.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="60" viewBox="0 0 160 60">
  <text x="8" y="34" font-family="Arial" font-weight="900" font-size="36" fill="#007baa" letter-spacing="-1">ji</text>
  <text x="8" y="52" font-family="Arial" font-weight="700" font-size="13" fill="#333">jhpiego</text>
  <text x="8" y="60" font-family="Arial" font-size="7" fill="#888">Johns Hopkins University Affiliate</text>
</svg>
'@
    "logo_worldcea.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60" viewBox="0 0 220 60">
  <circle cx="24" cy="30" r="20" fill="none" stroke="#2d6a4f" stroke-width="3"/>
  <text x="50" y="26" font-family="Arial" font-weight="700" font-size="13" fill="#2d6a4f">The World Continuing</text>
  <text x="50" y="44" font-family="Arial" font-weight="700" font-size="13" fill="#2d6a4f">Education Alliance</text>
</svg>
'@
    "logo_trumerit.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <text x="4" y="38" font-family="Arial" font-weight="900" font-size="28" fill="#007baa">TruMerit</text>
  <line x1="140" y1="10" x2="140" y2="50" stroke="#ccc" stroke-width="1.5"/>
  <text x="148" y="26" font-family="Arial" font-weight="700" font-size="12" fill="#003f7d">CGFNS</text>
  <text x="148" y="40" font-family="Arial" font-size="9" fill="#003f7d">INTERNATIONAL</text>
</svg>
'@
    "logo_care.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="70" viewBox="0 0 120 70">
  <circle cx="50" cy="28" r="22" fill="#f48024" opacity="0.15"/>
  <text x="8" y="38" font-family="Arial" font-weight="900" font-size="38" fill="#f48024" letter-spacing="1">care</text>
  <circle cx="103" cy="38" r="5" fill="none" stroke="#f48024" stroke-width="2"/>
</svg>
'@
    "logo_gnauk.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <circle cx="28" cy="30" r="24" fill="#d4a017" stroke="#2d6a4f" stroke-width="2.5"/>
  <text x="60" y="25" font-family="Arial" font-weight="700" font-size="12" fill="#2d6a4f">Ghana Nurses</text>
  <text x="60" y="40" font-family="Arial" font-weight="700" font-size="12" fill="#2d6a4f">Association UK</text>
</svg>
'@
    "logo_icn.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="65" viewBox="0 0 200 65">
  <text x="4" y="36" font-family="Arial" font-weight="900" font-size="32" fill="#007baa">ICN</text>
  <text x="4" y="50" font-family="Arial" font-weight="700" font-size="11" fill="#333">International Council</text>
  <text x="4" y="62" font-family="Arial" font-size="10" fill="#f08000" font-style="italic">of Nurses</text>
</svg>
'@
    "logo_daisy.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="65" viewBox="0 0 200 65">
  <rect x="2" y="2" width="196" height="61" rx="6" fill="#4a7c2f" stroke="#4a7c2f" stroke-width="1"/>
  <text x="10" y="24" font-family="Arial" font-weight="900" font-size="16" fill="white">The DAISY Award</text>
  <text x="10" y="40" font-family="Arial" font-size="9" fill="#ffe" letter-spacing="0.5">FOR EXTRAORDINARY NURSES</text>
  <text x="10" y="54" font-family="Arial" font-size="7.5" fill="#cfc">HONORING NURSES INTERNATIONALLY</text>
</svg>
'@
    "logo_healthcarousel.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <circle cx="26" cy="30" r="20" fill="none" stroke="#003f7d" stroke-width="2.5"/>
  <text x="52" y="28" font-family="Arial" font-weight="700" font-size="13" fill="#003f7d">Health Carousel</text>
  <text x="52" y="44" font-family="Arial" font-weight="700" font-size="11" fill="#003f7d" letter-spacing="2">FOUNDATION</text>
</svg>
'@
    "logo_gates.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="50" viewBox="0 0 220 50">
  <text x="4" y="36" font-family="Georgia,serif" font-weight="700" font-size="28" fill="#111">Gates Foundation</text>
</svg>
'@
    "logo_jhcgi.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="65" viewBox="0 0 160 65">
  <rect x="2" y="2" width="156" height="61" rx="4" fill="#003f7d"/>
  <text x="10" y="22" font-family="Arial" font-weight="700" font-size="9" fill="white" letter-spacing="0.5">JOHNS HOPKINS</text>
  <text x="10" y="34" font-family="Arial" font-size="8" fill="#ccd" letter-spacing="0.3">SCHOOL OF NURSING</text>
  <text x="10" y="48" font-family="Arial" font-weight="700" font-size="8" fill="white">THE CENTER FOR</text>
  <text x="10" y="59" font-family="Arial" font-weight="700" font-size="8" fill="white">GLOBAL INITIATIVES</text>
</svg>
'@
    "logo_dnpsofcolor.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="65" viewBox="0 0 220 65">
  <text x="4" y="42" font-family="Arial" font-weight="900" font-size="42" fill="#007baa" letter-spacing="-1">DOC</text>
  <text x="68" y="30" font-family="Arial" font-weight="700" font-size="13" fill="#333">DNPs of Color</text>
  <text x="68" y="46" font-family="Arial" font-size="9" fill="#666">Connecting through Diversity</text>
</svg>
'@
    "logo_medtronic.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="190" height="55" viewBox="0 0 190 55">
  <text x="4" y="38" font-family="Arial" font-weight="900" font-size="30" fill="#d4002b">Medtronic</text>
  <text x="4" y="52" font-family="Arial" font-size="9" fill="#555">Engineering the extraordinary</text>
</svg>
'@
    "logo_genentech.svg" = @'
<svg xmlns="http://www.w3.org/2000/svg" width="190" height="55" viewBox="0 0 190 55">
  <text x="4" y="38" font-family="Arial" font-weight="900" font-size="30" fill="#0074d9">Genentech</text>
  <text x="4" y="52" font-family="Arial" font-size="9" fill="#555">A Member of the Roche Group</text>
</svg>
'@
}

foreach ($key in $svgs.Keys) {
    $dest = Join-Path $baseDir $key
    $svgs[$key] | Out-File -FilePath $dest -Encoding utf8
    Write-Host "Created: $key"
}

Write-Host "All SVG logos generated."
