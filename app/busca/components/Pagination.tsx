"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

/**
 * Simple pagination component. Renders a previous/next button and a row of
 * numbered buttons. When the total number of pages is large, you might
 * want to limit the visible page numbers and use ellipsis. For this
 * example we render all pages to keep the component straightforward.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handleChange = (page: number) => {
    if (onPageChange) onPageChange(page);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
      </Button>
      <div className="flex gap-1">
        {pages.map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => handleChange(page)}
          >
            {page}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Próximo <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
