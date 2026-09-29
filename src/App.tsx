{/* Product Code */}
<td className="py-2.5 px-3">
  <div className="flex items-center gap-1.5 font-mono">
    <span
      className={`font-bold text-xs whitespace-nowrap px-1.5 py-0.5 rounded border ${
        isDarkMode
          ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
          : 'text-emerald-800 bg-emerald-50 border-emerald-200/80'
      }`}
    >
      {(row.fullCode || `${row.prefix}-${row.itemCode}`) +
        '--' +
        (row.year
          ? `${String(row.year)
              .replace(/[\s\-_]*(years?|months?)$/i, '')
              .trim()}${currentUnit === 'months' ? 'months' : 'years'}`
          : currentUnit === 'months'
            ? 'months'
            : 'years')}
    </span>

    <span
      className={`text-[10px] font-normal ${
        isDarkMode ? 'text-slate-500' : 'text-slate-400'
      }`}
    >
      (
      <input
        type="text"
        title="Edit Year / Age"
        value={row.year || ''}
        onChange={(e) =>
          updateRowField(row.id, 'year', e.target.value)
        }
        className={`w-10 px-1 py-0.5 rounded border text-center font-mono focus:outline-none ${
          isDarkMode
            ? 'bg-slate-950 border-slate-700 text-sky-300 focus:border-emerald-500'
            : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-600'
        }`}
      />
      )
    </span>
  </div>
</td>
