import React from "react";

export default function Container({ children, className }) {
  return (
    <div
      className={`w-full py-16 px-3 lg:px-14 2xl:px-60 dark:text-black ${className}`}
    >
      {children}
    </div>
  );
}
