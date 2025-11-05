<?php
header('Content-Type: application/json');
require_once 'config.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { echo json_encode(['ok'=>false,'msg'=>'No input']); exit; }

$nominal = floatval($input['nominal'] ?? 0);
$persen = floatval($input['persen'] ?? 0);
$tabung = floatval($input['tabung'] ?? 0);
$sisa = floatval($input['sisa'] ?? 0);
$user_id = 1; 

$stmt = $conn->prepare('INSERT INTO riwayat_tabungan (user_id, nominal_uang, persentase_tabung, jumlah_tabung, sisa_uang) VALUES (?,?,?,?,?)');
$stmt->bind_param('idddd', $user_id, $nominal, $persen, $tabung, $sisa);
$ok = $stmt->execute();
echo json_encode(['ok'=>$ok]);
?>
