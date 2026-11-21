import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, FileText, User, Phone, Shield } from "lucide-react";
import api from "../../lib/adminApi";
import {
  DataTable,
  Pagination,
  Toolbar,
  Badge,
  statusTone,
  Modal,
  Field,
  inputCls,
  FormSection,
  FormActions,
} from "../../admin/components/ui";
import { useManage } from "../RequireManager";
import toast from "react-hot-toast";

export default function Customers() {
  const { has } = useManage();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [note, setNote] = useState({ id: null, text: "" });
  const [saving, setSaving] = useState(false);

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/customers", { params: { page, limit: 10, search, status } });
      setRows(data.data);
      setMeta(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => load(1), 300);
    return () => clearTimeout(t);
  }, [search, status]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/customers/${edit._id}`, { name: edit.name, phone: edit.phone, status: edit.status });
      toast.success("Customer profile updated");
      setEdit(null);
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/admin/customers/${note.id}/notes`, { text: note.text });
      toast.success("Customer note added");
      setNote({ id: null, text: "" });
      load(meta.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Toolbar search={search} onSearch={setSearch}>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#DFDED7] bg-[#FFFFFF] px-3 py-2 text-xs font-semibold text-[#17232F] outline-none focus:border-[#B9965B]"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </Toolbar>

      <DataTable
        loading={loading}
        columns={[
          {
            key: "name",
            label: "Customer",
            render: (u) => (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#B9965B] to-[#3E8066] text-xs font-bold text-white shadow-2xs">
                  {u.name?.charAt(0)?.toUpperCase() || "C"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs text-[#17232F] truncate">{u.name}</p>
                  <p className="text-[11px] text-[#65717B] truncate">{u.email}</p>
                  {u.phone && <p className="text-[10px] text-[#65717B] font-mono">{u.phone}</p>}
                </div>
              </div>
            ),
          },
          {
            key: "inquiries",
            label: "Inquiries",
            render: (u) => (
              <span className="font-mono-numbers font-semibold text-xs text-[#17232F] bg-[#F7F7F2] px-2.5 py-1 rounded-lg border border-[#DFDED7]">
                {u.totalInquiries || 0}
              </span>
            ),
          },
          {
            key: "bookings",
            label: "Bookings",
            render: (u) => (
              <span className="font-mono-numbers font-semibold text-xs text-[#B9965B] bg-[#F4EFE6]/50 px-2.5 py-1 rounded-lg border border-[#F4EFE6]">
                {u.totalBookings || 0}
              </span>
            ),
          },
          {
            key: "transactions",
            label: "Transactions",
            render: (u) => (
              <span className="font-mono-numbers font-semibold text-xs text-[#17232F]">
                {u.totalTransactions || 0}
              </span>
            ),
          },
          {
            key: "status",
            label: "Status",
            render: (u) => <Badge value={u.status} tone={statusTone(u.status)} />,
          },
          {
            key: "createdAt",
            label: "Registered",
            render: (u) => (
              <span className="text-xs text-[#65717B] font-mono-numbers">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (u) => (
              <div className="flex items-center gap-1.5">
                <Link
                  to={`/manage/customers/${u._id}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DFDED7] bg-white text-[#65717B] hover:bg-[#F7F7F2] hover:text-[#B9965B] hover:border-[#B9965B]/30 transition shadow-xs cursor-pointer"
                  title="View customer details"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                {has("users.edit") && (
                  <button
                    onClick={() => setEdit({ ...u })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#DFDED7] bg-white text-[#65717B] hover:bg-[#FEF8ED] hover:text-[#B98235] hover:border-[#B98235]/30 transition shadow-xs cursor-pointer"
                    title="Edit customer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                {has("users.edit") && (
                  <button
                    onClick={() => setNote({ id: u._id, text: "" })}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#F4EFE6] bg-[#EAF5F0] text-[#3E8066] hover:bg-[#d8eedf] transition shadow-xs cursor-pointer"
                    title="Add customer note"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ),
          },
        ]}
        rows={rows}
      />

      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      {/* Edit Customer Drawer Modal */}
      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Edit Customer Profile"
        subtitle="Manage customer contact details and operational account status"
      >
        {edit && (
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#F4EFE6]/40 to-transparent rounded-2xl border border-[#F4EFE6]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#B9965B] text-white font-bold text-sm">
                {edit.name?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-[#17232F] truncate">{edit.name}</p>
                <p className="text-xs text-[#65717B] truncate">{edit.email}</p>
              </div>
            </div>

            <FormSection
              icon={User}
              title="Customer Contact"
              description="Primary personal identity and phone details"
            >
              <div className="space-y-3">
                <Field label="Full Name" required>
                  <input
                    required
                    className={inputCls}
                    value={edit.name}
                    onChange={(e) => setEdit({ ...edit, name: e.target.value })}
                  />
                </Field>

                <Field label="Phone Number">
                  <input
                    className={inputCls}
                    placeholder="+91 98765 43210"
                    value={edit.phone || ""}
                    onChange={(e) => setEdit({ ...edit, phone: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={Shield}
              title="Account Status"
              description="Manage portal access and account restrictions"
            >
              <Field label="Operational Status" required>
                <select
                  className={inputCls}
                  value={edit.status}
                  onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
            </FormSection>

            <FormActions
              onCancel={() => setEdit(null)}
              submitLabel="Save Changes"
              loading={saving}
              cancelLabel="Cancel"
            />
          </form>
        )}
      </Modal>

      {/* Add Customer Note Drawer Modal */}
      <Modal
        open={!!note.id}
        onClose={() => setNote({ id: null, text: "" })}
        title="Add Customer Note"
        subtitle="Log internal follow-up remarks or interaction notes"
      >
        <form onSubmit={saveNote} className="space-y-4">
          <FormSection
            icon={FileText}
            title="Interaction Note"
            description="Audit record visible to managers and staff"
          >
            <Field label="Note Details" required hint="Max 500 characters">
              <textarea
                required
                className={`${inputCls} resize-none`}
                rows={4}
                value={note.text}
                onChange={(e) => setNote({ ...note, text: e.target.value })}
                placeholder="Enter details regarding phone inquiry, requirements, or meeting outcome..."
              />
            </Field>
          </FormSection>

          <FormActions
            onCancel={() => setNote({ id: null, text: "" })}
            submitLabel="Save Note"
            loading={saving}
            cancelLabel="Cancel"
          />
        </form>
      </Modal>
    </div>
  );
}
