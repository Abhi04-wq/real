import Base from "../../admin/pages/Agents";
import { useManage } from "../RequireManager";
export default function Agents() {
  const { has } = useManage();
  return <Base canCreate={false} canEdit={has("users.edit")} canDelete={has("users.delete")} />;
}

