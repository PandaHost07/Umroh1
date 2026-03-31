"use client";
import { useState } from "react";

export default function Tabs({ Menu = [] }) {
  const [open, setopen] = useState(0);
  return (
    <div>
      <div className="overflow-x-auto whitespace-nowrap flex px-6 pt-3 bg-prime text-white dark:bg-gray-900">
        {Menu.map((e, i) => {
          return (
            <div
              key={i}
              onClick={() => {
                setopen(i);
              }}
              className={` ${i == open
                ? "bg-white text-prime border border-b-0 dark:bg-slate-800 dark:border-slate-800 border-blue-300 dark:text-gray-300 "
                : "bg-prime text-white hover:bg-sky-800 transition-colors duration-200 dark:bg-gray-900 dark:text-gray-300 "
                } p-2 rounded-t-lg px-4  font-semibold cursor-pointer`}
            >
              {e.title}
            </div>
          );
        })}
      </div>
      <div className="md:p-6 p-3 bg-white border border-t-0 shadow-md dark:bg-slate-800 dark:border-dark-prime">
        {Menu[open].component}
      </div>
    </div>
  );
}
