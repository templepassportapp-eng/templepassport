@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0") ELSE (SET "BASE_DIR=%%~dp%__MVNW_ARG0_NAME__%")

@SET "MAVEN_PROJECTBASEDIR=%BASE_DIR%"
@SET "WRAPPER_PROPERTIES=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"
@SET "WRAPPER_JAR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET "WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain"

@SET WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%WRAPPER_PROPERTIES%") DO (
    IF "%%A"=="wrapperUrl" SET WRAPPER_URL=%%B
)

@IF NOT EXIST "%WRAPPER_JAR%" (
    IF NOT "%MVNW_REPOURL%"=="" SET WRAPPER_URL="%MVNW_REPOURL%/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
    @echo Downloading %WRAPPER_URL%
    powershell -Command "&{"^
      "$webclient = new-object System.Net.WebClient;"^
      "if ($env:MVNW_USERNAME -and $env:MVNW_PASSWORD) {"^
      "$webclient.Credentials = new-object System.Net.NetworkCredential($env:MVNW_USERNAME, $env:MVNW_PASSWORD);"^
      "}"^
      "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;"^
      "$webclient.DownloadFile('%WRAPPER_URL%', '%WRAPPER_JAR%')"^
      "}"
    IF "%ERRORLEVEL%"=="0" GOTO :downloaded
    DEL "%WRAPPER_JAR%" 2> nul
    @echo ERROR: Could not download %WRAPPER_URL%
    EXIT /B 1
    :downloaded
)

@IF "%JAVA_HOME%"=="" (
    @REM Try to find Java in common locations
    IF EXIST "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot\bin\java.exe" (
        SET "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
    ) ELSE IF EXIST "C:\Program Files\Eclipse Adoptium\jdk-21*\bin\java.exe" (
        FOR /D %%i IN ("C:\Program Files\Eclipse Adoptium\jdk-21*") DO SET "JAVA_HOME=%%i"
    )
)

@SET "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
@IF NOT EXIST "%JAVA_CMD%" SET "JAVA_CMD=java"

@SET "MAVEN_OPTS=%MAVEN_OPTS% -Xmx512m"

"%JAVA_CMD%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" %WRAPPER_LAUNCHER% %*
