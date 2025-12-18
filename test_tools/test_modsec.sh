#!/bin/bash

URL="https://127.0.0.1:8443"

declare -A tests=(
	["XSS"]="<script>alert('xss')</script>"
	["SQL Injection 1"]="' OR '1'='1;"
	["SQL Injection 2"]="1; DROP TABLE users;"
	["SQL Injection 3"]="SELECT * FROM users WHERE username = 'admin' AND password = 'password';"
	["SQL Injection 4"]="UNION SELECT username, password FROM users;"
	["Command Injection"]="; ls -la"
	["Local File Inclusion"]="../../etc/passwd"
	["Remote File Inclusion"]="http://evil.com/malicious"
	["Cross Site Request Forgery"]="action=transfer&amount=1000"
	["Directory Traversal"]="../../../../etc/passwd"
	["Shellshock"]='() { :;}; /bin/bash -c "echo Shellshock"'
	["XML External Entity"]='<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>'
	["HTTP Header Injection"]="Host: evil.com\r\n\r\n"
	["JSON Injection"]='{"user": "admin", "password": "pass"}'
	["CRLF Injection"]="test\r\n\r\nInjected-Header: value"
	["Path Traversal"]="../../../../var/www/html/index.php"
	["SQL Error Based Injection"]="SELECT * FROM users WHERE id = 1; --"
	["XSS via Image Tag"]="<img src=x onerror=alert('xss')>"
	["JavaScript URL Injection"]="<a href='javascript:alert(1)'>Click me</a>"
	["Cookie Manipulation"]="sessionid=malicious; path=/"
	["HTTP Method Override"]="PUT / HTTP/1.1\r\nHost: $URL\r\nContent-Length: 0\r\n\r\n"
	["Invalid Content Type"]="Content-Type: application/x-www-form-urlencoded\r\n\r\n"
	["Large Payload"]="A$(printf '%.0sA' {1..10000})"  # Payload très long
	["Invalid JSON"]="{'key': 'value', 'malicious': <script>alert(1)</script>}"
	["Malformed XML"]='<?xml version="1.0"?><root><malformed></root>'
	["Invalid UTF-8 Characters"]="\x80\x81\x82"
	["Excessive URL Length"]="http://example.com/$(printf 'A%.0s' {1..10000})"
	["Invalid HTTP Method"]="TRACE / HTTP/1.1\r\nHost: $URL\r\n\r\n"
	["Invalid Host Header"]="Host: invalid.com\r\n\r\n"
	["Invalid Cookie Header"]="Cookie: sessionid=malicious; path=/\r\n\r\n"
	["Invalid Query String"]="?test=<script>alert('xss')</script>"
	["Invalid Form Data"]="field=<script>alert('xss')</script>"
	["Invalid XML Namespace"]='<?xml version="1.0"?><root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://invalid.com/schema.xsd"><malicious></malicious></root>'
	["Invalid JSON Schema"]="{'$schema': 'http://json-schema.org/draft-07/schema#', 'type': 'object', 'properties': {'malicious': {'type': 'string', 'pattern': '<script>alert(1)</script>'}}}"
	["Invalid HTML Injection"]='<html><body><script>alert("xss")</script></body></html>'
	["Invalid HTTP Request Line"]="GET / HTTP/1.1\r\nHost: $URL\r\n\r\n"
	["Invalid HTTP Version"]="GET / HTTP/2.0\r\nHost: $URL\r\n\r\n"
	["Invalid Content Length"]="Content-Length: -1\r\n\r\n"
	["Invalid Transfer Encoding"]="Transfer-Encoding: chunked\r\n\r\n0\r\n\r\n"
	["Invalid Range Header"]="Range: bytes=0-1000000000\r\n\r\n"
	["Invalid Accept Header"]="Accept: */*\r\nAccept-Encoding: gzip, deflate, br\r\nAccept-Language: en-US,en;q=0.9\r\n\r\n"
	["Invalid User-Agent Header"]="User-Agent: MaliciousBot/1.0\r\n\r\n"
	["Invalid Referer Header"]="Referer: http://malicious.com\r\n\r\n"
	["Invalid Origin Header"]="Origin: http://malicious.com\r\n\r\n"
	["Invalid Content-Disposition Header"]="Content-Disposition: attachment; filename=malicious.php\r\n\r\n"
	["Invalid Cache-Control Header"]="Cache-Control: no-cache, no-store, must-revalidate\r\nPragma: no-cache\r\nExpires: 0\r\n\r\n"
	["Invalid If-Modified-Since Header"]="If-Modified-Since: Thu, 01 Jan 1970 00:00:00 GMT\r\n\r\n"
	["Invalid If-None-Match Header"]="If-None-Match: \"malicious\"\r\n\r\n"
	["Invalid Expect Header"]="Expect: 100-continue\r\n\r\n"
	["Invalid Upgrade Header"]="Upgrade: websocket\r\nConnection: Upgrade\r\n\r\n"
	["Invalid Connection Header"]="Connection: close\r\n\r\n"
	["Invalid TE Header"]="TE: trailers\r\n\r\n"
	["Invalid DNT Header"]="DNT: 1\r\n\r\n"
)
echo "-----------------------------------"
echo " Starting ModSecurity tests ${URL} "
echo "-----------------------------------"

for name in "${!tests[@]}"; do
payload="${tests[$name]}"

# Encode the payload for URL usage
encoded_payload=$(printf '%s' "$payload" | jq -sRr @uri)

echo -e "\nTest: $name"
echo "Payload: $payload"
#echo "$URL/?test=$encoded_payload"
response=$(curl  -s -o /dev/null -w "%{http_code}" -k "$URL/?test=$encoded_payload")

if [[ "$response" == "403" ]]; then
	echo "RESPONSE: Blocked  by ModSecurity (code HTTP 403 - Forbidden)" 
else
	echo "RESPONSE: Not blocked (code HTTP $response)"
fi
done

echo -e "\nAll tests completed."
echo "-----------------------------------"
