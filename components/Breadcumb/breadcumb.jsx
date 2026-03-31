"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Breadcrumb, Card } from "flowbite-react";
import Skeleton from "../Skeleton/skeleton";

export default function BreadcrumbComponent({ role = "admin" }) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState(null);

  useEffect(() => {
    const pathArray = pathname
      .replace(`/${role}`, "")
      .split("/")
      .filter((item) => item !== "");

    const breadcrumbLinks = pathArray.map((segment, index) => {
      const link = `/${role}/${pathArray.slice(0, index + 1).join("/")}`;
      return { label: segment.replace("-", " ").replace("_", " ").toLowerCase(), link };
    });

    setBreadcrumbs(breadcrumbLinks);
  }, [pathname, role]);

  if (breadcrumbs == null) {
    return (
      <div className="p-4 bg-white px-6 rounded-md shadow-lg dark:bg-gray-800 dark:text-gray-100 ">
        <Breadcrumb aria-label="Default breadcrumb example">
          <Breadcrumb.Item>
            <Skeleton.Line className={"w-32 rounded-md"}></Skeleton.Line>
          </Breadcrumb.Item>
        </Breadcrumb>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white px-6 rounded-md shadow-lg dark:bg-gray-800 dark:text-gray-100 ">
      <Breadcrumb aria-label="Default breadcrumb example">
        {breadcrumbs.length === 0 ? (
          <Breadcrumb.Item href={`/${role}`}>
            <div className=" text-base capitalize">Dashboard</div>
          </Breadcrumb.Item>
        ) : (
          breadcrumbs.map((breadcrumb, i) => (
            <Breadcrumb.Item key={i} href={breadcrumb.link}>
              <div className=" text-base capitalize">{breadcrumb.label}</div>
            </Breadcrumb.Item>
          ))
        )}
      </Breadcrumb>
    </div>
  );
}
