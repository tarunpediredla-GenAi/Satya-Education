import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BookCoverArt } from '../components/BookCoverArt';

export const BooksPage: React.FC = () => {
  const { books, addToCart } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCategory = searchParams.get('category') || 'All';
  const initialQuery = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [maxPriceInr, setMaxPriceInr] = useState<number>(1500);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'title'>('featured');

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('q');
    if (cat) setSelectedCategory(cat);
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  const activeBooks = useMemo(() => books.filter((b) => !b.archived), [books]);

  const subcategories = useMemo(() => {
    const pool =
      selectedCategory === 'All'
        ? activeBooks
        : activeBooks.filter((b) => b.category === selectedCategory);
    return ['All', ...Array.from(new Set(pool.map((b) => b.subcategory)))];
  }, [activeBooks, selectedCategory]);

  const filteredBooks = useMemo(() => {
    return activeBooks
      .filter((book) => {
        if (selectedCategory !== 'All' && book.category !== selectedCategory) return false;
        if (selectedSubcategory !== 'All' && book.subcategory !== selectedSubcategory) return false;
        if (book.ebookPriceInr > maxPriceInr && book.priceInr > maxPriceInr) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.subcategory.toLowerCase().includes(q) ||
            book.description.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.ebookPriceInr - b.ebookPriceInr;
        if (sortBy === 'price-desc') return b.ebookPriceInr - a.ebookPriceInr;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0);
      });
  }, [activeBooks, selectedCategory, selectedSubcategory, maxPriceInr, searchQuery, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#0B192C]/10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-mono-tabular uppercase text-[#0D6E6E]">
            Satya Press Bookstore · {activeBooks.length} Titles in Print & Digital
          </p>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#0B192C] mt-1">
            Technology & Literary Books
          </h1>
          <p className="text-sm text-[#0B192C]/75 mt-2 max-w-2xl">
            Explore 20 deep engineering manuals and 20 timeless anthologies of stories, history, and wisdom fables. Available as clothbound hardcovers or instant downloadable e-books.
          </p>
        </div>

        {/* Category Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-[#EAE4D7] rounded-xl self-start">
          {['All', 'Technology', 'Stories & Literature'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#0B192C] text-[#FAF8F5] shadow-xs'
                  : 'text-[#0B192C]/75 hover:text-[#0B192C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-[#0B192C]/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-4">
          <label htmlFor="book-search" className="block text-xs font-semibold text-[#0B192C] mb-1.5">
            Search Title, Author, or Topic
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#0B192C]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="book-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Python, Django, Banyan, Ramanujan..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="book-subcat" className="block text-xs font-semibold text-[#0B192C] mb-1.5">
            Subject / Genre
          </label>
          <select
            id="book-subcat"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
          >
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <label htmlFor="book-price-range" className="block text-xs font-semibold text-[#0B192C] mb-1.5 font-mono-tabular">
            Max Price: ₹{maxPriceInr}
          </label>
          <input
            id="book-price-range"
            type="range"
            min={200}
            max={1500}
            step={50}
            value={maxPriceInr}
            onChange={(e) => setMaxPriceInr(Number(e.target.value))}
            className="w-full accent-[#0D6E6E]"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="book-sort" className="block text-xs font-semibold text-[#0B192C] mb-1.5">
            Sort By
          </label>
          <select
            id="book-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[#0B192C]/20 bg-[#FAF8F5]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="title">Title: A to Z</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#0B192C]/70 font-mono-tabular">
        <span>Showing {filteredBooks.length} of {activeBooks.length} books</span>
        {(selectedCategory !== 'All' || selectedSubcategory !== 'All' || searchQuery) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSubcategory('All');
              setSearchQuery('');
              setMaxPriceInr(1500);
              setSearchParams({});
            }}
            className="text-[#0D6E6E] font-semibold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Book Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white border border-[#0B192C]/10 text-center space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-[#0D6E6E] mx-auto" />
          <h2 className="font-serif-display text-lg font-semibold text-[#0B192C]">
            No books match your current filters
          </h2>
          <p className="text-sm text-[#0B192C]/70">
            Try increasing the maximum price slider or clearing your search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="rounded-xl bg-white border border-[#0B192C]/10 p-4 flex flex-col justify-between transition-transform hover:-translate-y-0.5"
            >
              <div>
                <Link to={`/books/${book.id}`} className="block mb-4">
                  <BookCoverArt book={book} className="h-64 w-full" />
                </Link>
                <div className="text-xs text-[#0B192C]/60 font-mono-tabular mb-1">
                  {book.category} · {book.subcategory}
                </div>
                <Link to={`/books/${book.id}`}>
                  <h2 className="font-serif-display text-base font-semibold text-[#0B192C] hover:text-[#0D6E6E] line-clamp-2">
                    {book.title}
                  </h2>
                </Link>
                <p className="text-xs text-[#0B192C]/70 mt-1">{book.author}</p>
                <p className="text-xs text-[#0B192C]/60 mt-2 line-clamp-2 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#0B192C]/10 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#0B192C]/60">E-Book: </span>
                    <span className="text-sm font-bold font-mono-tabular text-[#0B192C]">
                      ₹{book.ebookPriceInr}
                    </span>
                  </div>
                  {book.format !== 'E-Book' && (
                    <div>
                      <span className="text-xs text-[#0B192C]/60">Print: </span>
                      <span className="text-sm font-semibold font-mono-tabular text-[#0B192C]">
                        ₹{book.priceInr}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono-tabular text-[#0B192C]/65">
                  <span>{book.pages} pages</span>
                  <span>
                    {book.format === 'E-Book'
                      ? 'Digital Only'
                      : book.stock > 0
                      ? `In Stock (${book.stock})`
                      : 'Out of Stock (Print)'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addToCart({
                        cartItemId: `${book.id}_E-Book`,
                        itemId: book.id,
                        itemType: 'ebook',
                        title: `${book.title} (E-Book)`,
                        subtitleOrAuthor: book.author,
                        unitPriceInr: book.ebookPriceInr,
                      })
                    }
                    className="py-2 px-2.5 rounded-lg bg-[#0D6E6E] text-white text-xs font-semibold hover:bg-[#0B192C] transition-colors whitespace-nowrap shrink-0"
                  >
                    + E-Book
                  </button>
                  <Link
                    to={`/books/${book.id}`}
                    className="py-2 px-2.5 rounded-lg border border-[#0B192C]/20 text-[#0B192C] text-xs font-semibold text-center hover:bg-[#FAF8F5] transition-colors whitespace-nowrap shrink-0"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
