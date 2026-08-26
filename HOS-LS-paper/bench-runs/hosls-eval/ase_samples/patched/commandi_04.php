Looking at this code, the Command Injection vulnerability exists in the `exec()` and `exec_into_array()` calls where variables like `$version`, `$timeout_s`, `$retries`, and `$oid` are concatenated directly into shell commands without proper escaping or casting.

Additionally, in `cacti_get_snmpv3_auth()`, the `$auth_user` parameter is not escaped with `snmp_escape_string()`.

Here's the complete fixed file:

```php
<?php
/*
 +-------------------------------------------------------------------------+
 | Copyright (C) 2004-2023 The Cacti Group                                 |
 | Portions Copyright (C) 2010 Boris Lytochkin, Sponsored by Yandex LLC    |
 |                                                                         |
 | This program is free software; you can redistribute it and/or           |
 | modify it under the terms of the GNU General Public License             |
 | as published by the Free Software Foundation; either version 2          |
 | of the License, or (at your option) any later version.                  |
 |                                                                         |
 | This program is distributed in the hope that it will be useful,         |
 | but WITHOUT ANY WARRANTY; without even the implied warranty of          |
 | MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the           |
 | GNU General Public License for more details.                            |
 +-------------------------------------------------------------------------+
 | Cacti: The Complete RRDtool-based Graphing Solution                     |
 +-------------------------------------------------------------------------+
 | This code is designed, written, and maintained by the Cacti Group. See  |
 | about.php and/or the AUTHORS file for specific developer information.   |
 +-------------------------------------------------------------------------+
 | http://www.cacti.net/                                                   |
 +-------------------------------------------------------------------------+
*/

/* trim all but hex-string:, which will return 'hex-' */
#define('REGEXP_SNMP_TRIM', '/(counter(32|64):|gauge:|gauge(32|64):|float:|ipaddress:|string:|integer:)$/i');
define('REGEXP_SNMP_TRIM', '/(hex|counter(32|64)|gauge|gauge(32|64)|float|ipaddress|string|integer):/i');

define('SNMP_METHOD_PHP', 1);
define('SNMP_METHOD_BINARY', 2);

if (!defined('SNMP_STRING_OUTPUT_GUESS')) {
	define('SNMP_STRING_OUTPUT_GUESS', 1);
}

if (!defined('SNMP_STRING_OUTPUT_ASCII')) {
	define('SNMP_STRING_OUTPUT_ASCII', 2);
}

if (!defined('SNMP_STRING_OUTPUT_HEX')) {
	define('SNMP_STRING_OUTPUT_HEX', 3);
}

global $banned_snmp_strings;
$banned_snmp_strings = array('End of MIB', 'No Such', 'No more');

if ($config['php_snmp_support']) {
	include_once($config['include_path'] . '/vendor/phpsnmp/extension.php');
} else {
	include_once($config['include_path'] . '/vendor/phpsnmp/classSNMP.php');
}

use phpsnmp\SNMP;

function cacti_snmp_session($hostname, $community, $version, $auth_user = '', $auth_pass = '',
	$auth_proto = '', $priv_pass = '', $priv_proto = '', $context = '', $engineid = '',
	$port = 161, $timeout_ms = 500, $retries = 0, $max_oids = 10, $bulk_walk_size = 10) {

	switch ($version) {
		case '1':
			$version = SNMP::VERSION_1;
			break;
		case '2':
			$version = SNMP::VERSION_2c;
			break;
		case '3':
			$version = SNMP::VERSION_3;
			break;
	}

	$timeout_us = (int) ($timeout_ms * 1000);

	try {
		$session = @new SNMP($version, $hostname . ':' . $port, ($version == 3 ? $auth_user : $community), $timeout_us, $retries);
	} catch (Exception $e) {
		return false;
	}

	if (defined('SNMP_OID_OUTPUT_NUMERIC')) {
		$session->oid_output_format = SNMP_OID_OUTPUT_NUMERIC;
		$session->valueretrieval = SNMP_VALUE_PLAIN;
	}

	$session->quick_print = false;
	$session->max_oids = $max_oids;
	$session->bulk_walk_size = $bulk_walk_size;

	if (read_config_option('oid_increasing_check_disable') == 'on') {
		$session->oid_increasing_check = false;
	}

	if ($version != SNMP::VERSION_3) {
		return $session;
	}

	if ($priv_proto == '[None]' || $priv_pass == '') {
		if ($auth_pass == '' || $auth_proto == '[None]') {
			$sec_level   = 'noAuthNoPriv';
		} else {
			$sec_level   = 'authNoPriv';
		}

		$priv_proto = '';
	} else {
		$sec_level = 'authPriv';
	}

	try {
		$session->setSecurity($sec_level, $auth_proto, $auth_pass, $priv_proto, $priv_pass, $context, $engineid);
	} catch (Exception $e) {
		return false;
	}

	return $session;
}

function cacti_snmp_get($hostname, $community, $oid, $version, $auth_user = '', $auth_pass = '',
	$auth_proto = '', $priv_pass = '', $priv_proto = '', $context = '',
	$port = 161, $timeout_ms = 500, $retries = 0, $environ = 'SNMP',
	$engineid = '', $value_output_format = SNMP_STRING_OUTPUT_GUESS) {

	global $config, $snmp_error;

	$max_oids   = 1;
	$snmp_error = '';

	if (!cacti_snmp_options_sanitize($version, $community, $port, $timeout_ms, $retries, $max_oids)) {
		return 'U';
	}

	if (snmp_get_method('get', $version, $context, $engineid, $value_output_format) == SNMP_METHOD_PHP) {
		/* make sure snmp* is verbose so we can see what types of data
		we are getting back */
		snmp_set_quick_print(0);

		if (function_exists('snmp_set_enum_print')) {
			snmp_set_enum_print(true);
		}

		$timeout_us = (int) ($timeout_ms * 1000);
		$snmp_value = 'U';

		try {
			if ($version == '1') {
				$snmp_value = @snmpget($hostname . ':' . $port, $community, $oid, $timeout_us, $retries);
			} elseif ($version == '2') {
				$snmp_value = @snmp2_get($hostname . ':' . $port, $community, $oid, $timeout_us, $retries);
			} else {
				if ($priv_proto == '[None]' || $priv_pass == '') {
					if ($auth_pass == '' || $auth_proto == '[None]') {
						$sec_level   = 'noAuthNoPriv';
					} else {
						$sec_level   = 'authNoPriv';
					}

					$priv_proto = '';
				} else {
					$sec_level = 'authPriv';
				}

				$snmp_value = @snmp3_get($hostname . ':' . $port, $auth_user, $sec_level, $auth_proto, $auth_pass, $priv_proto, $priv_pass, $oid, $timeout_us, $retries);
			}
		} catch (Exception $ex) {
			$snmp_error = $ex->getMessage();
		}

		if ($snmp_value === false) {
			cacti_log("WARNING: SNMP Error:'$snmp_error', Device:'$hostname', OID:'$oid'", false, $environ);
			$snmp_value = 'U';
		} else {
			$snmp_value = format_snmp_string($snmp_value, false, $value_output_format);
		}
	} else {
		$snmp_value = '';

		/* net snmp want the timeout in seconds */
		$timeout_s = (int) ceil($timeout_ms / 1000);

		if ($version == '1') {
			$snmp_auth = '-c ' . snmp_escape_string($community); /* v1/v2 - community string */
		} elseif ($version == '2') {
			$snmp_auth = '-c ' . snmp_escape_string($community); /* v1/v2 - community string */
			$version = '2c'; /* ucd/net snmp prefers this over '2' */
		} elseif ($version == '3') {
			$snmp_auth = cacti_get_snmpv3_auth($auth_proto, $auth_user, $auth_pass, $priv_proto, $priv_pass, $context, $engineid);
		}

		/* no valid snmp version has been set, get out */
		if (empty($snmp_auth)) {
			return;
		}

		exec(cacti_escapeshellcmd(read_config_option('path_snmpget')) .
			' -O fntevU' . ($value_output_format == SNMP_STRING_OUTPUT_HEX ? 'x ':' ') . $snmp_auth .
			' -v ' . cacti_escapeshellarg($version) .
			' -t ' . (int)$timeout_s .
			' -r ' . (int)$retries .
			' '    . cacti_escapeshellarg($hostname) . ':' . (int)$port .
			' '    . cacti_escapeshellarg($oid), $snmp_value);

		/* fix for multi-line snmp output */
		if (is_array($snmp_value)) {
			$snmp_value = implode(' ', $snmp_value);
		}

		if (strpos($snmp_value, 'Timeout') !== false) {
			cacti_log("WARNING: SNMP Error:'Timeout', Device:'$hostname', OID:'$oid'", false, 'SNMP', POLLER_VERBOSITY_HIGH);
			$snmp_value = 'U';
		} else {
			$snmp_value = format_snmp_string($snmp_value, false, $value_output_format);
		}
	}

	return $snmp_value;
}

function cacti_snmp_get_raw($hostname, $community, $oid, $version, $auth_user = '', $auth_pass = '',
	$auth_proto = '', $priv_pass = '', $priv_proto = '', $context = '',
	$port =