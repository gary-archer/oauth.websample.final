<#
 # A script to create certificates for SSL testing
 #>

$openSslPath = 'C:\tools\openssl\bin64\openssl.exe'
$env:OPENSSL_CONF = 'C:\tools\openssl\ssl\openssl.cnf'
 
$rootCertDescription = 'My Company Root Certification Authority'
$rootCertDomainName = 'mycompany.ca'
$rootCertPassword = 'RootPassw0rd1'
 
$sslCertFileName = 'mycompany.ssl'
$sslCertPassword = 'SslPassword1'
$wildcardDomainName = '*.mycompany.com'
$apiDomainName = 'api.mycompany.com'
$webDomainName = 'web.mycompany.com'

<#
 # A general run process function
 #>
function RunOpenSslCommand($openSslArgs)
{
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $openSslPath
    $info.Arguments = $openSslArgs
    $info.UseShellExecute = $false
    $info.WorkingDirectory = (Get-Location)
    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $info
    $p.Start() | Out-Null
    $p.WaitForExit()
    if($p.ExitCode -ne 0) 
    {
	    throw "Error $($p.ExitCode) running SSL command"
    }
}
  
<#
 # Create the root cert key
 #>
function CreateRootCertPrivateKey()
{
    $args = "genrsa -out ${rootCertDomainName}.key 2048 -passout pass:${rootCertPassword}"
    RunOpenSslCommand $args
}

<#
 # Create the root cert CRT file which users will import
 #>
 function CreateRootCertPublicKeyCertificate()
 {
	 $args = "req -x509 -new -nodes -key ${rootCertDomainName}.key -out ${rootCertDomainName}.crt"
	 $args += " -subj `"/CN=${rootCertDescription}`" -reqexts v3_req -extensions v3_ca -sha256 -days 3650"
	 RunOpenSslCommand $args
 }

<#
 # Create the SSL certificate key file
 #>
function CreateSslCertificateKey()
{
	$args = "genrsa -out ${sslCertFileName}.key 2048 -passout pass:${sslCertPassword}"
	RunOpenSslCommand $args
}

<#
 # Create the SSL certificate signing request
 #>
function CreateSslCertificateSigningRequest()
{
	$args = "req -new -key ${sslCertFileName}.key -out ${sslCertFileName}.csr -subj /CN=${wildcardDomainName}"
	RunOpenSslCommand $args
}
  
<#
 # Create the SSL certificate
 #>
 function CreateSslCertificate()
 {
	$args = "x509 -req -in ${sslCertFileName}.csr -CA ${rootCertDomainName}.crt -CAkey ${rootCertDomainName}.key -CAcreateserial"
	$args += " -out ${sslCertFileName}.crt -sha256 -days 3650 -extfile extended/server.ext"
	RunOpenSslCommand $args
}

<#
 # Create the SSL PFX file, containing both the certificate and private key
 #>
function CreateSslPfxFile()
{
	$args = "pkcs12 -export -inkey ${sslCertFileName}.key -in ${sslCertFileName}.crt -name ${wildcardDomainName}"
	$args += " -out ${sslCertFileName}.pfx -passout pass:${sslCertPassword}"
	RunOpenSslCommand $args
}
 
<#
 # Execute the commands
 #>
try
{
    CreateRootCertPrivateKey
	Write-Host -ForegroundColor Green "Created root certificate private key file"
  
	CreateRootCertPublicKeyCertificate
	Write-Host -ForegroundColor Green "Created root certificate CRT file"

	CreateSslCertificateKey
	Write-Host -ForegroundColor Green "Created SSL certificate key file"

	CreateSslCertificateSigningRequest
	Write-Host -ForegroundColor Green "Created SSL certificate signing request"

	CreateSslCertificate
	Write-Host -ForegroundColor Green "Created SSL certificate file"

	CreateSslPfxFile
	Write-Host -ForegroundColor Green "Created SSL certificate PFX file"
}
catch
{
    # Report failures
	Write-Host -ForegroundColor Red $_.Exception
}
