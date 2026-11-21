import Base from "../../admin/pages/Leads";
import { useManage } from "../RequireManager";
export default function Leads() {
  const { has } = useManage();
  return <Base canCreate={has("leads.create")} canEdit={has("leads.edit")} canDelete={has("leads.delete")} canConvert={has("leads.convert") || has("leads.edit")} canNote={has("leads.note") || has("leads.edit")} />;
}
