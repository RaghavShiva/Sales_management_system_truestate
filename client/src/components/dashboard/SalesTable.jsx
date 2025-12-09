import { useState } from "react";

export default function SalesTable({ data, loading }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center text-sm text-gray-500">
        No transactions found for current filters.
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return String(dateString).slice(0, 10);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatQuantity = (qty) => {
    if (!qty && qty !== 0) return "-";
    return String(qty).padStart(2, "0");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <span className="text-xs font-medium text-gray-700">
          {isExpanded ? "Showing all columns" : "Showing 9 columns"}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1.5 text-xs bg-purple-600 text-white border border-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center gap-2"
          type="button"
        >
          {isExpanded ? (
            <>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Expand
            </>
          )}
        </button>
      </div>
      <div className="overflow-auto" style={{ maxHeight: '500px' }}>
        <table className="min-w-full text-xs">
          <thead className="bg-gray-700 border-b border-gray-200 sticky top-0 z-10">
            <tr className="text-left text-[11px] text-white font-medium">
              <th className="px-4 py-3 whitespace-nowrap">Transaction ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Date</th>
              <th className="px-4 py-3 whitespace-nowrap">Customer ID</th>
              <th className="px-4 py-3 whitespace-nowrap">Customer name</th>
              <th className="px-4 py-3 whitespace-nowrap">Phone Number</th>
              <th className="px-4 py-3 whitespace-nowrap">Gender</th>
              <th className="px-4 py-3 whitespace-nowrap">Age</th>
              <th className="px-4 py-3 whitespace-nowrap">Product Category</th>
              <th className="px-4 py-3 whitespace-nowrap">Quantity</th>
              {isExpanded && (
                <>
                  <th className="px-4 py-3 whitespace-nowrap">Total Amount</th>
                  <th className="px-4 py-3 whitespace-nowrap">Customer region</th>
                  <th className="px-4 py-3 whitespace-nowrap">Product ID</th>
                  <th className="px-4 py-3 whitespace-nowrap">Employee name</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-[11px] bg-white">
            {data.map((row, idx) => (
              <tr
                key={`${row.transactionId || idx}-${row.customerId || idx}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.transactionId || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {formatDate(row.date)}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.customerId || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.customerName || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.phoneNumber || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.gender || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.age || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {row.productCategory || "-"}
                </td>
                <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                  {formatQuantity(row.quantity)}
                </td>
                {isExpanded && (
                  <>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {formatCurrency(row.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {row.customerRegion || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {row.productId || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                      {row.employeeName || "-"}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}