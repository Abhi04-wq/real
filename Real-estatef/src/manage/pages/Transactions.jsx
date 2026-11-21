import Base from "../../admin/pages/Transactions";
import { useManage } from "../RequireManager";
export default function Transactions() {
  const { has } = useManage();
  return <Base canManage={has("transactions.manage")} />;
}
