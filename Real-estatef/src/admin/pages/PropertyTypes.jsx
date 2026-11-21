import { useEffect, useState } from "react";
import api from "../../lib/adminApi";
import { uploadImages } from "../../lib/upload";
import { DataTable, Badge, statusTone, Modal, Field, inputCls, FormSection, FormActions } from "../components/ui";
import { Pencil, Trash2, Layers, Image, Upload, Plus } from "lucide-react";

export default function PropertyTypes() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const load = () => api.get("/property-types").then(({ data }) => setRows(data.data || []));
  useEffect(() => { load(); }, []);
  const save = async (e) => {
    e.preventDefault();
    if (form._id) await api.put(`/property-types/${form._id}`, form);
    else await api.post("/property-types", form);
    setForm(null); load();
  };
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadError("");
    try {
      const [url] = await uploadImages([file], "property-types");
      setForm({ ...form, image: url });
    } catch (err) {
      setUploadError(err.response?.data?.message || "Image upload failed");
    } finally { setUploading(false); }
  };
  return (
    <div>
      <button onClick={() => setForm({ name: "", description: "", image: "", status: "active" })} className="mb-4 flex items-center gap-1.5 rounded-xl bg-[#B9965B] hover:bg-[#a6844d] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer whitespace-nowrap"><Plus className="h-3.5 w-3.5" /><span>Add Type</span></button>
      <DataTable columns={[
        { key: "name", label: "Category", render: (t) => <div className="flex items-center gap-2">{t.image ? <img src={t.image} className="h-8 w-8 rounded-lg object-cover border border-[#DFDED7]" /> : <span className="h-8 w-8 rounded-lg bg-[#F7F6F2] border border-[#DFDED7]" />}<span className="font-semibold text-xs text-[#17232F]">{t.name}</span></div> },
        { key: "description", label: "Description", render: (t) => <span className="text-xs text-[#65717B]">{t.description || "—"}</span> },
        { key: "propertyCount", label: "Properties", render: (t) => <span className="text-xs font-mono font-bold text-[#B9965B]">{t.propertyCount || 0}</span> },
        { key: "status", label: "Status", render: (t) => <Badge value={t.status} tone={statusTone(t.status)} /> },
        { key: "actions", label: "Actions", render: (t) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setForm({ ...t })}
              title="Edit type"
              aria-label="Edit property type"
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#DFDED7] bg-[#F7F6F2] text-[#65717B] hover:bg-[#F0EFE9] hover:text-[#B9965B] transition shadow-xs cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => api.delete(`/property-types/${t._id}`).then(load)}
              title="Delete type"
              aria-label="Delete property type"
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
        title={form?._id ? "Edit Property Category" : "Add Property Category"}
        subtitle="Manage classification taxonomy, icon asset, and active display status"
        size="md"
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <FormSection icon={Layers} title="Category Specifications" description="Public label, description, and visibility state">
              <Field label="Category Name" required>
                <input 
                  required 
                  className={inputCls} 
                  placeholder="e.g. Luxury Apartment / Villa / Commercial Office"
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </Field>

              <Field label="Description">
                <input 
                  className={inputCls} 
                  placeholder="Short explanation for customer filter tooltips"
                  value={form.description || ""} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                />
              </Field>

              <Field label="Display Status" required>
                <select 
                  className={inputCls} 
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active (Visible in searches)</option>
                  <option value="inactive">Inactive (Hidden)</option>
                </select>
              </Field>
            </FormSection>

            <FormSection icon={Image} title="Category Visual Asset" description="Illustration or representative image badge">
              <Field label="Category Badge / Photo">
                <div className="flex items-center gap-4">
                  {form.image ? (
                    <div className="relative group">
                      <img src={form.image} className="h-16 w-16 rounded-2xl object-cover border border-[#E4E7E5] shadow-xs" />
                      <button 
                        type="button" 
                        onClick={() => setForm({ ...form, image: "" })} 
                        className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-md hover:bg-rose-700 transition"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-[#E4E7E5] bg-[#F7F7F2] text-xs font-semibold text-[#6B746F]">
                      <Image className="h-6 w-6 text-[#A0A9A4]" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-xl border border-[#E4E7E5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C2421] shadow-2xs hover:bg-[#F7F7F2] hover:border-[#176B5B]/30 transition">
                      <Upload className="h-3.5 w-3.5 text-[#176B5B]" />
                      <span>{uploading ? "Uploading Image..." : "Upload Category Photo"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={uploading} />
                    </label>
                    <p className="text-[11px] text-[#6B746F]">Recommended PNG/JPG with square 1:1 aspect ratio</p>
                  </div>
                </div>
                {uploadError && <p className="mt-1 text-xs text-rose-600 font-semibold">{uploadError}</p>}
              </Field>
            </FormSection>

            <FormActions 
              onCancel={() => setForm(null)} 
              submitLabel={form._id ? "Update Category" : "Create Category"} 
            />
          </form>
        )}
      </Modal>
    </div>
  );
}

