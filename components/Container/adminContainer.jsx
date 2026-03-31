import { Card } from "flowbite-react";

const customCardTheme = {
  root: {
    children: "flex h-full flex-col justify-center gap-4 p-3 md:p-6"
  },
};

export default function AdminContainer({ children }) {
  return (
    <Card theme={customCardTheme}>
      {children}
    </Card>
  );
}
