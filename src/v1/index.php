<?php
/**
 *
 * API Key
 *
 * @author Takuto Yanagida
 * @version 2026-06-29
 *
 */

require "access-control.php";

$allowed_hosts = [
	'takty.net',
];

$expected_uas = [
	'Croqujs/',
	'Electron/',
];

const OWNER = 'takty';

$is_allowed_hosts = is_request_allowed($allowed_hosts);

if (!$is_allowed_hosts && !is_user_agent_expected($expected_uas)) {
	http_response_code(404);
	return;
}
if ($is_allowed_hosts) {
	send_cors_headers();
}


// -----------------------------------------------------------------------------


$api_key = getenv('API_KEY');
if ($api_key === false || $api_key === '') {
	http_response_code(500);
	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode(null);
	return;
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($api_key);
