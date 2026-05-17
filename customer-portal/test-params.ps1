$user = "K902093"
$pass = "Vinodh@5284456"
$cred = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${user}:${pass}"))

function TestSoap($url, $fm, $paramName, $paramValue) {
  $body = "<soapenv:Envelope xmlns:soapenv=`"http://schemas.xmlsoap.org/soap/envelope/`" xmlns:urn=`"urn:sap-com:document:sap:rfc:functions`"><soapenv:Header/><soapenv:Body><urn:$fm><$paramName>$paramValue</$paramName></urn:$fm></soapenv:Body></soapenv:Envelope>"
  try {
    $req = [System.Net.HttpWebRequest]::Create($url)
    $req.Method = "POST"
    $req.ContentType = "text/xml;charset=UTF-8"
    $req.Headers.Add("Authorization", "Basic $cred")
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $req.ContentLength = $bytes.Length
    $req.GetRequestStream().Write($bytes, 0, $bytes.Length)
    $resp = $req.GetResponse()
    $content = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    return "200 OK: $($content.Substring(0, [Math]::Min(400, $content.Length)))"
  } catch [System.Net.WebException] {
    $errResp = $_.Exception.Response
    if ($errResp) {
      $content = (New-Object System.IO.StreamReader($errResp.GetResponseStream())).ReadToEnd()
      return "500: $($content.Substring(0, [Math]::Min(200, $content.Length)))"
    }
    return "ERR: $($_.Exception.Message)"
  }
}

$custId = "1002"
$salesUrl = "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_sales_srv_0093?sap-client=100"

$fms = @("ZFM_SD_SALES_0093", "ZFM_SD_SALES_093", "ZFM_SD_CUST_SALES_0093", "ZFM_SD_CUST_SALES_093")
$params = @("P_CUST_ID", "I_KUNNR", "IM_KUNNR", "KUNNR", "CUSTOMER", "CUST_ID")

Write-Host "=== SALES PARAM PROBE ===" -ForegroundColor Cyan
foreach ($fm in $fms) {
  foreach ($p in $params) {
    $r = TestSoap $salesUrl $fm $p $custId
    if ($r -like "200*") { Write-Host "  ✓ [$fm] -> <$p> : $r" -ForegroundColor Green }
    else { Write-Host "  ✗ [$fm] -> <$p>" -ForegroundColor Red }
  }
}
