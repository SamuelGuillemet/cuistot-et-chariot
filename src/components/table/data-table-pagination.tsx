import type { ReactTable } from '@tanstack/react-table';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import type { ProductTableFeatures } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData extends Record<string, unknown>> {
  table: ReactTable<ProductTableFeatures, TData>;
}

export function DataTablePagination<TData extends Record<string, unknown>>({
  table,
}: Readonly<DataTablePaginationProps<TData>>) {
  return (
    <div className="flex flex-wrap justify-end items-center gap-2 px-2">
      <div className="flex flex-wrap items-center gap-x-6 lg:gap-x-8">
        <div className="hidden md:flex items-center gap-2">
          <p className="font-medium text-sm">Lignes par page</p>
          <Select
            items={[1, 2, 10, 20, 30, 40, 50].map((pageSize) => ({
              value: `${pageSize}`,
              label: `${pageSize}`,
            }))}
            value={`${table.state.pagination.pageSize}`}
            onValueChange={(value) => {
              if (value !== null) table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue placeholder={table.state.pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="bottom">
              {[1, 2, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-center items-center w-25 font-medium text-sm">
          Page {table.state.pagination.pageIndex + 1} sur {Math.max(table.getPageCount(), 1)}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Première page</span>
            <ChevronsLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Page précédente</span>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Page suivante</span>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Dernière page</span>
            <ChevronsRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
