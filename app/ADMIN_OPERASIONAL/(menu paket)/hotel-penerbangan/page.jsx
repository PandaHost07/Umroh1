"use client";
import Tabs from "@/components/Tabs/tabs";
import AdminContainer from "@/components/Container/adminContainer";
import HotelPage from "./hotel";
import PenerbanganPage from "./penerbangan";

const menu = [
  {
    title: "Hotel",
    component: <HotelPage />
  },
  {
    title: "Penerbangan",
    component: <PenerbanganPage />
  }

 ]
export default function Page() {
  return (
    <AdminContainer>
      <Tabs Menu={menu} />
    </AdminContainer>
  )
}
