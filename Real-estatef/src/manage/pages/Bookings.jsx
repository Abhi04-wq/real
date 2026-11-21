import Base from "../../admin/pages/Bookings";
import { useManage } from "../RequireManager";
export default function Bookings() {
  const { has } = useManage();
  return <Base canAssign={has("bookings.assign") || has("bookings.edit")} canApprove={has("bookings.approve") || has("bookings.edit")} />;
}
