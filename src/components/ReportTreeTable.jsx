import { useState } from 'react';

function fmt(n) {
  if (n === undefined || n === null) return '-';
  return Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function TreeRow({ item, columns, depth }) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = item.children && item.children.length > 0;
  const indent = depth * 20;

  return (
    <>
      <tr
        className={`rtr-row ${item.is_group ? 'rtr-group' : ''}`}
        onClick={() => hasChildren && setOpen(!open)}
        style={{ cursor: hasChildren ? 'pointer' : 'default' }}
      >
        <td className="rtr-name" style={{ paddingLeft: `${12 + indent}px` }}>
          {hasChildren && <span className="rtr-toggle">{open ? '▼' : '▶'}</span>}
          {item.name}
          {item.code && <span className="rtr-code">{item.code}</span>}
        </td>
        {columns.map((col) => {
          const d = item[col.key];
          return (
            <td key={col.key} className="rtr-num">
              {d ? fmt(d.sum_balance) : '-'}
            </td>
          );
        })}
      </tr>
      {open && hasChildren && item.children.map((child) => (
        <TreeRow key={child.id} item={child} columns={columns} depth={depth + 1} />
      ))}
    </>
  );
}

function getTopBalance(item, key) {
  if (!item[key]) return 0;
  if (item.accounts && item.accounts.length > 0) {
    return item.accounts.reduce((s, a) => s + (a[key]?.sum_balance || 0), 0);
  }
  return item[key].sum_balance || 0;
}

export default function ReportTreeTable({ data, columns, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="rtr-card">
        <h3>{title}</h3>
        <p className="rtr-empty">No data available</p>
      </div>
    );
  }

  return (
    <div className="rtr-card">
      <h3>{title}</h3>
      <div className="rtr-scroll">
        <table className="rtr-table">
          <thead>
            <tr>
              <th className="rtr-name-h">Particulars</th>
              {columns.map((col) => (
                <th key={col.key} className="rtr-num-h">
                  {col.title}
                  {col.subtitle && <span className="rtr-sub">{col.subtitle}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <TreeRow key={item.id} item={item} columns={columns} depth={0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
