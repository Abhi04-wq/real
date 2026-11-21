import Base from "../../admin/pages/Properties";
import { useManage } from "../RequireManager";
export default function Properties() {
  const { has } = useManage();
  return <Base canCreate={false} canApprove={has("properties.approve")} canDelete={has("properties.delete")} canEdit={has("properties.edit")} />;
}

