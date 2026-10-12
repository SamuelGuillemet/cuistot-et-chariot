import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  type ColumnDef,
  type ColumnVisibilityState,
  flexRender,
  type PaginationState,
  sortFn_text,
  type SortingState,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { useState } from 'react';
import { DataTablePagination } from '@/components/table/data-table-pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const productTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: { text: sortFn_text },
});

export type ProductTableFeatures = typeof productTableFeatures;

const getEmptyRowCount = (
  pagination: boolean,
  paginationState: PaginationState,
  rowsLength: number,
  totalRows: number,
) => {
  if (!pagination) return 0;
  if (totalRows < paginationState.pageSize) return 0;
  if (rowsLength >= paginationState.pageSize) return 0;

  return paginationState.pageSize - rowsLength;
};

interface DataTableProps<TData extends { _id: string | number }> {
  columns: ColumnDef<ProductTableFeatures, TData>[];
  data: TData[];
  pagination?: boolean;
  defaultSorting?: SortingState;
  /** Column ids hidden below the `md` breakpoint. */
  hideOnMobile?: string[];
}

export function DataTable<TData extends { _id: string | number }>({
  columns,
  data,
  pagination = true,
  defaultSorting = [{ id: '_id', desc: true }],
  hideOnMobile = [],
}: Readonly<DataTableProps<TData>>) {
  const columnVisibility: ColumnVisibilityState = { _id: false };
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useTable({
    features: productTableFeatures,
    sortDescFirst: true,
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        ...paginationState,
        pageSize: pagination ? paginationState.pageSize : data.length || 1,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: setPaginationState,
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const emptyRowCount = getEmptyRowCount(pagination, paginationState, rows.length, data.length);

  console.log(emptyRowCount);

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className={
                        hideOnMobile.includes(header.column.id) ? 'max-md:hidden' : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow className={pagination ? 'h-14' : undefined}>
                <TableCell colSpan={columns.length - 1} className="text-center">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.id} className={pagination ? 'h-14' : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={hideOnMobile.includes(cell.column.id) ? 'max-md:hidden' : undefined}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {Array.from({ length: emptyRowCount }, (_, index) => (
              <TableRow
                key={`empty-${index}`}
                aria-hidden
                className="h-14 hover:bg-transparent border-b-transparent"
              >
                <TableCell colSpan={columns.length - 1} />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}
