import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";

export default function Holidays() {
  const router = useRouter();

const { year, province, page, search } = router.query;

    const [holidays, setHolidays] = useState([]);
    const [selectedYear, setSelectedYear] = useState(2024);
    const [selectedProvince, setSelectedProvince] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const holidaysPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");

    const provinces = [
        { code: "AB", name: "Alberta" },
        { code: "BC", name: "British Columbia" },
        { code: "MB", name: "Manitoba" },
        { code: "NB", name: "New Brunswick" },
        { code: "NL", name: "Newfoundland and Labrador" },
        { code: "NS", name: "Nova Scotia" },
        { code: "NT", name: "Northwest Territories" },
        { code: "NU", name: "Nunavut" },
        { code: "ON", name: "Ontario" },
        { code: "PE", name: "Prince Edward Island" },
        { code: "QC", name: "Quebec" },
        { code: "SK", name: "Saskatchewan" },
        { code: "YT", name: "Yukon" },
    ];

  const fetchHolidays = async (year, province) => {
    const response = await fetch(`https://canada-holidays.ca/api/v1/holidays?year=${year}`);
    const data = await response.json();

    // Filter holidays by selected province
    const filteredHolidays = province === "All"
        ? data.holidays
        : data.holidays.filter(holiday => 
            holiday.provinces.some(pr => pr.id === province)
        );

    setHolidays(filteredHolidays);
  };

  useEffect(() => {
    if (router.isReady) {
      if (router.query.year) {
      setSelectedYear(router.query.year);
      }
      if (router.query.province) {
      setSelectedProvince(router.query.province);
      }

      if (router.query.search) {
      setSearchQuery(router.query.search);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (router.isReady) {
      fetchHolidays(selectedYear, selectedProvince);
    }
  }, [router.isReady, router.query]);

    useEffect(() => {
      // Update the URL query parameters
      if (router.isReady) {
      router.push({
          pathname: router.pathname,
          query: { year: selectedYear, province: selectedProvince, page: currentPage, search: searchQuery },
      }, undefined, { scroll: false });
    }
  }, [selectedYear, selectedProvince, currentPage, searchQuery]);
    
    const handleYearChange = (e) => {
        setSelectedYear(parseInt(e.target.value));
        setCurrentPage(1);
    };

    const handleProvinceChange = (e) => {
        setSelectedProvince(e.target.value);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // Reset to the first page on search change
  };

    const filteredHolidays = useMemo(() => {
      return holidays.filter(holiday =>
          holiday.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
          holiday.nameFr.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [holidays, searchQuery]);    

    const indexOfLastHoliday = currentPage * holidaysPerPage;
    const indexOfFirstHoliday = indexOfLastHoliday - holidaysPerPage;
    const currentHolidays = filteredHolidays.slice(indexOfFirstHoliday, indexOfLastHoliday);
    const totalPages = Math.ceil(filteredHolidays.length / holidaysPerPage);

  return ( 
    <div>
      <style jsx>{`
        * {
          font-family: "Arial";
        }
        h1 {
          text-align: center;
          color: #333;
          margin-bottom: 20px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        th,
        td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        tr:hover {
          background-color: #f5f5f5;
        }

        th {
          background-color: #4caf50;
          color: white;
        }
      `}</style>
      <h1>Holidays </h1>

      <select id="year-filter" value={selectedYear} onChange={handleYearChange}>
                {Array.from({ length: 11 }, (_, index) => 2020 + index).map((year) => (
                    <option key={year} value={year}>
                        {year}
                    </option>
                ))}
        </select>

        <select id="province-filter" value={selectedProvince} onChange={handleProvinceChange}>
                <option value="All">All</option>
                {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                        {province.code}
                    </option>
                ))}
          </select>

          <input
                type="text"
                id="holiday-search"
                placeholder="Search holidays..."
                value={searchQuery}
                onChange={handleSearchChange}
            />

      <table id="holidays-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Name (FR)</th> 
            <th>Province(s)</th>
          </tr>
        </thead>
        <tbody>
          {currentHolidays.map((holiday) => (
            <tr key={holiday.id}>
              <td>{holiday.date}</td>
              <td>{holiday.nameEn}</td>
              <td>{holiday.nameFr}</td>
              <td>
                {holiday.federal
                  ? "Federal"
                  : holiday.provinces.map((pr) => pr.id).join(" ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
                <button
                    id="prev-page"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <button
                    id="next-page"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </button>
            </div>
    </div>
  ); 
}
