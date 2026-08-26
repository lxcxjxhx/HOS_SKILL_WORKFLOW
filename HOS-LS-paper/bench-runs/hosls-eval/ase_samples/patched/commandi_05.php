<?php
// Copyright (C) 2006-2010 Rod Roark <rod@sunsetsystems.com>
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.

require_once("../globals.php");
require_once("$srcdir/patient.inc");
require_once("$srcdir/pnotes.inc");
require_once("$srcdir/forms.inc");
require_once("$srcdir/options.inc.php");
require_once("$srcdir/gprelations.inc.php");

if ($_GET['file']) {
  $mode = 'fax';
  $filename = $_GET['file'];

  // ensure the file variable has no illegal characters
  check_file_dir_name($filename);

  $filepath = $GLOBALS['hylafax_basedir'] . '/recvq/' . $filename;
}
else if ($_GET['scan']) {
  $mode = 'scan';
  $filename = $_GET['scan'];
  // ensure the file variable has no illegal characters for scan mode too
  check_file_dir_name($filename);
  $filepath = $GLOBALS['scanner_output_directory'] . '/' . $filename;
}
else {
  die("No filename was given.");
}

$ext = substr($filename, strrpos($filename, '.'));
$filebase = basename("/$filename", $ext);
$faxcache = $GLOBALS['OE_SITE_DIR'] . "/faxcache/$mode/$filebase";

$info_msg = "";

// This function builds an array of document categories recursively.
// Kittens are the children of cats, you know.  :-)getKittens
//
function getKittens($catid, $catstring, &$categories) {
  $cres = sqlStatement("SELECT id, name FROM categories " .
    "WHERE parent = $catid ORDER BY name");
  $childcount = 0;
  while ($crow = sqlFetchArray($cres)) {
    ++$childcount;
    getKittens($crow['id'], ($catstring ? "$catstring / " : "") .
      ($catid ? $crow['name'] : ''), $categories);
  }
  // If no kitties, then this is a leaf node and should be listed.
  if (!$childcount) $categories[$catid] = $catstring;
}

// This merges the tiff files for the selected pages into one tiff file.
//
function mergeTiffs() {
  global $faxcache;
  $msg = '';
  $inames = '';
  $tmp1 = array();
  $tmp2 = 0;
  // form_images are the checkboxes to the right of the images.
  foreach ($_POST['form_images'] as $inbase) {
    $inames .= ' ' . escapeshellarg("$inbase.tif");
  }
  if (!$inames) die(xl("Internal error - no pages were selected!"));
  $tmp0 = exec("cd " . escapeshellarg($faxcache) . "; tiffcp $inames temp.tif", $tmp1, $tmp2);
  if ($tmp2) {
    $msg .= "tiffcp returned $tmp2: $tmp0 ";
  }
  return $msg;
}

// If we are submitting...
//
if ($_POST['form_save']) {
  $action_taken = false;
  $tmp1 = array();
  $tmp2 = 0;

  if ($_POST['form_cb_copy']) {
    $patient_id = (int) $_POST['form_pid'];
    if (!$patient_id) die(xl('Internal error - patient ID was not provided!'));
    // Compute the name of the target directory and make sure it exists.
    $docdir = $GLOBALS['OE_SITE_DIR'] . "/documents/$patient_id";
    exec("mkdir -p " . escapeshellarg($docdir));

    // If copying to patient documents...
    //
    if ($_POST['form_cb_copy_type'] == 1) {
      // Compute a target filename that does not yet exist.
      $ffname = trim($_POST['form_filename']);
      $i = strrpos($ffname, '.');
      if ($i) $ffname = trim(substr($ffname, 0, $i));
      if (!$ffname) $ffname = $filebase;
      $ffmod  = '';
      $ffsuff = '.pdf';
      // If the target filename exists, modify it until it doesn't.
      $count = 0;
      while (is_file("$docdir/$ffname$ffmod$ffsuff")) {
        ++$count;
        $ffmod = "_$count";
      }
      $target = "$docdir/$ffname$ffmod$ffsuff";
      $docdate = fixDate($_POST['form_docdate']);

      // Create the target PDF.  Note that we are relying on the .tif files for