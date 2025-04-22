import React, { useState, useMemo, useRef, useEffect } from 'react';
import { debounce } from '../../utils/debounce';
import { isImageUrl, formatTimestamp, formatInstances } from '../../utils/formatting';
import './Table.css';

const MIN_ROW_HEIGHT = 60;

const Table = ({ 
  data,
  columns,
  bufferRows = 5,
  headerHeight = 60,
  filterId,
  onFilterChange,
  sortField,
  sortDirection,
  onSort
}) => {
  const [startIndex, setStartIndex] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [rowHeights, setRowHeights] = useState({});
  const tableBodyRef = useRef(null);
  const cellRefs = useRef({});

  useEffect(() => {
    if (tableBodyRef.current) {
      tableBodyRef.current.scrollTop = 0;
      setStartIndex(0);
    }
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      if (!tableBodyRef.current) return;
      
      const scrollTop = tableBodyRef.current.scrollTop;

      const avgRowHeight = Object.values(rowHeights).length > 0 
        ? Object.values(rowHeights).reduce((a, b) => a + b, 0) / Object.values(rowHeights).length
        : MIN_ROW_HEIGHT;
      
      // Calculate the first row index to render after moving past the buffer rows
      const firstRowIndex = Math.max(0, Math.floor((scrollTop - (bufferRows * avgRowHeight)) / avgRowHeight));
      
      setStartIndex(firstRowIndex);
    };

    const tableBody = tableBodyRef.current;
    if (!tableBody) return;

    tableBody.addEventListener('scroll', handleScroll);
    return () => {
      tableBody.removeEventListener('scroll', handleScroll);
    };
  }, [bufferRows, rowHeights]);

  useEffect(() => {
    const handleResize = debounce(() => {
      const newHeight = window.innerHeight;
      setViewportHeight(newHeight);
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const availableHeight = useMemo(() => {
    const tableContainer = tableBodyRef.current?.parentElement;
    if (!tableContainer) return viewportHeight - headerHeight;

    const tableTop = tableContainer.getBoundingClientRect().top;

    return viewportHeight - tableTop - headerHeight;
  }, [viewportHeight, headerHeight]);

  const rowsToRender = useMemo(() => {
    const avgRowHeight = Object.values(rowHeights).length > 0 
      ? Object.values(rowHeights).reduce((a, b) => a + b, 0) / Object.values(rowHeights).length
      : MIN_ROW_HEIGHT;
    
    // Calculate the number of rows to render based on the available height and the buffer rows
    const numRestOfRows = Math.ceil((availableHeight + (bufferRows * MIN_ROW_HEIGHT)) / avgRowHeight);
    
    return data.slice(startIndex, startIndex + numRestOfRows);
  }, [data, startIndex, availableHeight, rowHeights, bufferRows]);

  useEffect(() => {
    const newHeights = {};
    let hasChanges = false;

    Object.entries(cellRefs.current).forEach(([index, ref]) => {
      if (ref) {
        const height = ref.getBoundingClientRect().height;
        if (height > MIN_ROW_HEIGHT) {
          newHeights[index] = height;
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setRowHeights(prev => ({
        ...prev,
        ...newHeights
      }));
    }
  }, [startIndex, data.length]);

  const renderCellContent = (column, item, index) => {
    const content = (() => {
      switch (column.key) {
        case 'id':
          return item.id;
        case 'validated':
          return (
            <span className={`status-indicator ${item.validated ? 'validated' : 'not-validated'}`}>
              {item.validated ? '✓' : '✗'}
            </span>
          );
        case 'content':
          return isImageUrl(item.content) ? (
            <a 
              href={item.content} 
              target="_blank" 
              rel="noopener noreferrer"
              className="content-image-link"
            >
              <img 
                src={item.content} 
                alt="Content" 
                className="content-image"
              />
            </a>
          ) : (
            <span className="content-text">{item.content}</span>
          );
        case 'instances':
          return formatInstances(item.instances);
        case 'inspected':
          return (
            <span className={`status-indicator ${item.inspected ? 'validated' : 'not-validated'}`}>
              {item.inspected ? '✓' : '✗'}
            </span>
          );
        case 'inspectTimestamp':
          return formatTimestamp(item.inspectTimestamp);
        case 'quantity':
          return item.quantity;
        default:
          return null;
      }
    })();

    if (column.key === 'content' && isImageUrl(item.content)) {
      return content;
    }

    return (
      <div
        className="cell-content"
        ref={el => {
          cellRefs.current[index] = el;
        }}
      >
        {content}
      </div>
    );
  };

  const totalHeight = useMemo(() => {
    return data.reduce((acc, _, index) => {
      return acc + (rowHeights[index] || MIN_ROW_HEIGHT);
    }, 0);
  }, [data, rowHeights]);

  return (
    <div className="table-container">
      <div className="filter-container">
        <input
          type="text"
          placeholder="Filter by ID"
          defaultValue={filterId}
          onChange={(e) => onFilterChange(e.target.value)}
          className="filter-input"
        />
      </div>

      <div className="table-header" style={{ height: `${headerHeight}px` }}>
        {columns.map(column => (
          <div 
            key={column.key}
            className="table-header-cell"
            onClick={() => {
              if (sortField === column.key) {
                if (sortDirection === 'asc') {
                  onSort(column.key, 'desc');
                } else {
                  onSort(null, null);
                }
              } else {
                onSort(column.key, 'asc');
              }
            }}
          >
            <span>{column.label}</span>
            <span className="sort-arrow">
              {sortField === column.key && (sortDirection === 'asc' ? '↑' : '↓')}
            </span>
          </div>
        ))}
      </div>

      <div 
        ref={tableBodyRef}
        className="table-body"
      >
        <div
          style={{
            height: `${totalHeight}px` 
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: `${data.slice(0, startIndex).reduce((acc, _, index) => acc + (rowHeights[index] || MIN_ROW_HEIGHT), 0)}px`, // where to position visible rendered rows
              width: '100%'
            }}
          >
            {rowsToRender.map((item, index) => (
              <div 
                key={item.id} 
                className="table-row"
                style={{ 
                  height: `${rowHeights[startIndex + index] || MIN_ROW_HEIGHT}px`
                }}
              >
                {columns.map(column => (
                  <div 
                    key={column.key} 
                    className="table-cell"
                  >
                    {renderCellContent(column, item, startIndex + index)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table; 