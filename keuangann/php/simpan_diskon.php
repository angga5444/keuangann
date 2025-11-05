<?php
header('Content-Type: application/json');
require_once 'config.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) { echo json_encode(['ok'=>false,'msg'=>'No input']); exit; }

$harga_awal = floatval($input['hargaAwal'] ?? 0);
$diskon = floatval($input['diskon'] ?? 0);
$harga_akhir = floatval($input['hargaAkhir'] ?? 0);
$user_id = 1; 

$stmt = $conn->prepare('INSERT INTO riwayat_diskon (user_id, harga_awal, diskon_persen, harga_akhir) VALUES (?,?,?,?)');
$stmt->bind_param('iddd', $user_id, $harga_awal, $diskon, $harga_akhir);
$ok = $stmt->execute();
echo json_encode(['ok'=>$ok]);
?>
