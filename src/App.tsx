{/* Product Code* (Auto-Matched with Google Sheet Master SKU) */}
<td className="py-2.5 px-3">
  <div className="font-mono">
    <span className={`font-bold text-xs whitespace-nowrap px-2 py-1 rounded border ${
      row.matchedSku
        ? isDarkMode
          ? 'text-emerald-300 bg-emerald-950/60 border-emerald-600/60'
          : 'text-emerald-900 bg-emerald-100/80 border-emerald-300 font-extrabold'
        : isDarkMode
          ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
          : 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
    }`}>
      {row.matchedSku || (row.fullCode || `${row.prefix}-${row.itemCode}`) + '--' + (row.year ? `${row.year.replace(/[\s\-_]*(years?|months?)$/i, '').trim()}${currentUnit === 'months' ? 'months' : 'years'}` : currentUnit === 'months' ? 'months' : 'years')}
    </span>
  </div>
</td>
