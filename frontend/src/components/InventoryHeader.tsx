import { Package, RowsPlusBottom } from "@phosphor-icons/react";

type InventoryHeaderProps = {
  totalSpools: number;
  skuCount: number;
  authorized: boolean;
};

export function InventoryHeader({
  totalSpools,
  skuCount,
  authorized,
}: InventoryHeaderProps) {
  return (
    <header className="hero">
      <div>
        <p className="eyebrow">Filament Tracker</p>
        <h1>Know your spool situation at a glance.</h1>
        <p className="subhead">
          Keep stock visible, catch low inventory early, and maintain clean records
          from any device.
        </p>
      </div>
      <div className="stats" aria-label={authorized ? "Inventory summary" : "Inventory access"}>
        {authorized ? (
          <>
            <div className="stat">
          <span className="stat-label">
            <Package size={16} weight="duotone" aria-hidden="true" /> Total spools
          </span>
          <strong>{totalSpools.toFixed(2)}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">
            <RowsPlusBottom size={16} weight="duotone" aria-hidden="true" /> SKUs
          </span>
          <strong>{skuCount}</strong>
        </div>
          </>
        ) : (
          <div className="stat stat-locked">
            <span className="stat-label">Private inventory</span>
            <strong>Unlock to view stock</strong>
          </div>
        )}
      </div>
    </header>
  );
}
