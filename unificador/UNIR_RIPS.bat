setlocal enableextensions enabledelayedexpansion

for %%f in (*.zip) do (
	"C:\Program Files\7-Zip\7z" e  "%%f" -aou
) 
 endlocal

setlocal enableextensions enabledelayedexpansion
del "AC.txt"
SET /A COUNT=1
for %%f in (AC*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AC.txt
 )
 type %%f >> AC.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
 endlocal
 
setlocal enableextensions enabledelayedexpansion
del "AD.txt"
SET /A COUNT=1
for %%f in (AD*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AD.txt
 )
 type %%f >> AD.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 
 
setlocal enableextensions enabledelayedexpansion
del "AF.txt"
SET /A COUNT=1
for %%f in (AF*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AF.txt
 )
 type %%f >> AF.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 

setlocal enableextensions enabledelayedexpansion
del "AH.txt"
SET /A COUNT=1
for %%f in (AH*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AH.txt
 )
 type %%f >> AH.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 
 
setlocal enableextensions enabledelayedexpansion
del "AM.txt"
SET /A COUNT=1
for %%f in (AM*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AM.txt
 )
 type %%f >> AM.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 

setlocal enableextensions enabledelayedexpansion
del "AP.txt"
SET /A COUNT=1
for %%f in (AP*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AP.txt
 )
 type %%f >> AP.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal  

setlocal enableextensions enabledelayedexpansion
del "AT.txt"
SET /A COUNT=1
for %%f in (AT*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AT.txt
 )
 type %%f >> AT.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 

setlocal enableextensions enabledelayedexpansion
del "AU.txt"
SET /A COUNT=1
for %%f in (AU*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AU.txt
 )
 type %%f >> AU.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 

setlocal enableextensions enabledelayedexpansion
del "US.txt"
SET /A COUNT=1
for %%f in (US*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> US.txt
 )
 type %%f >> US.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 

setlocal enableextensions enabledelayedexpansion
del "CT.txt"
SET /A COUNT=1
for %%f in (CT*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> CT.txt
 )
 type %%f >> CT.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 

setlocal enableextensions enabledelayedexpansion
del "AN.txt"
SET /A COUNT=1
for %%f in (AN*.txt) do (
 if !COUNT! == 2 (
  type newline.txt.txt >> AN.txt
 )
 type %%f >> AN.txt 
 SET /A COUNT=2
 ECHO !COUNT!
 del "%%f") 
endlocal 
 