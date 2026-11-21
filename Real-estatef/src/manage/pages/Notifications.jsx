import Base from "../../admin/pages/Notifications";
import { useManage } from "../RequireManager";
export default function Notifications() {
  const { has } = useManage();
  return <Base canSend={has("notifications.send")} />;
}
