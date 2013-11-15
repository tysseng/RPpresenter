#!/bin/sh
rm -f /opt/presentation/logs/simplehttpserver.log
cd /opt/presentation/content
nohup python -m SimpleHTTPServer 80 > /opt/presentation/logs/simplehttpserver.log &

