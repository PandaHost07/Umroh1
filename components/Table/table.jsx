"use client";

import { Pagination, Dropdown, Card, Button, Spinner, Progress, Modal } from "flowbite-react";
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from "flowbite-react";
import { FaFilePdf, FaFileExcel, FaTrashAlt, FaPen, FaEye, } from "react-icons/fa";
import { BiSortAlt2 } from "react-icons/bi";
import { useState, useEffect } from "react";
import formatCurrency from "../Currency/currency";
import formatDate from "../Date/formatDate";
import { useTheme } from "next-themes";
import formatStatus from "../Status/status";
import { exportToPDF} from "../PDF/exportPdf";
import { exportToExcel } from "../PDF/exportExcel";

import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFPrint from "../PDF/print";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const getColumns = (item) => (item ? Object.keys(item) : []);

export function TableComponent({ data, searchColumn = "", showFunct = null, delFunct = null, editFunct = null, }) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState("no");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchCategory, setSearchCategory] = useState(searchColumn);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const { theme } = useTheme();
  const isFunct = showFunct || delFunct || editFunct;

  const [mounted, setMounted] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    setMounted(true);
    setSearch("");
  }, [data]);

  if (!mounted) {
    return null;
  }
  const filteredData =
    Array.isArray(data) && 
    data.filter((item) => {
      const value = item[searchCategory];
      const valueToSearch = value ? String(value).toLowerCase() : "";
      return valueToSearch.includes(search.toLowerCase());
    });

  const sortedData =
    Array.isArray(filteredData) &&
    [...filteredData].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];
      return sortDirection === "asc"
        ? typeof valueA === "string"
          ? valueA.localeCompare(valueB)
          : valueA - valueB
        : typeof valueA === "string"
          ? valueB.localeCompare(valueA)
          : valueB - valueA;
    });

  const currentItems =
    Array.isArray(sortedData) &&
    sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

  const handleSort = (column) => {
    if (column === "no") {
      setSortColumn("no");
      setSortDirection("asc");
    } else {
      setSortColumn(column);
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Toggle modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handlePrintPDF = async () => {
    const element = pdfRef.current;

    // Tunggu sedikit agar DOM stabil (100ms)
    await new Promise((resolve) => setTimeout(resolve, 100));
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("laporan.pdf");
  };


  const handlePrintExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan");

    // Tambah header
    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key.toUpperCase(),
      key: key,
      width: 20,
    }));

    // Tambah data
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "laporan.xlsx");
  };

  return (
    <div className="p-1 mt-10 my-6">
      {data ? (
        <>

          {/* BUTTON PRINT */}
          <div className="flex mb-5 md:mb-10 space-x-4">
            <Button color={theme == "dark" ? "dark" : "failure"} className="rounded-md" onClick={ () =>  exportToPDF(data) } >
              <FaFilePdf size={20} />
              <div className="my-auto ms-4">PDF</div>
            </Button>
            <Button color={theme == "dark" ? "dark" : "success"} className="rounded-md" onClick={ () => exportToExcel(data) } >
              <FaFileExcel size={20} />
              <div className="my-auto ms-4">Excel</div>
            </Button>
          </div>

          <div className="flex flex-col-reverse md:flex-row mb-4 md:justify-between md:items-center">
            {/* Show Item Per Page */}
            <div className="flex items-center space-x-3 mt-3 md:mt-0">
              <Dropdown
                label={`${itemsPerPage === data.length ? "All" : itemsPerPage}`}
                dismissOnClick={false}
                color="gray"
                className="rounded-sm border"
              >
                {[10, 20, 30, 50, data.length].map((value) => (
                  <Dropdown.Item
                    key={value}
                    onClick={() => handleItemsPerPageChange(value)}
                  >
                    {value === data.length ? "All" : value}
                  </Dropdown.Item>
                ))}
              </Dropdown>
              <div className="hidden lg:flex">Item Per Page</div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
              <Dropdown label="Search By" dismissOnClick={false} color={theme == "dark" ? "gray" : "info"}  >
                {getColumns(data[0]).map(
                  (col) =>
                    col !== "no" && (
                      <Dropdown.Item
                        key={col}
                        onClick={() => setSearchCategory(col)}
                        className={searchCategory === col ? "bg-gray-300" : ""}
                      >
                        {col.charAt(0).toUpperCase() + col.slice(1)}
                      </Dropdown.Item>
                    )
                )}
              </Dropdown>
              <input
                type="text"
                placeholder={`Search ${searchCategory}`}
                className="px-4 py-2 border border-gray-300 rounded dark:bg-gray-900 dark:border-gray-800"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {data.length != 0 ? (
            <>
              <div className="flex flex-col overflow-x-auto my-12 ">
                <Table striped >
                  <TableHead >
                    <TableHeadCell
                      onClick={() => handleSort("no")}
                      className="cursor-pointer w-10 bg-slate-200 dark:bg-gray-900"
                    >
                      NO
                    </TableHeadCell>
                    {getColumns(data[0]).map((col) => (
                      <TableHeadCell
                        key={col}
                        onClick={() => handleSort(col)}
                        className="cursor-pointer w-10 bg-slate-200 dark:bg-gray-900 text-nowrap"
                      >
                        {col.charAt(0).toUpperCase() + col.slice(1)}
                        {sortColumn === col && (
                          <BiSortAlt2 className="inline ml-2" size={18} />
                        )}
                      </TableHeadCell>
                    ))}
                    {isFunct && (
                      <TableHeadCell className="cursor-pointer w-10 bg-slate-200 dark:bg-gray-900" >
                        Action
                      </TableHeadCell>
                    )}
                  </TableHead>
                  <TableBody className="divide-y">
                    {Array.isArray(currentItems) && currentItems.map((item, index) => (
                      <TableRow key={index} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                        <TableCell>{index + 1}</TableCell>
                        {getColumns(item).map((col) => (
                          <TableCell key={col} className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                            {col == "image" ? (
                              <Button className=" rounded-sm" size="xs" color="dark" onClick={() => { setFileUrl(item[col]); toggleModal() }}>Lihat File</Button>
                            ) : col == "gambar" ? (
                              <img src={item[col] ? item[col] : "https://placehold.co/100x75?text=No+Image"} alt="Gambar" className="w-16 h-12 object-cover rounded shadow border cursor-pointer hover:scale-110 transition-transform" onClick={() => { if(item[col]){ setFileUrl(item[col]); toggleModal(); } }} />
                            ) : isValidDate(item[col]) ? (
                              formatDate(item[col], (col != "tglKeberangkatan" ? "long" : "short"))
                            ) : col == "harga" || col == "dp" || col == "nominal" ? (
                              <>{formatCurrency(item[col])}</>
                            ) : col == "status" ? (
                              <>{formatStatus(item[col])}</>
                            ) : col == "persentase" ? (
                              formatPersentase(item[col])
                            ) : (
                              item[col] ? String(item[col]) : "-"
                            )}
                          </TableCell>
                        ))}

                        {isFunct && (
                          <TableCell>
                            <div className="flex space-x-1">
                              {showFunct && (
                                <button className="bg-sky-700 text-white p-2"
                                  onClick={() => {
                                    showFunct(item);
                                  }}
                                >
                                  <FaEye size={15} />
                                </button>
                              )}
                              {editFunct && (
                                <button className="bg-green-500 text-white p-2"
                                  onClick={() => {
                                    editFunct(item);
                                  }}
                                >
                                  <FaPen size={15} />
                                </button>
                              )}
                              {delFunct && (
                                <button className="bg-red-700 text-white p-2"
                                  onClick={() => {
                                    delFunct(item);
                                  }}
                                >
                                  <FaTrashAlt size={15} />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <Card className="my-12">
              <div className="flex justify-center items-center p-7 font-medium text-gray-600">
                Tidak Ada Data
              </div>
            </Card>
          )}

          <Modal show={isModalOpen} onClose={toggleModal}>
            <Modal.Header>File Viewer</Modal.Header>
            <Modal.Body>
              <div className="flex justify-center items-center">
                {fileUrl == null ? ( <div className="h-96 items-center flex " >Tidak Ada File</div> ) : isImage(fileUrl) ? (
                  <img src={fileUrl} alt="File content" className="max-w-full h-auto" />
                ) : (
                  <iframe src={fileUrl} className="w-full h-96" title="File Viewer"></iframe>
                )}
              </div>
            </Modal.Body>
          </Modal>

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredData.length / itemsPerPage)}
            onPageChange={setCurrentPage}
            showIcons
            className="mt-4 flex justify-center"
          />
        </>
      ) : (
        <LoadingPage />
      )}
    </div>
  );
}

const LoadingPage = () => {
  return (
    <div>
      <Card>
        <div className="flex justify-center w-full my-5">
          <Spinner aria-label="Extra large spinner example" size="xl"></Spinner>
        </div>
      </Card>
    </div>
  );
};

const isValidDate = (dateString) => {
  if (typeof dateString !== "string") {
    return false;
  }
  // regular expression untuk memeriksa format ISO 8601 (yyyy-mm-ddThh:mm:ss.sssZ)
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
  if (!isoDatePattern.test(dateString)) {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

const isImage = (url) => {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
  const fileExtension = url.split('.').pop().toLowerCase();
  return imageExtensions.includes(fileExtension);
};

const formatPersentase = (persentase) => {
  return (<Progress
    progress={parseInt(persentase)}
    progressLabelPosition="inside"
    size="lg"
    labelProgress
  />
  )
}
