<?php
// Demo endpoint for <server-action action="confirm"> round-trip.
header('Content-Type: application/json');
$id       = $_POST['id'] ?? '';
$confirmed = ($_POST['confirmed'] ?? 'false') === 'true';
echo json_encode(['ok' => true, 'id' => $id, 'confirmed' => $confirmed, 'message' => $confirmed ? 'Confirmado' : 'Cancelado']);
