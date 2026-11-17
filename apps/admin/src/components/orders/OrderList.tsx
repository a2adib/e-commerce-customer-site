import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "../../lib/api";

interface OrderItem {
  public_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Order {
  public_id: string;
  order_number: string;
  customer_name?: string | null;
  customer_email?: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  items: OrderItem[];
  shipping_snapshot?: {
    full_name?: string;
    phone?: string;
    address_line?: string;
    city?: string;
  };
}

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await apiClient<Order[]>("/admin/orders");
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiClient(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      toast.error(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="py-10 text-center text-gray-400">Loading orders...</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-xs text-gray-500 mt-1">Manage customer orders and dispatch status.</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-gray-500">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.public_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {order.order_number}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">
                      {order.customer_name || order.shipping_snapshot?.full_name || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.shipping_snapshot?.phone || order.customer_email || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                        STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={updatingId === order.public_id}
                      onChange={(e) => handleStatusChange(order.public_id, e.target.value)}
                      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-black"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
