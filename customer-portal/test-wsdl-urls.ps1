$user = "K902093"
$pass = "Vinodh@5284456"
$cred = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${user}:${pass}"))
$headers = @{ Authorization = "Basic $cred" }

$urls = @(
  "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_sales_srv_093?wsdl",
  "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_inquiry_srv_093?wsdl",
  "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_delivery_srv_093?wsdl",
  "http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_finance_srv_093?wsdl"
)

foreach ($url in $urls) {
  Write-Host "Checking: $url"
  try {
    $r = Invoke-WebRequest -Uri $url -Headers $headers -UseBasicParsing -TimeoutSec 10
    $content = $r.Content
    if ($content -match "<wsdl:operation name=`"([^`"]+)`"") {
      Write-Host "  -> SUCCESS! Operation: $($matches[1])" -ForegroundColor Green
    } else {
      Write-Host "  -> Error content: $($content.Substring(0, [Math]::Min(150, $content.Length)))" -ForegroundColor Yellow
    }
  } catch {
    Write-Host "  -> Exception: $($_.Exception.Message)" -ForegroundColor Red
  }
}
