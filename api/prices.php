<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$adminUser = 'hanumanscraps@gmail.com';
$adminPass = 'hanuman_goal@2027june';
$pricesFile = __DIR__ . '/../data/prices.json';

$defaultPrices = [
    ['id' => 'iron', 'name' => 'Iron', 'category' => 'metal', 'price' => 25, 'unit' => 'kg', 'image' => 'iron.png'],
    ['id' => 'steel', 'name' => 'Steel', 'category' => 'metal', 'price' => 40, 'unit' => 'kg', 'image' => 'steel.png'],
    ['id' => 'copper', 'name' => 'Copper', 'category' => 'metal', 'price' => 650, 'unit' => 'kg', 'image' => 'copper.png'],
    ['id' => 'plastic', 'name' => 'Mixed Plastic', 'category' => 'plastic', 'price' => 15, 'unit' => 'kg', 'image' => 'plastic.png'],
    ['id' => 'paper', 'name' => 'Paper/Cardboard', 'category' => 'paper', 'price' => 12, 'unit' => 'kg', 'image' => 'paper.png'],
    ['id' => 'ewaste', 'name' => 'E-Waste (General)', 'category' => 'ewaste', 'price' => 150, 'unit' => 'kg', 'image' => 'ewaste.png'],
];

function send_json($data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_prices(string $pricesFile, array $defaultPrices): array
{
    if (!is_file($pricesFile)) {
        return $defaultPrices;
    }

    $json = file_get_contents($pricesFile);
    $prices = json_decode((string) $json, true);

    return is_array($prices) ? $prices : $defaultPrices;
}

function sanitize_prices(array $incoming, array $existing): array
{
    $byId = [];
    foreach ($existing as $item) {
        if (isset($item['id'])) {
            $byId[$item['id']] = $item;
        }
    }

    foreach ($incoming as $item) {
        if (!is_array($item) || empty($item['id']) || !isset($byId[$item['id']])) {
            continue;
        }

        $price = filter_var($item['price'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($price === false || $price <= 0) {
            continue;
        }

        $byId[$item['id']]['price'] = $price + 0;
    }

    return array_values($byId);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    send_json(['prices' => read_prices($pricesFile, $defaultPrices)]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['error' => 'Method not allowed'], 405);
}

$payload = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($payload)) {
    send_json(['error' => 'Invalid request'], 400);
}

if (($payload['username'] ?? '') !== $adminUser || ($payload['password'] ?? '') !== $adminPass) {
    send_json(['error' => 'Unauthorized'], 401);
}

$existing = read_prices($pricesFile, $defaultPrices);
$prices = sanitize_prices($payload['prices'] ?? [], $existing);
$dir = dirname($pricesFile);

if (!is_dir($dir) && !mkdir($dir, 0755, true)) {
    send_json(['error' => 'Unable to prepare storage'], 500);
}

$saved = file_put_contents(
    $pricesFile,
    json_encode($prices, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    LOCK_EX
);

if ($saved === false) {
    send_json(['error' => 'Unable to save prices'], 500);
}

send_json(['prices' => $prices]);
