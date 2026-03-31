"use client"
import Container from "@/components/Container/container"
import { ListGroup, ListGroupItem, Card, Spinner } from "flowbite-react"
import { FaStar } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { getData } from "@/lib/CRUD";
import formatDate from "@/components/Date/formatDate";

const customCardTheme = {
    root: {
        children: "flex h-full flex-col justify-center gap-4 p-4"
    },
};

export default function Page() {
    const [option, setOption] = useState("All")
    const [testimoni, setTestimoni] = useState(null)

    useEffect(() => {
        const fetching = async () => {
            const getTestimoni = await getData("testimoni")
            if (getTestimoni) setTestimoni(getTestimoni)
        };

        fetching();
    }, []);

    const filtered = option != "All" ?
                    (testimoni.length != 0 &&
                        testimoni.filter(item => item.rating === option))
                    : testimoni;


    return (
        <Container>
            <div className="flex pb-10 text-3xl font-semibold justify-center md:justify-start">
                Testimoni Jamaah
            </div>
            <div className="p-5 border">
                <div className='grid grid-cols-5 gap-4'>
                    <div className='col-span-5 md:col-span-1'>
                        <div className="sticky top-20">
                            <ListGroup className="w-full">
                                <ListGroupItem active={option == "All"} onClick={() => { setOption("All") }} >
                                    Semua
                                </ListGroupItem>
                                {[5, 4, 3, 2, 1].map((num, i) =>
                                    <ListGroupItem key={i} active={option == num} onClick={() => { setOption(num) }} >
                                        {[...Array(num)].map((e, i) => <FaStar key={i} className=" text-yellow-300" size={16} />)}
                                    </ListGroupItem>
                                )}
                            </ListGroup>
                        </div>
                    </div>
                    <div className='col-span-5 md:col-span-4 space-y-10'>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {testimoni ? filtered.map((item, i) =>
                                <Card theme={customCardTheme} key={i}>
                                    <h5 className="text-lg capitalize font-bold tracking-tight text-gray-900 dark:text-white">
                                        {item.judul}
                                    </h5>
                                    <div className="flex" >
                                        {[...Array(item.rating)].map((e, i) => <FaStar key={i} className=" text-yellow-300" size={16} />)}
                                    </div>
                                    <p className="font-normal text-sm text-gray-700 dark:text-gray-400">
                                        {item.deskripsi}
                                    </p>
                                    <div className="uppercase font-semibold text-sm " >
                                        {item.nama} - {formatDate(item.tanggal, "short")}
                                    </div>
                                </Card>
                            ) : (<Spinner />)}
                        </div>

                    </div>
                </div>
            </div>
        </Container>
    )
}
