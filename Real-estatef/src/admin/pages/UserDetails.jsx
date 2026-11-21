import { useParams, useNavigate } from "react-router-dom";
import UserProfileDrawer from "../components/UserProfileDrawer";
import Users from "./Users";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      {/* Underlying Users table */}
      <Users />

      {/* Slide-over User Profile Drawer with proper design */}
      <UserProfileDrawer
        userId={id}
        open={Boolean(id)}
        onClose={() => navigate("/panel/users")}
      />
    </div>
  );
}
