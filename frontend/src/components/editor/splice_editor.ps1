$editorPath = "c:\Users\User\Desktop\attestation\frontend\src\components\editor\Editor.tsx"
$newContentPath = "c:\Users\User\Desktop\attestation\frontend\src\components\editor\temp_render_content.tsx"

$editorLines = Get-Content $editorPath
$newContent = Get-Content $newContentPath

# Indices check:
# Line 3851 is "return (". Index 3850.
# We want to keep everything before it. 0 to 3849.
$topPart = $editorLines[0..3849]

# Line 4264 is "});". Index 4263.
# We want to keep it and everything after.
$bottomPart = $editorLines[4263..($editorLines.Count - 1)]

$allContent = @()
$allContent += $topPart
$allContent += $newContent
$allContent += $bottomPart

$allContent | Set-Content $editorPath -Encoding UTF8
Write-Host "Spliced Editor.tsx successfully."
