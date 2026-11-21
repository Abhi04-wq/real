import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { DataTable, Badge, statusTone, Modal, Field, inputCls, FormSection, FormActions } from "../components/ui";
import { ShieldCheck, Trash2, Shield, Key } from "lucide-react";

export default function Roles() {
  const [rows, setRows] = useState([]);
  const [perms, setPerms] = useState([]);
  const [form, setForm] = useState(null);
  const load = () => api.get("/roles").then(({ data }) => { setRows(data.data); setPerms(data.permissions); });
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    if (form._id) await api.put(`/roles/${form._id}`, form);
    else await api.post("/roles", form);
    setForm(null); load();
  };
  const toggle = (p) => setForm({ ...form, permissions: form.permissions?.includes(p) ? form.permissions.filter((x) => x !== p) : [...(form.permissions || []), p] });
  return (
    <div>
      <button onClick={() => setForm({ name: "", description: "", permissions: [], status: "active" })} className="mb-4 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer">+ Create Role</button>
      <DataTable columns={[
        { key: "name", label: "Role", render: (r) => <span className="font-semibold text-xs text-[#17232F]">{r.name}</span> },
        { key: "description", label: "Description", render: (r) => <span className="text-xs text-[#65717B]">{r.description || "—"}</span> },
        { key: "permissions", label: "Permissions", render: (r) => <span className="text-xs text-[#65717B] font-mono">{r.permissions?.slice(0, 5).join(", ")}{r.permissions?.length > 5 ? ` +${r.permissions.length - 5}` : ""}</span> },
        { key: "userCount", label: "Users", render: (r) => <span className="text-xs font-mono font-bold text-[#B9965B]">{r.userCount || 0}</span> },
        { key: "actions", label: "Actions", render: (r) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setForm({ ...r })}
              title="Manage permissions"
              aria-label="Manage permissions"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#B9965B] transition shadow-xs cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => api.delete(`/roles/${r._id}`).then(load)}
              title="Delete role"
              aria-label="Delete role"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#B85C56]/30 bg-[#FDF0EE] text-[#B85C56] hover:bg-[#FBE4E2] transition shadow-xs cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ) },
      ]} rows={rows} />
      <Modal 
        open={!!form} 
        onClose={() => setForm(null)} 
        title={form?._id ? "Edit Role & Permissions" : "Create Security Role"} 
        subtitle="Configure system authority, access scopes, and granular administrative privileges"
        wide
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <FormSection icon={Shield} title="Role Identity" description="Role name and high-level responsibility summary">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Role Name" required>
                  <input 
                    required 
                    className={inputCls} 
                    placeholder="e.g. Finance Auditor / Regional Manager"
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  />
                </Field>
                <Field label="Description">
                  <input 
                    className={inputCls} 
                    placeholder="Brief description of responsibilities"
                    value={form.description || ""} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection 
              icon={Key} 
              title="Assigned Privileges" 
              description={`Selected: ${(form.permissions || []).length} of ${perms.length} privileges`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {perms.map((p) => {
                  const isChecked = form.permissions?.includes(p);
                  return (
                    <label 
                      key={p} 
                      className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-semibold cursor-pointer transition select-none ${
                        isChecked 
                          ? "border-[#86A9D8] bg-[#86A9D8]/15 text-[#86A9D8] shadow-2xs" 
                          : "border-[#29374B] bg-[#172235] text-[#9BA9BC] hover:border-[#86A9D8]/40 hover:text-[#F0F4FA]"
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded accent-[#86A9D8] cursor-pointer"
                        checked={isChecked} 
                        onChange={() => toggle(p)} 
                      />
                      <span className="truncate">{p}</span>
                    </label>
                  );
                })}
              </div>
            </FormSection>

            <FormActions 
              onCancel={() => setForm(null)} 
              submitLabel={form._id ? "Update Role" : "Create Role"} 
            />
          </form>
        )}
      </Modal>
    </div>
  );
}

