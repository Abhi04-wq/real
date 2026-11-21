import { Navigate } from "react-router-dom";

export default function AddProperty() {
  return <Navigate to="/home/my-properties?tab=post" replace />;
}
