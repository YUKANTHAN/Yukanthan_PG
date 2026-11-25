$word = New-Object -ComObject Word.Application
$word.Visible = $false

# Paths
$mdPath = 'c:\\Portfolio\\portfolio-website-main\\white-travels-article.md'
# Use a new output filename to avoid file‑in‑use errors
$outputPath = 'c:\\Portfolio\\portfolio-website-main\\white-travels-article-formatted.docx'

# Remove any existing output file (ignore errors if locked)
if (Test-Path $outputPath) { Remove-Item $outputPath -Force -ErrorAction SilentlyContinue }


# Create a new Word document (A4)
$doc = $word.Documents.Add()
$doc.PageSetup.PaperSize = 9  # wdPaperA4
$doc.PageSetup.PageWidth = $word.InchesToPoints(8.27)
$doc.PageSetup.PageHeight = $word.InchesToPoints(11.69)

# Global defaults (will be overridden per paragraph as needed)
$doc.Content.Font.Name = 'Times New Roman'
$doc.Content.Font.Size = 12
$doc.Content.ParagraphFormat.LineSpacingRule = 0   # wdLineSpaceSingle
$doc.Content.ParagraphFormat.SpaceAfter = 0
$doc.Content.ParagraphFormat.SpaceBefore = 0
$doc.Content.ParagraphFormat.Alignment = 3   # wdAlignParagraphJustify

# Insert raw markdown text
$selection = $word.Selection
$md = Get-Content -Path $mdPath -Raw
$selection.TypeText($md)

# Apply formatting per paragraph
foreach ($p in $doc.Paragraphs) {
    $txt = $p.Range.Text.TrimEnd([char]13)  # strip paragraph mark
    if ($txt -match '^#\s+(.*)') {
        # Title – larger font, bold, centered
        $p.Range.Text = $Matches[1] + "`r"
        $p.Range.Style = $doc.Styles.Item('Title')
        $p.Range.Font.Size = 16
        $p.Range.Font.Bold = $true
        $p.Range.ParagraphFormat.Alignment = 1   # wdAlignParagraphCenter
    } elseif ($txt -match '^##\s+(.*)') {
        $p.Range.Text = $Matches[1] + "`r"
        $p.Range.Style = $doc.Styles.Item('Heading 2')
        $p.Range.Font.Size = 14
        $p.Range.Font.Bold = $true
        $p.Range.ParagraphFormat.Alignment = 0   # left
    } elseif ($txt -match '^###\s+(.*)') {
        $p.Range.Text = $Matches[1] + "`r"
        $p.Range.Style = $doc.Styles.Item('Heading 3')
        $p.Range.Font.Size = 13
        $p.Range.Font.Bold = $true
        $p.Range.ParagraphFormat.Alignment = 0
    } else {
        # Normal body text
        $p.Range.Style = $doc.Styles.Item('Normal')
        $p.Range.Font.Size = 12
        $p.Range.Font.Bold = $false
        $p.Range.ParagraphFormat.Alignment = 3   # justify
    }
    # Ensure single line spacing for every paragraph
    $p.Range.ParagraphFormat.LineSpacingRule = 0
    $p.Range.ParagraphFormat.SpaceAfter = 0
    $p.Range.ParagraphFormat.SpaceBefore = 0
}

# Save and close
$doc.SaveAs([ref]$outputPath, [ref]16)
$doc.Close()
$word.Quit()
Write-Output "DOCX created at $outputPath"
