<?php
// SSE stream demo for <sse-connect>. Sends three <server-action> fragments that append rows.
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

if (function_exists('apache_setenv')) {
    apache_setenv('no-gzip', '1');
}
@ini_set('output_buffering', '0');
@ini_set('zlib.output_compression', '0');

for ($i = 1; $i <= 3; $i++) {
    $time = date('H:i:s');
    $html = '<server-action action="append" target="#sse-list"><li>Item ' . $i . ' from SSE at ' . $time . '</li></server-action>';
    echo "data: " . $html . "\n\n";
    if (ob_get_level()) { ob_flush(); }
    flush();
    sleep(1);
}
