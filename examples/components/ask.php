<?php
// Demo endpoint for <server-action action="ask"> round-trip.
header('Content-Type: application/json');
$id     = $_POST['id'] ?? '';
$option = $_POST['option'] ?? '';
echo json_encode(['ok' => true, 'id' => $id, 'option' => $option, 'message' => $option !== '' ? "Opción elegida: $option" : 'Sin opción']);
