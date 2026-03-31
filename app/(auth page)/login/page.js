"use client";

import { signIn, useSession } from "next-auth/react";
import LoginImage from "../../../public/login.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { data } = useSession();

  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (data) {
      router.push(`/${data.user.role}`);
    }
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email != "" && password != "") {
      setLoading(true);

      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        } else {
          const response = await fetch("/api/auth/session");
          const session = await response.json();

          if (session.user.role) {
            setLoading(false);
            router.push(`/${session.user.role}`);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    } else {
      setError("Harap Isi Semua Bagian");
    }
  };

  return (
    <div className="absolute flex h-full w-full">
      <div className="sm:flex h-full w-1/2 hidden">
        <Image
          src={LoginImage}
          alt="Login Image"
          width="0"
          height="0"
          priority={true}
          className="lg:w-full"
        />
      </div>
      <div className="flex w-full h-full sm:w-1/2 justify-center px-5 pt-14 sm:px-7 sm:items-center sm:p-0">
        <form
          method="post"
          onChange={() => {
            setError("");
          }}
          onSubmit={handleSubmit}
          className="text-center text-black w-full sm:w-3/4"
        >
          <label
            htmlFor="#"
            className="flex pb-5 text-2xl font-semibold justify-center sm:justify-start"
          >
            LOGIN AKUN
          </label>
          <div className="flex text-[#8692A6] w-full text-sm sm:text-lg sm:text-left sm:justify-start">
            Selamat Datang Di ADA Tour & Travel <br />
            Anda harus Login agar bisa mengakses Halaman
          </div>
          <hr className="my-2" />
          <div className="flex flex-col mb-3">
            <label htmlFor="#" className="flex w-full py-1 text-[#696F79]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="bg-white border-[#8692A6] border text-black-900 text-sm rounded-md focus:outline-none focus:border-[#2B458D] focus:ring-1 focus:shadow-md block w-full p-3 "
              placeholder="Email"
              required
              autoComplete="email"
            />
          </div>
          <div className="flex flex-col mb-3">
            <label htmlFor="#" className="flex w-full py-1 text-[#696F79]">
              Password
            </label>
            <div className="relative border ">
              <input
                onChange={(e) => setPassword(e.target.value)}
                type={showpassword ? "text" : "password"}
                placeholder="Password"
                className="bg-white border-[#8692A6] border text-black-900 text-sm rounded-md focus:outline-none focus:border-[#2B458D] focus:ring-1 focus:shadow-md block w-full p-3 "
                required
                autoComplete="password"
              />
              <svg
                className="absolute top-[25%] left-[90%]"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                onClick={(e) => setShowpassword(!showpassword)}
                style={{ cursor: "pointer" }}
              >
                {/* Eye Icon */}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 5C15.87 5 19.5266 7.91102 21.5694 12C19.5266 16.089 15.87 19 12 19C8.13002 19 4.47341 16.089 2.43057 12C4.47341 7.91102 8.13002 5 12 5ZM12 7C9.77384 7 7.82005 8.5179 6.61348 11.1034L6.58579 11.2197L7.41421 12.0492L7.42572 12.0606L12 16.635L16.5743 12.0606L16.5858 12.0492L17.4142 11.2197L17.3865 11.1034C16.1799 8.5179 14.2262 7 12 7ZM12 9C13.1046 9 14 9.89543 14 11C14 12.1046 13.1046 13 12 13C10.8954 13 10 12.1046 10 11C10 9.89543 10.8954 9 12 9ZM12 15C14.0711 15 15.7851 13.355 16.5625 12C15.7851 10.645 14.0711 9 12 9C9.92893 9 8.21493 10.645 7.4375 12C8.21493 13.355 9.92893 15 12 15Z"
                  fill="black"
                />
                {/* Slash Icon */}
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.29289 1.29289C0.902368 1.68342 0.902368 2.31658 1.29289 2.70711L22.2929 23.7071C22.6834 24.0976 23.3166 24.0976 23.7071 23.7071C24.0976 23.3166 24.0976 22.6834 23.7071 22.2929L2.70711 1.29289C2.31658 0.902368 1.68342 0.902368 1.29289 1.29289Z"
                  fill="black"
                  style={{ visibility: showpassword ? "visible" : "hidden" }}
                />
              </svg>
            </div>
          </div>

          <div className="py-2 text-red-500 font-medium">
            {error ? <>{error}</> : <></>}
          </div>

          <button
            type="submit"
            className="text-white mt-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md w-full px-5 py-2.5 text-center "
            disabled={loading ? true : false}
          >
            {loading ? (
              <div>
                Loading
                <svg
                  aria-hidden="true"
                  className="ml-2 inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : (
              "LOGIN"
            )}
          </button>

          <div className="flex w-full pt-6 justify-center">
            <a href="/forget-password" className="ms-1 text-blue-700">
              Lupa Password ?
            </a>
          </div>

          <div className="flex w-full pt-2 justify-center">
            Belum Punya Akun ?
            <a href="/register" className="ms-1 text-blue-700">
              Sign Up
            </a>
          </div>
          <div className="uppercase mt-2 text-blue-500">
            <a href="/">Kembali Ke Website</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginComponent;
