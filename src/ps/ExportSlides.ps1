param (
    [String]$PresentationPath
)

Add-Type -AssemblyName Office
Add-Type -AssemblyName Microsoft.Office.Interop.PowerPoint

# Create a new instance of PowerPoint application
$pptApplication = New-Object -ComObject PowerPoint.Application
$presentations = $pptApplication.Presentations
$originalPresentation = $presentations.Open($PresentationPath, $false)

$tempPresentationFileName = "temp_" + [Guid]::NewGuid().ToString() + ".pptx"
$tempPresentationPath = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), $tempPresentationFileName)

$tempOutputVideoFileName = "temp_" + [Guid]::NewGuid().ToString() + "_slide_{0}.mp4"
$outputVideoPathTemplate = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), $tempOutputVideoFileName)

$results = @()
$errors = @()

try {
    for ($i = 1; $i -le $originalPresentation.Slides.Count; $i++) {
        $originalPresentation.SaveCopyAs($tempPresentationPath)
        $tempPresentation = $presentations.Open($tempPresentationPath, $true)

        for ($j = $tempPresentation.Slides.Count; $j -gt 0; $j--) {
            if ($j -ne $i) {
                $tempPresentation.Slides.Item($j).Delete()
            }
        }

        $outputVideoPath = $outputVideoPathTemplate -f $i
        $tempPresentation.CreateVideo($outputVideoPath)

        Start-Sleep -Seconds 2

        try {
            while ($tempPresentation.CreateVideoStatus -eq [Microsoft.Office.Interop.PowerPoint.PpMediaTaskStatus]::ppMediaTaskStatusInProgress -or
                $tempPresentation.CreateVideoStatus -eq [Microsoft.Office.Interop.PowerPoint.PpMediaTaskStatus]::ppMediaTaskStatusQueued) {
                Start-Sleep -Seconds 0.5
            }
            $resultObject = [PSCustomObject]@{
                slide    = $i
                filepath = $outputVideoPath
            }
            $results += $resultObject
        }
        catch {
            $errorObject = [PSCustomObject]@{
                slide = $i
                error = $_.Exception.Message
            }
            $errors += $errorObject
        }
        
        $tempPresentation.Close()
    }
}
catch {
    $errorObject = [PSCustomObject]@{
        error = $_.Exception.Message
    }
    $errors += $errorObject
}
finally {
    Remove-Item $tempPresentationPath -ErrorAction SilentlyContinue
    $originalPresentation.Close()
    $pptApplication.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($tempPresentation) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($originalPresentation) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentations) | Out-Null
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApplication) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
    $jsonOutput = [PSCustomObject]@{
        success = $results
        errors  = $errors
    } | ConvertTo-Json -Depth 5
    Write-Output $jsonOutput
}
