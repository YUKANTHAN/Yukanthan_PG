$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = 'c:\\Portfolio\\portfolio-website-main\\white-travels-article.docx'
$doc = $word.Documents.Open($docPath, $false, $true)
$pages = $doc.ComputeStatistics(2)  # wdStatisticPages = 2
Write-Output "Page count: $pages"
$doc.Close([ref]0)
$word.Quit()