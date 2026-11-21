import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, User, Shield } from "lucide-react";
import api from "../../lib/adminApi";
import { DataTable, Pagination, Toolbar, Badge, statusTone, Modal, Field, inputCls, useConfirm, ConfirmDialog, FormSection, FormActions, Action3DButton, filterSelectCls } from "../components/ui";
import UserProfileDrawer from "../components/UserProfileDrawer";

export default function Users() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);
  const [viewUserId, setViewUserId] = useState(null);
  const confirm = useConfirm();

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get("/users", { params: { page, limit: 10, search, ...filters } });
      setRows(data.data); setMeta(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(() => load(1), 300); return () => clearTimeout(t); }, [search, filters]);

  const save = async (e) => {
    e.preventDefault();
    await api.put(`/users/${edit._id}`, { name: edit.name, phone: edit.phone, role: edit.role, status: edit.status });
    setEdit(null); load(meta.page);
  };

  return (
    <div>
      <Toolbar search={search} onSearch={setSearch}>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} className={filterSelectCls}>
          <option value="">All roles</option>
          {["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT", "STAFF", "CUSTOMER", "OWNER"].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={filterSelectCls}>
          <option value="">All statuses</option>
          <option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
        </select>
      </Toolbar>
      <DataTable loading={loading} columns={[
        { 
          key: "name", 
          label: "User", 
          render: (u) => (
            <div className="flex items-center gap-3">
              {u.profileImage ? (
                <img src={u.profileImage} className="h-8 w-8 rounded-full object-cover border border-[#DFDED7] shadow-xs" />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#F7F6F2] border border-[#DFDED7] text-xs font-bold text-[#B9965B] shadow-xs shrink-0">
                  {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                </span>
              )}
              <div className="leading-tight min-w-0">
                <p className="font-bold text-xs text-[#17232F] truncate">{u.name || "User"}</p>
                <p className="text-[11px] font-medium text-[#65717B] truncate">{u.email}</p>
              </div>
            </div>
          ) 
        },
        { key: "phone", label: "Phone", render: (u) => <span className="text-xs font-medium text-[#17232F]">{u.phone || "—"}</span> },
        { key: "role", label: "Role", render: (u) => <Badge value={u.role} tone="gold" /> },
        { key: "status", label: "Status", render: (u) => <Badge value={u.status} tone={statusTone(u.status)} /> },
        { key: "createdAt", label: "Registered", render: (u) => <span className="text-xs font-medium text-[#65717B]">{new Date(u.createdAt).toLocaleDateString()}</span> },
        { 
          key: "actions", 
          label: "Actions", 
          render: (u) => (
            <div className="flex items-center gap-1.5">
              <Action3DButton
                onClick={() => setViewUserId(u._id)}
                icon={Eye}
                title="View user profile"
              />
              <Action3DButton
                onClick={() => setEdit({ ...u })}
                icon={Pencil}
                title="Edit user"
              />
              <Action3DButton
                onClick={() => confirm.ask(async () => { await api.delete(`/users/${u._id}`); load(meta.page); }, `Delete user ${u.email}?`)}
                icon={Trash2}
                title="Delete user"
                variant="danger"
              />
            </div>
          ) 
        },
      ]} rows={rows} />
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={load} />

      <Modal 
        open={!!edit} 
        onClose={() => setEdit(null)} 
        title="Edit User Profile" 
        subtitle="Update profile credentials, security role and account permissions"
        size="md"
      >
        {edit && (
          <form onSubmit={save} className="space-y-4">
            {/* Header Mini Profile Pill */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-[#29374B] bg-[#172235] p-3.5 shadow-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1D2A3D] border border-[#29374B] text-base font-bold text-[#86A9D8] shadow-xs">
                {(edit.name?.[0] || edit.email?.[0] || "U").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[#F0F4FA]">{edit.name || "User"}</p>
                <p className="truncate text-xs text-[#9BA9BC]">{edit.email}</p>
              </div>
              <Badge value={edit.role} tone="blue" />
            </div>

            {/* Basic Info Section */}
            <FormSection icon={User} title="Contact Details" description="Full legal name and contact phone number">
              <Field label="Full Name" required>
                <input 
                  required 
                  className={inputCls} 
                  placeholder="e.g. Rahul Sharma"
                  value={edit.name} 
                  onChange={(e) => setEdit({ ...edit, name: e.target.value })} 
                />
              </Field>

              <Field label="Phone Number" hint="With country code">
                <input 
                  type="tel"
                  className={inputCls} 
                  placeholder="+91 98765 43210"
                  value={edit.phone || ""} 
                  onChange={(e) => setEdit({ ...edit, phone: e.target.value })} 
                />
              </Field>
            </FormSection>

            {/* Role & Access Section */}
            <FormSection icon={Shield} title="Role & Access Control" description="Platform permissions and account operational status">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Platform Role" required>
                  <select 
                    className={inputCls} 
                    value={edit.role} 
                    onChange={(e) => setEdit({ ...edit, role: e.target.value })}
                  >
                    {["SUPER_ADMIN", "ADMIN", "MANAGER", "AGENT", "STAFF", "CUSTOMER", "OWNER"].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Account Status" required>
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
              </div>
            </FormSection>

            <FormActions 
              onCancel={() => setEdit(null)} 
              submitLabel="Save Changes" 
            />
          </form>
        )}
      </Modal>
      <UserProfileDrawer
        userId={viewUserId}
        open={!!viewUserId}
        onClose={() => setViewUserId(null)}
        onEdit={(u) => {
          setViewUserId(null);
          setEdit({ ...u });
        }}
      />
      <ConfirmDialog open={confirm.open} onClose={confirm.close} onConfirm={confirm.confirm} message={confirm.message} />
    </div>
  );
}

