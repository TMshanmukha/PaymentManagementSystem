import { createContext, useContext, useState, useEffect } from 'react';
import { academicYearApi } from '../services/academicYear.service.js';
import { AuthContext } from './AuthContext.jsx';

const AcademicYearContext = createContext(null);

export function AcademicYearProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [academicYears, setAcademicYears] = useState([]);
  const [currentYear, setCurrentYear] = useState(null);
  const [selectedYearId, setSelectedYearIdState] = useState(() => {
    return localStorage.getItem('selected_academic_year_id') || '';
  });
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const [listRes, curRes] = await Promise.all([
        academicYearApi.list(),
        academicYearApi.current(),
      ]);
      const years = listRes.data.data;
      const active = curRes.data.data;
      
      setAcademicYears(years);
      setCurrentYear(active);
      
      const storedId = localStorage.getItem('selected_academic_year_id');
      const hasStored = years.some(y => String(y.id) === String(storedId));
      if (!storedId || !hasStored) {
        if (active) {
          setSelectedYearIdState(String(active.id));
          localStorage.setItem('selected_academic_year_id', String(active.id));
        }
      }
    } catch (err) {
      console.error('Failed to load academic years', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [user]);

  function changeSelectedYear(id) {
    setSelectedYearIdState(String(id));
    localStorage.setItem('selected_academic_year_id', String(id));
    window.location.reload();
  }

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        currentYear,
        selectedYearId,
        changeSelectedYear,
        refreshAcademicYears: load,
        loading,
      }}
    >
      {!loading && children}
    </AcademicYearContext.Provider>
  );
}

export function useAcademicYear() {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error('useAcademicYear must be used within AcademicYearProvider');
  }
  return context;
}
