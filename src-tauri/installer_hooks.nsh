!macro NSIS_HOOK_POSTINSTALL
  ; Register Application for Open With and Default Programs
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe" "FriendlyAppName" "NovidPlayer"
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\DefaultIcon" "" "$INSTDIR\NovidPlayer.exe,0"
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\shell\open\command" "" '"$INSTDIR\NovidPlayer.exe" "%1"'

  ; Register Supported Video and Audio Types in Open With
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".mp4" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".mkv" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".avi" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".mov" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".wmv" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".flv" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".webm" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".m4v" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".ts" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".m2ts" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".rmvb" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".3gp" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".vob" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".ogv" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".mpg" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".mpeg" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".mp3" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".flac" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".wav" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".aac" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".ogg" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".m4a" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".wma" ""
  WriteRegStr HKCU "Software\Classes\Applications\NovidPlayer.exe\SupportedTypes" ".opus" ""

  ; SystemFileAssociations for Video and Audio quick context menu
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\video\OpenWithList\NovidPlayer.exe" "" ""
  WriteRegStr HKCU "Software\Classes\SystemFileAssociations\audio\OpenWithList\NovidPlayer.exe" "" ""

  ; Windows Default Programs Capabilities Registration
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities" "ApplicationDescription" "Modern Minimalist MPV Video Player for Windows 11"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities" "ApplicationName" "NovidPlayer"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".mp4" "NovidPlayer.mp4"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".mkv" "NovidPlayer.mkv"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".avi" "NovidPlayer.avi"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".mov" "NovidPlayer.mov"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".wmv" "NovidPlayer.wmv"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".flv" "NovidPlayer.flv"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".webm" "NovidPlayer.webm"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".m4v" "NovidPlayer.m4v"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".ts" "NovidPlayer.ts"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".m2ts" "NovidPlayer.m2ts"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".rmvb" "NovidPlayer.rmvb"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".mp3" "NovidPlayer.mp3"
  WriteRegStr HKCU "Software\NovidPlayer\Capabilities\FileAssociations" ".flac" "NovidPlayer.flac"
  WriteRegStr HKCU "Software\RegisteredApplications" "NovidPlayer" "Software\NovidPlayer\Capabilities"

  ; Notify Windows Shell that file associations have changed
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0x0000, i 0, i 0)'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Remove Applications registration
  DeleteRegKey HKCU "Software\Classes\Applications\NovidPlayer.exe"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\video\OpenWithList\NovidPlayer.exe"
  DeleteRegKey HKCU "Software\Classes\SystemFileAssociations\audio\OpenWithList\NovidPlayer.exe"
  DeleteRegValue HKCU "Software\RegisteredApplications" "NovidPlayer"
  DeleteRegKey HKCU "Software\NovidPlayer"

  ; Notify Windows Shell
  System::Call 'shell32.dll::SHChangeNotify(i 0x08000000, i 0x0000, i 0, i 0)'
!macroend
