"use client"
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BlogList } from "@/components/blog-list";
import TitleBar from "@/components/titlebar";
import { Pagination } from "@/components/ui/pagination";
import { Footer } from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, Grid3X3, List, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const POSTS_PER_PAGE = 8;

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  const handleDataLoaded = (count: number) => {
    setTotalPosts(count);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Stable event handlers to prevent re-renders
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSortChange = useCallback((newSort: "newest" | "oldest" | "popular") => {
    setSortBy(newSort);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const handleViewModeChange = useCallback((newMode: "grid" | "list") => {
    setViewMode(newMode);
  }, []);

  return (
    <>
    <main className="flex-1 pt-2">
      <TitleBar title="Blog"/>
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Blog
              </div>
              <h1 className="text-xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                Latest Stories
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Thoughts, stories, and ideas from the things that spark my curiosity.
              </p>
            </div>
          </motion.div>

          {/* Modern Controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-16"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-4xl mx-auto">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-11 h-12 text-sm rounded-full border-border bg-muted/30 hover:bg-muted/50 focus:bg-background transition-colors"
                />
              </div>

              {/* Controls Group */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <DropdownMenu onOpenChange={setIsDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 px-4 rounded-full border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm font-medium">
                        {sortBy === "newest" ? "Newest" : sortBy === "oldest" ? "Oldest" : "Popular"}
                      </span>
                      <ChevronDown 
                        className={`ml-2 w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          isDropdownOpen ? 'rotate-180' : 'rotate-0'
                        }`} 
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[140px] rounded-xl">
                    <DropdownMenuItem 
                      onClick={() => handleSortChange("newest")}
                      className="rounded-lg cursor-pointer"
                    >
                      <Check className={`mr-2 h-4 w-4 ${sortBy === "newest" ? "opacity-100" : "opacity-0"}`} />
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortChange("oldest")}
                      className="rounded-lg cursor-pointer"
                    >
                      <Check className={`mr-2 h-4 w-4 ${sortBy === "oldest" ? "opacity-100" : "opacity-0"}`} />
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleSortChange("popular")}
                      className="rounded-lg cursor-pointer"
                    >
                      <Check className={`mr-2 h-4 w-4 ${sortBy === "popular" ? "opacity-100" : "opacity-0"}`} />
                      Popular
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Toggle */}
                <div className="flex items-center bg-muted/30 rounded-full p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewModeChange("grid")}
                    className={`h-10 w-10 p-0 rounded-full transition-all ${
                      viewMode === "grid" ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewModeChange("list")}
                    className={`h-10 w-10 p-0 rounded-full transition-all ${
                      viewMode === "list" ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted/50'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          <BlogList 
            currentPage={currentPage} 
            onDataLoaded={handleDataLoaded}
            searchTerm={searchTerm}
            sortBy={sortBy}
            viewMode={viewMode}
            showControls={false}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
    </main>
      <div className="h-3">
    <Footer />
    </div>
    </>
  );
}
