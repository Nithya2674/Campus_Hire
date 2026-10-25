import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import JobCard from '../../components/JobCard';
import SearchBar from '../../components/SearchBar';
import FilterPanel from '../../components/FilterPanel';
import Pagination from '../../components/Pagination';
import { JobCardSkeleton } from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import { Briefcase, SlidersHorizontal } from 'lucide-react';

export const JobListingsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [eligibilityMap, setEligibilityMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ page: 1, limit: 9, total: 0, totalPages: 1 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filters state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState({
    location: searchParams.get('location') || '',
    jobType: searchParams.get('jobType') || '',
    skills: searchParams.get('skills') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    order: searchParams.get('order') || 'desc',
    page: parseInt(searchParams.get('page') || '1', 10),
  });

  // Fetch applied jobs if student is logged in
  useEffect(() => {
    const fetchApplied = async () => {
      if (isAuthenticated && user?.role === 'student') {
        try {
          const res = await api.get('/applications/mine');
          if (res.success && res.data?.applications) {
            const ids = new Set(res.data.applications.map((app) => app.jobId?._id));
            setAppliedJobIds(ids);
          }
        } catch {
          // Ignore
        }
      }
    };
    fetchApplied();
  }, [isAuthenticated, user]);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (filters.location) params.set('location', filters.location);
      if (filters.jobType) params.set('jobType', filters.jobType);
      if (filters.skills) params.set('skills', filters.skills);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.order) params.set('order', filters.order);
      params.set('page', filters.page.toString());
      params.set('limit', '9');

      // Update URL
      setSearchParams(params);

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.success && res.data) {
        setJobs(res.data.jobs || []);
        setMeta(res.meta || { page: 1, limit: 9, total: 0, totalPages: 1 });

        // If student, check eligibility for these jobs in parallel
        if (isAuthenticated && user?.role === 'student' && res.data.jobs) {
          const checkMap = {};
          await Promise.all(
            res.data.jobs.map(async (job) => {
              try {
                const elRes = await api.get(`/jobs/${job._id}/eligibility`);
                if (elRes.success && elRes.data) {
                  checkMap[job._id] = elRes.data;
                }
              } catch {
                // Ignore
              }
            })
          );
          setEligibilityMap(checkMap);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filters, isAuthenticated, user, setSearchParams]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      jobType: '',
      skills: '',
      sortBy: 'createdAt',
      order: 'desc',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Campus Placement Drives
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Explore Active Job Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search and apply directly to published placement drives from top hiring partners.
          </p>
        </div>

        <div className="w-full md:w-96">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            showFilterToggle
            isFilterOpen={showMobileFilters}
            onToggleFilter={() => setShowMobileFilters(!showMobileFilters)}
          />
        </div>
      </div>

      {/* Main Grid: Filters Sidebar + Job Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterPanel
            filters={filters}
            onChange={(newFilters) => setFilters({ ...newFilters, page: 1 })}
            onReset={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer / Toggle */}
        {showMobileFilters && (
          <div className="lg:hidden col-span-1 animate-fade-in">
            <FilterPanel
              filters={filters}
              onChange={(newFilters) => setFilters({ ...newFilters, page: 1 })}
              onReset={handleResetFilters}
            />
          </div>
        )}

        {/* Job Cards Section */}
        <div className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <JobCardSkeleton key={idx} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchJobs} />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No jobs matching your criteria"
              description="Try adjusting your search terms, changing the location filter, or resetting all filters."
              actionLabel="Clear Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isStudent={isAuthenticated && user?.role === 'student'}
                    hasApplied={appliedJobIds.has(job._id)}
                    eligibility={eligibilityMap[job._id]}
                  />
                ))}
              </div>

              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                limit={meta.limit}
                onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListingsPage;
