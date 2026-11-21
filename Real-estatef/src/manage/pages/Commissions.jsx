import Base from "../../admin/pages/Commissions";
import { useManage } from "../RequireManager";
export default function Commissions() {
  const { has } = useManage();
  return <Base canManage={has("transactions.manage")} />;
}
