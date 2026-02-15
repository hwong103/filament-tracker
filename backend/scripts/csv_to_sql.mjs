import { readFile } from "node:fs/promises";

const [,, inputPath] = process.argv;
if (!inputPath) {
  console.error("Usage: node scripts/csv_to_sql.mjs <path-to-csv>");
  process.exit(1);
}

const raw = await readFile(inputPath, "utf-8");
const rows = parseCsv(raw.trim());
if (rows.length === 0) {
  console.error("CSV appears empty.");
  process.exit(1);
}

const header = rows[0].map((cell) => cell.trim().toLowerCase());
const index = {
  brand: header.indexOf("brand"),
  color: header.indexOf("color"),
  colour: header.indexOf("colour"),
  type: header.indexOf("type"),
  material: header.indexOf("material"),
  amount: header.indexOf("amount"),
};

const colorIndex = index.color !== -1 ? index.color : index.colour;
const required = [index.brand, colorIndex, index.type, index.material, index.amount];
if (required.some((value) => value === -1)) {
  console.error("CSV must include Brand, Colour/Color, Type, Material, Amount columns.");
  process.exit(1);
}

const now = new Date().toISOString();
const inserts = [];

for (let i = 1; i < rows.length; i += 1) {
  const row = rows[i];
  if (row.length === 0 || row.every((cell) => !cell.trim())) continue;

  const brand = row[index.brand]?.trim() ?? "";
  const color = row[colorIndex]?.trim() ?? "";
  const type = row[index.type]?.trim() ?? "";
  const material = row[index.material]?.trim() ?? "";
  const amountRaw = row[index.amount]?.trim() ?? "0";
  const amount = Number(amountRaw);

  if (!brand || !color || !type || !material || !Number.isFinite(amount)) {
    console.warn(`Skipping row ${i + 1}: missing data.`);
    continue;
  }

  inserts.push(
    `INSERT INTO filaments (brand, color, type, material, amount, created_at, updated_at) VALUES (${sqlString(
      brand
    )}, ${sqlString(color)}, ${sqlString(type)}, ${sqlString(
      material
    )}, ${amount}, ${sqlString(now)}, ${sqlString(now)});`
  );
}

console.log("BEGIN TRANSACTION;");
console.log(inserts.join("\n"));
console.log("COMMIT;");

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`;
}

function parseCsv(text) {
  const rows = [];
  let current = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      current.push(value);
      value = "";
      continue;
    }

    if (char === "\n" && !inQuotes) {
      current.push(value);
      rows.push(current);
      current = [];
      value = "";
      continue;
    }

    value += char;
  }

  current.push(value);
  rows.push(current);
  return rows;
}
