import React, { useState, useMemo, useEffect } from 'react';
import Table from './components/table/Table';
import data from './DoxelAssessmentData.json';
import { debounce } from './utils/debounce';
import './App.css';

const DEBOUNCE_DELAY = 300;
const ASCENDING = 'asc';
const DESCENDING = 'desc';  

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'content', label: 'Content' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'instances', label: 'Instances' },
  { key: 'validated', label: 'Validated' },
  { key: 'inspected', label: 'Inspected' },
  { key: 'inspectTimestamp', label: 'Inspect Time' }
];

function initializeStateFromUrl({ defaultSortField = 'inspectTimestamp', defaultSortDirection = 'desc' }) {
  const params = new URLSearchParams(window.location.search);
  const urlFilterId = params.get('filter') || '';
  const urlSortField = params.get('sortField') || defaultSortField;
  const urlSortDirection = params.get('sortDirection') || defaultSortDirection;
  return { urlFilterId, urlSortField, urlSortDirection };
}

function transformData(data) {
  return data.map(item => ({
    ...item,
    inspected: item.metadata.inspected,
    inspectTimestamp: item.metadata.inspectTimestamp
  }));
};

const App = () => {
  const [filterId, setFilterId] = useState(() => initializeStateFromUrl({}).urlFilterId);
  const [sortField, setSortField] = useState(() => initializeStateFromUrl({}).urlSortField);
  const [sortDirection, setSortDirection] = useState(() => initializeStateFromUrl({}).urlSortDirection);

  const transformedData = useMemo(() => transformData(data), []);

  useEffect(() => {
    const params = new URLSearchParams();
    
    // Only add filter if it has a value
    if (filterId) {
      params.set('filter', filterId);
    }
    
    // Only add sort parameters if we're actually sorting
    if (sortField && sortDirection) {
      params.set('sortField', sortField);
      params.set('sortDirection', sortDirection);
    }

    // Only add query string if we have parameters
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  }, [filterId, sortField, sortDirection]);

  const handleFilterChange = debounce((value) => {
    setFilterId(value);
  }, DEBOUNCE_DELAY);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === ASCENDING ? DESCENDING : ASCENDING);
    } else {
      setSortField(field);
      setSortDirection(ASCENDING);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...transformedData];

    if (filterId) {
      result = result.filter(item => 
        item.id.toLowerCase().includes(filterId.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      let timeA, timeB;
      
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'validated':
          comparison = (a.validated === b.validated) ? 0 : a.validated ? -1 : 1;
          break;
        case 'content':
          comparison = a.content.localeCompare(b.content);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'instances':
          comparison = a.instances.length - b.instances.length;
          break;
        case 'inspected':
          comparison = (a.inspected === b.inspected) ? 0 : a.inspected ? -1 : 1;
          break;
        case 'inspectTimestamp':
          timeA = a.inspectTimestamp ? new Date(a.inspectTimestamp).getTime() : 0;
          timeB = b.inspectTimestamp ? new Date(b.inspectTimestamp).getTime() : 0;
          comparison = timeA - timeB;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transformedData, filterId, sortField, sortDirection]);

  return (
    <div className="app">
      <h1 className="title">Large Data Table</h1>
      <Table 
        data={filteredAndSortedData}
        columns={columns}
        filterId={filterId}
        onFilterChange={handleFilterChange}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />
    </div>
  );
};

export default App;