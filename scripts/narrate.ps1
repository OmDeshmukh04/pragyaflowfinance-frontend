param([switch]$ListVoices)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$narrator = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $availableVoices = $narrator.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo.Name }
    if ($ListVoices) { $availableVoices; return }
    $taskRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
    $audioPath = Join-Path $taskRoot 'artifacts/narration'
    New-Item -ItemType Directory -Path $audioPath -Force | Out-Null
    $narrator.Rate = 0
    $narrator.Volume = 100
    if ($availableVoices -contains 'Microsoft Zira Desktop') { $narrator.SelectVoice('Microsoft Zira Desktop') }
    $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
    $scenes = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'walkthrough.json') -Raw | ConvertFrom-Json
    foreach ($scene in $scenes) {
        $target = Join-Path $audioPath ($scene.id + '.wav')
        $narrator.SetOutputToWaveFile($target, $format)
        $narrator.Speak($scene.narration)
        $narrator.SetOutputToNull()
        Write-Output ('Narrated ' + $scene.id)
    }
    Write-Output ('Voice: ' + $narrator.Voice.Name + '; rate: 0 (normal)')
} finally { $narrator.Dispose() }
