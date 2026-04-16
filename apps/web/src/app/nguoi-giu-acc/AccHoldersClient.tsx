"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

type AccountItem = {
  id: string;
  title: string;
  seller_full_name: string | null;
  seller_transaction_box_url?: string | null;
};

export function AccHoldersClient({ accounts }: { accounts: AccountItem[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedAccId, setSelectedAccId] = useState<string | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter for dropdown suggestions
  const suggestions = accounts.filter((acc) =>
    acc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter for table display
  const tableData = selectedAccId
    ? accounts.filter((acc) => acc.id === selectedAccId)
    : suggestions;

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="mb-6 relative z-20" ref={dropdownRef}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border-0 py-3 pl-10 pr-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-800 dark:text-white dark:ring-slate-700 focus:dark:ring-indigo-500 transition-shadow"
            placeholder="Tìm theo tên file / tên account..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              if (selectedAccId) setSelectedAccId(null);
            }}
            onFocus={() => setIsDropdownOpen(true)}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedAccId(null);
                setIsDropdownOpen(false);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isDropdownOpen && searchTerm && suggestions.length > 0 && (
          <div className="absolute mt-1 w-full overflow-auto rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800 dark:ring-white/10 z-50 max-h-60">
            <ul className="py-1">
              {suggestions.slice(0, 10).map((acc) => (
                <li
                  key={acc.id}
                  onClick={() => {
                    setSearchTerm(acc.title);
                    setSelectedAccId(acc.id);
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 flex justify-between items-center"
                >
                  <span className="font-medium truncate pr-4">{acc.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {acc.seller_full_name || "Admin"}
                  </span>
                </li>
              ))}
              {suggestions.length > 10 && (
                <li className="px-4 py-2 text-xs text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 italic">
                  Và {suggestions.length - 10} kết quả khác...
                </li>
              )}
            </ul>
          </div>
        )}
        
        {isDropdownOpen && searchTerm && suggestions.length === 0 && (
          <div className="absolute mt-1 w-full rounded-xl bg-white p-4 text-center text-sm shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-slate-800 dark:ring-white/10 z-50">
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy tài khoản phù hợp</p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10">
        <div className="overflow-x-auto relative z-10">
          <table className="w-full table-fixed divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 dark:text-slate-200 sm:pl-6 w-[70%] sm:w-[60%]">
                  Tên Tài Khoản
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 dark:text-slate-200 w-[30%] sm:w-[40%]">
                  Người Giữ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {tableData.length > 0 ? tableData.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="whitespace-normal break-words py-4 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-6">
                    {acc.title}
                  </td>
                  <td className="whitespace-normal break-words px-3 py-4 text-sm text-slate-500 dark:text-slate-300 font-medium">
                    {acc.seller_full_name || "Admin"}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    Không có dữ liệu tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
