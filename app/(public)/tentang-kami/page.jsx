"use client"
import { useEffect, useState, useRef } from 'react'
import Container from '@/components/Container/container'
import Skeleton from '@/components/Skeleton/skeleton'
import { ListGroup, ListGroupItem, Card } from 'flowbite-react'
import Image from 'next/image'

export default function Page() {
    const [perusahaan, setperusahaan] = useState(null);
    const [activeSection, setActiveSection] = useState("logo");

    const logoRef = useRef(null);
    const descRef = useRef(null);
    const locationRef = useRef(null);
    const sosmedRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/akses/getData?model=Perusahaan`);
            const resJson = await res.json();
            setperusahaan(resJson[0]);
        };
        fetchData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + 300;

            const sections = [
                { id: "logo", ref: logoRef },
                { id: "desc", ref: descRef },
                { id: "location", ref: locationRef },
                { id: "sosmed", ref: sosmedRef }
            ];

            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.ref.current && scrollPos >= section.ref.current.offsetTop) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <Container className={` bg-slate-100`} >
            <div className="flex pb-10 text-3xl font-semibold justify-center md:justify-start">
                Tentang Kami
            </div>
            <div className='grid grid-cols-5 gap-4'>
                <div className='col-span-5 md:col-span-1'>
                    <div className="sticky top-20">
                        <ListGroup className="w-full">
                            <ListGroupItem
                                href='#logo'
                                active={activeSection === 'logo'}
                                onClick={() => scrollToSection(logoRef)}
                            >
                                Logo
                            </ListGroupItem>
                            <ListGroupItem
                                href='#desc'
                                active={activeSection === 'desc'}
                                onClick={() => scrollToSection(descRef)}
                            >
                                Deskripsi Perusahaan
                            </ListGroupItem>
                            <ListGroupItem
                                href='#location'
                                active={activeSection === 'location'}
                                onClick={() => scrollToSection(locationRef)}
                            >
                                Lokasi
                            </ListGroupItem>
                            <ListGroupItem
                                href='#sosmed'
                                active={activeSection === 'sosmed'}
                                onClick={() => scrollToSection(sosmedRef)}
                            >
                                Social Media
                            </ListGroupItem>
                        </ListGroup>
                    </div>
                </div>
                <div className='col-span-5 md:col-span-4 border p-6 space-y-20 bg-white'>
                    <div ref={logoRef} id='logo'>
                        <div className='text-xl font-semibold mb-2'>Logo</div>
                        <div className='flex w-full justify-center mb-10'>
                            {perusahaan ? (
                                <Image
                                    src={perusahaan.image}
                                    alt="logo"
                                    width={200}
                                    height={0}
                                    priority={true}
                                    className="h-auto"
                                />
                            ) : (
                                <Skeleton.Circle width="300px" />
                            )}
                        </div>
                    </div>

                    <div ref={descRef} id='desc'>
                        <div className='text-xl font-semibold mb-2'>Deskripsi Perusahaan</div>
                        {
                            perusahaan && (
                                <div
                                    dangerouslySetInnerHTML={{ __html: perusahaan.deskripsi }}
                                    className="space-y-3"
                                />
                            )
                        }
                    </div>

                    <div ref={locationRef} id='location'>
                        <div className='text-xl font-semibold mb-2'>Lokasi</div>
                        <div className="grid grid-cols-1 gap-10 p-3 md:mb-8 mt-5">
                            <div className="flex shadow-md">
                                <div className="h-72 w-full">
                                    {perusahaan && perusahaan.maps ? (
                                        <iframe
                                            title="Google Maps"
                                            src={perusahaan.embededMaps}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <Skeleton.Image className={`w-full h-96`} />
                                    )}
                                </div>
                            </div>

                            <Card className="shadow-md p-6 bg-white dark:bg-white dark:border-none ">
                                {perusahaan ? (
                                    <>
                                        <div className="mb-2">
                                            <strong>Alamat:</strong>
                                            <p> {perusahaan?.lokasi}</p>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Jam Operasional:</strong>
                                            <p>{perusahaan?.jam}</p>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Email:</strong>
                                            <p>{perusahaan?.email}</p>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Whatssapp</strong>
                                            <p>{perusahaan?.whatssapp}</p>
                                        </div>
                                    </>
                                ) : (
                                    <Skeleton.MultipleLines sumLine="8" />
                                )}
                            </Card>
                        </div>
                    </div>

                    <div ref={sosmedRef} id='sosmed'>
                        <div className='text-xl font-semibold mb-7'>Social Media</div>
                        <Card className="shadow-md p-6 bg-white dark:bg-white dark:border-none ">
                            {perusahaan ? (
                                <>
                                    <div className="mb-2">
                                        <strong>Alamat:</strong>
                                        <p> {perusahaan?.lokasi}</p>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Jam Operasional:</strong>
                                        <p>{perusahaan?.jam}</p>
                                    </div>
                                </>
                            ) : (
                                <Skeleton.MultipleLines sumLine="8" />
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </Container>
    )
}
