$user = "K902093"
$pass = "Vinodh@5284456"
$cred = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${user}:${pass}"))

function TestSoap($url, $fm, $soapAction) {
  $body = "<soapenv:Envelope xmlns:soapenv=`"http://schemas.xmlsoap.org/soap/envelope/`" xmlns:urn=`"urn:sap-com:document:sap:rfc:functions`"><soapenv:Header/><soapenv:Body><urn:$fm><P_CUST_ID>1002</P_CUST_ID></urn:$fm></soapenv:Body></soapenv:Envelope>"
  try {
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Method = "POST"
    $req.ContentType = "text/xml;charset=UTF-8"
    $req.Headers.Add("Authorization", "Basic $cred")
    if ($soapAction) { $req.Headers.Add("SOAPAction", $soapAction) }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $req.ContentLength = $bytes.Length
    $req.GetRequestStream().Write($bytes, 0, $bytes.Length)
    $resp = $req.GetResponse()
    $content = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    return "200 OK: $($content.Substring(0, [Math]::Min(600, $content.Length)))"
  } catch [System.Net.WebException] {
    $errResp = $_.Exception.Response
    if ($errResp) {
      $content = (New-Object System.IO.StreamReader($errResp.GetResponseStream())).ReadToEnd()
      return "500"
    }
    return "ERR"
  }
}

Write-Host "=== Testing SOAPAction variations on SALES ===" -ForegroundColor Cyan
$salesUrl = "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_sales_srv_0093?sap-client=100"
$fm = "ZFM_SD_SALES_0093"

$soapActions = @(
  "",
  '""',
  "urn:sap-com:document:sap:rfc:functions",
  "urn:sap-com:document:sap:rfc:functions:ZFM_SD_SALES_0093",
  "urn:sap-com:document:sap:rfc:functions:ZFM_SD_SALES_0093:ZFM_SD_SALES_0093",
  "ZFM_SD_SALES_0093",
  "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_sales_srv_0093"
)

foreach ($sa in $soapActions) {
  $r = TestSoap $salesUrl $fm $sa
  $label = if ($sa -eq "") { "(no SOAPAction)" } else { $sa }
  if ($r -like "200*") {
    Write-Host "  SUCCESS [$label]: $r" -ForegroundColor Green
  } else {
    Write-Host "  FAIL    [$label]" -ForegroundColor Red
  }
}

# Also test without SOAPAction but different FM names
Write-Host "`n=== Testing inquiry URL ===" -ForegroundColor Cyan
$inquiryUrl = "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_inquiry_srv_0093?sap-client=100"
foreach ($fm in @("ZFM_SD_INQUIRY_0093","ZFM_SD_CUST_INQUIRY_0093","ZFM_SD_INQUIRY_093")) {
  $r = TestSoap $inquiryUrl $fm ""
  if ($r -like "200*") {
    Write-Host "  SUCCESS [$fm]: $r" -ForegroundColor Green
  } else {
    Write-Host "  FAIL    [$fm]" -ForegroundColor Red
  }
}
