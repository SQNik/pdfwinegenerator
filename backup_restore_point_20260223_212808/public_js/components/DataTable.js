/**
 * DataTable Component
 * Feature-rich table component with sorting, filtering, pagination
 */

class DataTable extends Component {
  constructor(options = {}) {
    super({
      columns: [],
      data: [],
      pageSize: 10,
      searchable: true,
      sortable: true,
      pagination: true,
      responsive: true,
      striped: true,
      hover: true,
      bordered: false,
      ...options
    });

    this.filteredData = [];
    this.currentPage = 1;
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.searchQuery = '';
  }

  async init() {
    this.filteredData = [...this.options.data];
  }

  render() {
    const container = this.createElement('div', {
      className: 'datatable-container'
    });

    // Search bar
    if (this.options.searchable) {
      const searchBar = this.renderSearchBar();
      container.appendChild(searchBar);
    }

    // Table
    const tableWrapper = this.createElement('div', {
      className: this.options.responsive ? 'table-responsive' : ''
    });

    const table = this.renderTable();
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    // Pagination
    if (this.options.pagination) {
      const pagination = this.renderPagination();
      container.appendChild(pagination);
    }

    return container;
  }

  renderSearchBar() {
    const searchBar = this.createElement('div', {
      className: 'datatable-search mb-3'
    });

    const input = this.createElement('input', {
      type: 'text',
      className: 'form-control',
      placeholder: 'Szukaj...'
    });

    input.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.applyFilters();
    });

    searchBar.appendChild(input);
    return searchBar;
  }

  renderTable() {
    const classes = ['table'];
    if (this.options.striped) classes.push('table-striped');
    if (this.options.hover) classes.push('table-hover');
    if (this.options.bordered) classes.push('table-bordered');

    const table = this.createElement('table', {
      className: classes.join(' ')
    });

    // Header
    const thead = this.renderTableHeader();
    table.appendChild(thead);

    // Body
    const tbody = this.renderTableBody();
    table.appendChild(tbody);

    return table;
  }

  renderTableHeader() {
    const thead = this.createElement('thead');
    const tr = this.createElement('tr');

    this.options.columns.forEach(column => {
      const th = this.createElement('th', {
        className: this.options.sortable && column.sortable !== false ? 'sortable' : ''
      });

      th.textContent = column.label;

      if (this.options.sortable && column.sortable !== false) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
          this.toggleSort(column.key);
        });

        // Sort indicator
        if (this.sortColumn === column.key) {
          const icon = this.createElement('i', {
            className: `bi bi-arrow-${this.sortDirection === 'asc' ? 'up' : 'down'} ms-1`
          });
          th.appendChild(icon);
        }
      }

      tr.appendChild(th);
    });

    thead.appendChild(tr);
    return thead;
  }

  renderTableBody() {
    const tbody = this.createElement('tbody');

    const paginatedData = this.getPaginatedData();

    if (paginatedData.length === 0) {
      const tr = this.createElement('tr');
      const td = this.createElement('td', {
        colspan: this.options.columns.length,
        className: 'text-center text-muted'
      });
      td.textContent = 'Brak danych';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return tbody;
    }

    paginatedData.forEach(row => {
      const tr = this.renderTableRow(row);
      tbody.appendChild(tr);
    });

    return tbody;
  }

  renderTableRow(row) {
    const tr = this.createElement('tr');

    this.options.columns.forEach(column => {
      const td = this.createElement('td');

      if (column.render) {
        const content = column.render(row[column.key], row);
        if (typeof content === 'string') {
          td.innerHTML = content;
        } else if (content instanceof HTMLElement) {
          td.appendChild(content);
        }
      } else {
        td.textContent = row[column.key] || '';
      }

      tr.appendChild(td);
    });

    return tr;
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredData.length / this.options.pageSize);

    const paginationWrapper = this.createElement('div', {
      className: 'datatable-pagination d-flex justify-content-between align-items-center mt-3'
    });

    // Info
    const info = this.createElement('div', {
      className: 'text-muted'
    });
    const start = (this.currentPage - 1) * this.options.pageSize + 1;
    const end = Math.min(this.currentPage * this.options.pageSize, this.filteredData.length);
    info.textContent = `Wyświetlanie ${start}-${end} z ${this.filteredData.length}`;
    paginationWrapper.appendChild(info);

    // Pagination controls
    const pagination = this.createElement('nav');
    const ul = this.createElement('ul', {
      className: 'pagination mb-0'
    });

    // Previous button
    const prevLi = this.createElement('li', {
      className: `page-item ${this.currentPage === 1 ? 'disabled' : ''}`
    });
    const prevLink = this.createElement('a', {
      className: 'page-link',
      href: '#'
    });
    prevLink.textContent = 'Poprzednia';
    prevLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage > 1) {
        this.currentPage--;
        this.update();
      }
    });
    prevLi.appendChild(prevLink);
    ul.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= this.currentPage - 1 && i <= this.currentPage + 1)
      ) {
        const li = this.createElement('li', {
          className: `page-item ${i === this.currentPage ? 'active' : ''}`
        });
        const link = this.createElement('a', {
          className: 'page-link',
          href: '#'
        });
        link.textContent = i;
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.currentPage = i;
          this.update();
        });
        li.appendChild(link);
        ul.appendChild(li);
      } else if (
        i === this.currentPage - 2 ||
        i === this.currentPage + 2
      ) {
        const li = this.createElement('li', {
          className: 'page-item disabled'
        });
        const link = this.createElement('span', {
          className: 'page-link'
        });
        link.textContent = '...';
        li.appendChild(link);
        ul.appendChild(li);
      }
    }

    // Next button
    const nextLi = this.createElement('li', {
      className: `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`
    });
    const nextLink = this.createElement('a', {
      className: 'page-link',
      href: '#'
    });
    nextLink.textContent = 'Następna';
    nextLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.update();
      }
    });
    nextLi.appendChild(nextLink);
    ul.appendChild(nextLi);

    pagination.appendChild(ul);
    paginationWrapper.appendChild(pagination);

    return paginationWrapper;
  }

  async update() {
    if (!this.element) return;

    // Re-render table
    const newElement = this.render();
    this.element.replaceWith(newElement);
    this.element = newElement;
  }

  applyFilters() {
    let data = [...this.options.data];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      data = data.filter(row => {
        return this.options.columns.some(column => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(query);
        });
      });
    }

    // Sort
    if (this.sortColumn) {
      data.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];

        if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.filteredData = data;
    this.currentPage = 1;
    this.update();
  }

  toggleSort(columnKey) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  getPaginatedData() {
    const start = (this.currentPage - 1) * this.options.pageSize;
    const end = start + this.options.pageSize;
    return this.filteredData.slice(start, end);
  }

  setData(data) {
    this.options.data = data;
    this.applyFilters();
  }

  refresh() {
    this.applyFilters();
  }
}

// Export
window.DataTable = DataTable;
